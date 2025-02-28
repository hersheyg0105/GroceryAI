'use client';

import { useState } from 'react';

interface Category {
  name: string;
  items: string[];
}

interface GroceryOutputProps {
  categories: Category[];
}

export const GroceryOutput: React.FC<GroceryOutputProps> = ({ categories }) => {
  if (!categories || !Array.isArray(categories)) {
    return (
      <div className="text-center text-gray-500">
        Categorized groceries will appear here
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category, index) => (
        <div key={index}>
          <h3 className="font-semibold text-gray-700 mb-1">{category.name}</h3>
          <ul className="space-y-0.5">
            {category.items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-600">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {(!categories || categories.length === 0) && (
        <div className="text-center text-gray-500">
          Categorized groceries will appear here
        </div>
      )}
    </div>
  );
};
