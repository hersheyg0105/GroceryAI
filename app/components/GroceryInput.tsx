'use client';

import { useState, KeyboardEvent, useCallback } from 'react';

interface GroceryInputProps {
  onItemsChange: (items: string[]) => void;
  maxItems?: number;
  maxLength?: number;
}

interface ValidationError {
  index: number;
  message: string;
}

export const GroceryInput: React.FC<GroceryInputProps> = ({ 
  onItemsChange, 
  maxItems = 50,
  maxLength = 100 
}) => {
  const [items, setItems] = useState<string[]>(['']); // Start with one empty item
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [lastKeyPress, setLastKeyPress] = useState<number>(0);

  const validateItem = useCallback((value: string, index: number): ValidationError | null => {
    if (value.length > maxLength) {
      return {
        index,
        message: `Item exceeds maximum length of ${maxLength} characters`
      };
    }
    if (/[<>]/.test(value)) {
      return {
        index,
        message: 'Item contains invalid characters (< or >)'
      };
    }
    return null;
  }, [maxLength]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Prevent rapid key presses that could cause performance issues
    const now = Date.now();
    if (now - lastKeyPress < 50) { // 50ms debounce
      e.preventDefault();
      return;
    }
    setLastKeyPress(now);

    if (e.key === 'Enter') {
      e.preventDefault();
      if (items.length >= maxItems) {
        setValidationErrors([{
          index,
          message: `Maximum ${maxItems} items allowed`
        }]);
        return;
      }
      // Only add new line if current line is not empty
      if (e.currentTarget.value.trim()) {
        const newItems = [...items];
        newItems.splice(index + 1, 0, ''); // Insert new empty item after current
        setItems(newItems);
        // Notify parent of changes (excluding empty items)
        onItemsChange(newItems.filter(item => item.trim()));
        // Clear validation errors
        setValidationErrors([]);
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
      // Clear validation errors
      setValidationErrors([]);
      // Focus the previous input
      setTimeout(() => {
        const prevInput = document.getElementById(`grocery-item-${index - 1}`);
        prevInput?.focus();
      }, 0);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Validate the new value
    const error = validateItem(value, index);
    if (error) {
      setValidationErrors([error]);
      return;
    }

    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
    setValidationErrors([]);
    // Notify parent of changes (excluding empty items)
    onItemsChange(newItems.filter(item => item.trim()));
  };

  const handleLineClick = (index: number) => {
    const input = document.getElementById(`grocery-item-${index}`);
    input?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split(/\n/).map(line => line.trim()).filter(Boolean);
    
    if (items.length + lines.length - 1 > maxItems) {
      setValidationErrors([{
        index,
        message: `Pasting ${lines.length} items would exceed the maximum of ${maxItems} items`
      }]);
      return;
    }

    // Validate all pasted items
    const errors: ValidationError[] = [];
    lines.forEach((line, i) => {
      const error = validateItem(line, index + i);
      if (error) errors.push(error);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // If all validations pass, update the items
    const newItems = [
      ...items.slice(0, index),
      ...lines,
      ...items.slice(index + 1)
    ];
    setItems(newItems);
    onItemsChange(newItems.filter(item => item.trim()));
    setValidationErrors([]);
  };

  return (
    <div className="space-y-0.5">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="flex flex-col"
        >
          <div
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
              onPaste={(e) => handlePaste(e, index)}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-0.5"
              placeholder={index === 0 ? "Enter a grocery item..." : ""}
              aria-invalid={validationErrors.some(err => err.index === index)}
              maxLength={maxLength}
            />
          </div>
          {validationErrors.map((error, errorIndex) => 
            error.index === index && (
              <div 
                key={errorIndex}
                className="ml-6 text-sm text-red-500 mt-0.5"
                role="alert"
              >
                {error.message}
              </div>
            )
          )}
        </div>
      ))}
      {items.length >= maxItems && (
        <div className="text-sm text-amber-600 mt-2">
          Maximum number of items reached ({maxItems})
        </div>
      )}
    </div>
  );
};
