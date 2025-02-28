'use client';

import { useState, KeyboardEvent } from 'react';

interface GroceryInputProps {
  onItemsChange: (items: string[]) => void;
}

export const GroceryInput: React.FC<GroceryInputProps> = ({ onItemsChange }) => {
  const [items, setItems] = useState<string[]>(['']); // Start with one empty item

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only add new line if current line is not empty
      if (e.currentTarget.value.trim()) {
        const newItems = [...items];
        newItems.splice(index + 1, 0, ''); // Insert new empty item after current
        setItems(newItems);
        // Notify parent of changes (excluding empty items)
        onItemsChange(newItems.filter(item => item.trim()));
        // Focus the new input after render
        setTimeout(() => {
          const nextInput = document.getElementById(`grocery-item-${index + 1}`);
          nextInput?.focus();
        }, 0);
      }
    } else if (e.key === 'Backspace' && !e.currentTarget.value && items.length > 1) {
      // Remove empty line on backspace if it's not the last remaining line
      e.preventDefault();
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      // Notify parent of changes (excluding empty items)
      onItemsChange(newItems.filter(item => item.trim()));
      // Focus the previous input
      setTimeout(() => {
        const prevInput = document.getElementById(`grocery-item-${index - 1}`);
        prevInput?.focus();
      }, 0);
    }
  };

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    // Notify parent of changes (excluding empty items)
    onItemsChange(newItems.filter(item => item.trim()));
  };

  const handleLineClick = (index: number) => {
    const input = document.getElementById(`grocery-item-${index}`);
    input?.focus();
  };

  return (
    <div className="space-y-0.5">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="flex items-center cursor-text" 
          onClick={() => handleLineClick(index)}
        >
          <span className="w-6 text-gray-500 text-right pr-1">{index + 1}.</span>
          <input
            id={`grocery-item-${index}`}
            type="text"
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-0.5"
            placeholder={index === 0 ? "Enter a grocery item..." : ""}
          />
        </div>
      ))}
    </div>
  );
};
