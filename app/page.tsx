'use client';

import { useState } from 'react';
import { GroceryInput } from './components/GroceryInput';
import { GroceryOutput } from './components/GroceryOutput';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { Donations } from './components/Donations';

export default function Home() {
  const [groceryItems, setGroceryItems] = useState<string[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; items: string[] }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; details?: unknown } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCategorize = async () => {
    // Reset states
    setError(null);
    setCopySuccess(false);
    
    // Filter out empty items
    const itemsToSend = groceryItems.filter(item => item.trim());
    
    if (itemsToSend.length === 0) {
      setError({ message: 'Please enter at least one item' });
      return;
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsToSend }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: { error: { message: string } } = await response.json();
        throw new Error(errorData.error.message || 'Failed to categorize items', {
          cause: errorData.error
        });
      }

      const data: { categories: Array<{ name: string; items: string[] }> } = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError({ 
            message: 'Request timed out. Please try again.',
            code: 'TIMEOUT'
          });
        } else {
          setError({
            message: err.message,
            ...(err.cause as { code?: string; details?: unknown })
          });
        }
      } else {
        setError({ 
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? err : undefined
        });
      }
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!categories.length) return;
  
    try {
      // Properly format the text
      const text = categories
        .map(category => `${category.name}:\n${category.items.map(item => `- ${item}`).join('\n')}`)
        .join('\n\n');
  
      // Force plain text by removing potential URL encodings
      const plainText = decodeURIComponent(text); // Decode any accidental encodings
  
      // Copy using Clipboard API
      await navigator.clipboard.writeText(plainText);
  
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError({ 
        message: 'Failed to copy to clipboard',
        details: process.env.NODE_ENV === 'development' ? err : undefined
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Grocery Categorizer</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 bg-white rounded-lg shadow-md mb-8">
          {/* Left Column - Input Section */}
          <ErrorBoundary>
            <section className="relative">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Input Section</h2>
                <div className="min-h-[400px] border border-gray-200 rounded-lg p-4">
                  <GroceryInput onItemsChange={setGroceryItems} />
                </div>
              </div>
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-[1px] bg-gray-200" />
            </section>
          </ErrorBoundary>

          {/* Button for Mobile View */}
          <div className="flex justify-center mt-6 md:hidden mb-6">
            <button
              onClick={handleCategorize}
              disabled={isLoading || groceryItems.length === 0}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Categorizing...' : 'Categorize Groceries'}
            </button>
          </div>

          {/* Right Column - Output Section */}
          <ErrorBoundary>
            <section className="border-t md:border-t-0 pb-6 md:pb-0">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Output Section</h2>
                  <button
                    onClick={handleCopy}
                    disabled={isLoading || categories.length === 0}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="text-red-500 text-center">
                      <p className="font-semibold">{error.message}</p>
                      {error.code && (
                        <p className="text-sm mt-1 text-red-400">Error code: {error.code}</p>
                      )}                      
                    </div>
                  ) : (
                    <GroceryOutput categories={categories} />
                  )}
                </div>
              </div>
            </section>
          </ErrorBoundary>
        </div>

        {/* Button for Desktop View */}
        <div className="hidden md:flex justify-center mt-6">
          <button
            onClick={handleCategorize}
            disabled={isLoading || groceryItems.length === 0}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Categorizing...' : 'Categorize Groceries'}
          </button>
        </div>

        <div className="mt-12">
          <Donations />
        </div>
      </div>
    </main>
  );
}
