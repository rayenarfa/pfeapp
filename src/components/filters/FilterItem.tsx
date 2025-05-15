import React from "react";

interface FilterItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

const FilterItem: React.FC<FilterItemProps> = ({
  label,
  checked,
  onChange,
  count,
}) => (
  <div className="flex items-center justify-between py-1">
    <label className="flex items-center cursor-pointer group">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
        checked={checked}
        onChange={onChange}
      />
      <span className="ml-2 text-sm text-gray-700 group-hover:text-indigo-600">
        {label}
      </span>
    </label>
    {count !== undefined && (
      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
        {count}
      </span>
    )}
  </div>
);

export default FilterItem;
