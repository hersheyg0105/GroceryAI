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

    const systemPrompt = `You are a grocery categorization assistant expert. Categorize these grocery items into appropriate categories. 
                        Every single input item MUST appear exactly once in the output, with no items omitted or added. 

                        Use these categories: snacks, beverages, fruits, vegetables, meats, dairy, pantry, condiments, baking, breakfast, frozen, household.
                        You are not limited to these, you can create others you think fit also. No items will be given category other or miscellaneous.
                        
                        - Dairy includes all milk-based products such as milk, cheese, yogurt, paneer, heavy cream, and butter.
                        - Pantry items are typically dry, shelf-stable goods such as grains, flour, rice, pasta, and canned goods.
                        - Do NOT classify dairy products (like paneer) under pantry. It must always go under dairy.

                        If an item is ambiguous, categorize it based on its primary ingredient. 
                        If needed, create additional categories, but **never use 'other' or 'miscellaneous'**.`;

    const userPrompt = `Categorize these grocery items into appropriate categories. Input items: ${items.join('\n')}`;

    const assistantPrompt = `Ensure that every new category starts on a new line with a blank line before it. 
                          Do not put hyphens or bullet points before category names, only before the items.
                          The first letter of each category name must be returned capitalized.
                          All items must be lowercase. If an item is misspelled, correct it.
                          Do not assume items belong to 'meats' unless explicitly stated (e.g., chicken, beef, pork).
                          If an item is commonly stored in multiple categories, default to the most logical category (e.g., 'beans' should be under 'pantry', not meats).
                          
                          **STRICT RULE: No category should appear more than once.** 
                          Each category should be written on a new line without any symbols or dashes.
                          Under each category, list the items with a hyphen before them.
                          There must be a blank line between each category.
                          DO NOT add extra symbols like "---" or colons (":").
                          DO NOT list categories separately before their items.

                          A correct content output looks like: 
                          "CategoryName1\n" + "item1" + "item2" + "\n" + "CategoryName2\n" + "item3" + "item3" + "\n" ... and so forth


                          Before finalizing the response:
                          - **First, list all the categories needed.**
                          - **Then, place each item into its correct category.**
                          - **Ensure all items for the same category are grouped together.**
                          - **Do a final check to confirm that each category appears exactly once.**`;


    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
        {
          role: 'assistant',
          content: assistantPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent categorization
    });

    console.log()
    console.log("response: ", response);

    const categorizedText = response.choices[0].message.content;
    console.log("response.choices[0]: ", response.choices[0]);
    console.log("categorizedText: ", categorizedText)

    if (!categorizedText) {
      throw new Error('Failed to retrieve categorized text from the response.');
    }

    const categoriesMap = new Map(); // Use a Map to store categories without duplicates

    categorizedText
      .split('\n\n') // Split by blank lines between categories
      .filter(section => section.trim()) // Remove empty sections
      .forEach(section => {
        const lines = section.split('\n').filter(line => line.trim());
        const categoryName = lines[0].replace(':', '').replace(/-/g, '').trim();
        const items = lines.slice(1)
          .map(item => item.replace(/-/g, '').trim()) // Remove hyphens from items
          .filter(item => item); // Remove empty items

        if (categoriesMap.has(categoryName)) {
          // If the category already exists, merge the new items into it
          categoriesMap.get(categoryName).push(...items);
        } else {
          // Otherwise, create a new category
          categoriesMap.set(categoryName, items);
        }
      });

    // Convert Map to an array of objects
    const categories = Array.from(categoriesMap, ([name, items]) => ({ name, items }));

    console.log(categories);

    // Verify all input items are present in the output
    const outputItems = categories.flatMap(cat => cat.items);
    console.log("outputItems: ", outputItems)
    const missingItems = items.filter(item => !outputItems.includes(item));
    console.log("missingItems: ", missingItems)

    // if (missingItems.length > 0) {
    //   // If any items are missing, add them to a "miscellaneous" category
    //   categories.push({
    //     name: 'miscellaneous',
    //     items: missingItems
    //   });
    // }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to categorize items' },
      { status: 500 }
    );
  }
}