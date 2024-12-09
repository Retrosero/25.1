import { Minus, Plus } from 'lucide-react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityInput({ value, onChange, min = 0, max }: QuantityInputProps) {
  const handleChange = (newValue: number) => {
    if (newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => handleChange(value - 1)}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || min;
          handleChange(newValue);
        }}
        className="w-12 sm:w-16 px-2 h-8 mx-1 text-center rounded border border-gray-200 dark:border-gray-700"
        min={min}
        max={max}
      />
      <button
        onClick={() => handleChange(value + 1)}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
        disabled={max !== undefined && value >= max}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}