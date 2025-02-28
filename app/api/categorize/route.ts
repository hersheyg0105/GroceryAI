import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Custom error class for API-specific errors
class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Input validation
function validateInput(items: unknown): asserts items is string[] {
  if (!items) {
    throw new APIError('No items provided', 400, 'MISSING_ITEMS');
  }
  if (!Array.isArray(items)) {
    throw new APIError('Items must be an array', 400, 'INVALID_FORMAT');
  }
  if (items.length === 0) {
    throw new APIError('Please provide at least one item', 400, 'EMPTY_ITEMS');
  }
  if (items.length > 50) {
    throw new APIError('Maximum 50 items allowed', 400, 'TOO_MANY_ITEMS');
  }
  if (!items.every(item => typeof item === 'string')) {
    throw new APIError('All items must be strings', 400, 'INVALID_ITEM_TYPE');
  }
  if (!items.every(item => item.trim())) {
    throw new APIError('Empty or whitespace-only items are not allowed', 400, 'INVALID_ITEM_CONTENT');
  }
}

// Initialize OpenAI with error handling
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new APIError(
      'OpenAI API key not configured',
      500,
      'MISSING_API_KEY'
    );
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    // Initialize OpenAI
    const openai = initializeOpenAI();

    // Parse and validate request body
    let items: unknown;
    try {
      const body = await req.json();
      items = body.items;
    } catch (e) {
      throw new APIError('Invalid JSON in request body', 400, 'INVALID_JSON');
    }

    // Validate input
    validateInput(items);

    const prompt = `Categorize these grocery items into appropriate categories. Every single input item MUST appear exactly once in the output, with no items omitted or added. Use these categories: snacks, beverages, fruits, vegetables, meats, dairy, pantry, condiments, baking, breakfast, frozen, household.

Input items:
${items.join('\n')}

Format your response as a list of categories. Only include categories that have items. Keep the original item names exactly as provided. Each category should end with a blank line.`;

    // Make API call with timeout
    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful grocery categorization assistant. You must categorize every single input item, with no omissions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new APIError('Request timed out', 504, 'TIMEOUT')), 10000)
      )
    ]) as OpenAI.Chat.Completions.ChatCompletion;

    if (!response.choices[0]?.message?.content) {
      throw new APIError('No response from OpenAI', 500, 'EMPTY_RESPONSE');
    }

    const categorizedText = response.choices[0].message.content;
    
    // Parse the response into categories
    const categories = categorizedText
      .split('\n\n')
      .filter(section => section.trim())
      .map(section => {
        const [categoryName, ...items] = section.split('\n');
        return {
          name: categoryName.replace(':', ''),
          items: items
            .filter(item => item.startsWith('- '))
            .map(item => item.replace('- ', ''))
        };
      });

    // Verify all input items are present in the output
    const outputItems = categories.flatMap(cat => cat.items);
    const missingItems = items.filter(item => !outputItems.includes(item));

    if (missingItems.length > 0) {
      // If any items are missing, add them to a "miscellaneous" category
      categories.push({
        name: 'miscellaneous',
        items: missingItems
      });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error:', error);

    // Handle known API errors
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        },
        { status: error.status }
      );
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: {
            message: 'OpenAI API error',
            code: 'OPENAI_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          }
        },
        { status: error.status || 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        }
      },
      { status: 500 }
    );
  }
}
