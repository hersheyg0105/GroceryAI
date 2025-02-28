'use client';

import { useState } from 'react';
import { GroceryInput } from './components/GroceryInput';
import { GroceryOutput } from './components/GroceryOutput';

export default function Home() {
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; items: string[] }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCategorize = async () => {
    // Reset states
    setError(null);
    setCopySuccess(false);
    
    // Filter out empty items
    const itemsToSend = groceryItems.filter(item => item.trim());
    
    if (itemsToSend.length === 0) {
      setError('Please enter at least one item');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to categorize items');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!categories.length) return;

    const text = categories
      .map(category => `${category.name}:\n${category.items.map(item => `- ${item}`).join('\n')}`)
      .join('\n\n');

    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      },
      () => {
        setError('Failed to copy to clipboard');
      }
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Grocery Categorizer</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 bg-white rounded-lg shadow-md">
          {/* Left Column - Input Section */}
          <section className="relative">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Input Section</h2>
              <div className="min-h-[400px] border border-gray-200 rounded-lg p-4">
                <GroceryInput onItemsChange={setGroceryItems} />
              </div>
            </div>
            {/* Vertical divider - only visible on md and up screens */}
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[1px] bg-gray-200" />
          </section>

          {/* Right Column - Output Section */}
          <section className="border-t md:border-t-0">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Output Section</h2>
                <button
                  onClick={handleCopy}
                  className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                    />
                  </svg>
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="min-h-[400px] border border-gray-200 rounded-lg p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center">{error}</div>
                ) : (
                  <GroceryOutput categories={categories} />
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleCategorize}
            disabled={isLoading || groceryItems.length === 0}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Categorizing...' : 'Categorize Groceries'}
          </button>
        </div>
      </div>
    </main>
  );
}
