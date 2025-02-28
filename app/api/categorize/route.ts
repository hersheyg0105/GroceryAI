import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Please provide a non-empty array of items' },
        { status: 400 }
      );
    }

    const prompt = `You are a grocery categorization expert. Categorize these items into appropriate grocery store categories. Every item must appear exactly once in the output.

Input items:
${items.join('\n')}

Format your response as a list of categories. Only include categories that have items. Keep the original item names exactly as provided. Each category should end with a blank line.`;

    const response = await openai.chat.completions.create({
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
      temperature: 0.3, // Lower temperature for more consistent categorization
    });

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
    return NextResponse.json(
      { error: 'Failed to categorize items' },
      { status: 500 }
    );
  }
}
