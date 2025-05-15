import React, { useState, useEffect, useRef } from "react";

interface PriceRangeSliderProps {
  minPossible: number;
  maxPossible: number;
  currentMin: number;
  currentMax: number;
  onChange: (values: [number, number]) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPossible,
  maxPossible,
  currentMin,
  currentMax,
  onChange,
}) => {
  // State for the current values
  const [minValue, setMinValue] = useState(currentMin);
  const [maxValue, setMaxValue] = useState(currentMax);

  // References
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<"min" | "max" | null>(null);

  // Update local values when props change
  useEffect(() => {
    if (isDraggingRef.current === null) {
      setMinValue(currentMin);
      setMaxValue(currentMax);
    }
  }, [currentMin, currentMax]);

  // Calculate percentage for a value
  const getPercent = (value: number) => {
    return Math.max(
      0,
      Math.min(100, ((value - minPossible) / (maxPossible - minPossible)) * 100)
    );
  };

  // Handle mouse/touch down
  const handleStart =
    (handle: "min" | "max") => (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isDraggingRef.current = handle;
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);
    };

  // Handle mouse/touch move
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!sliderRef.current || !isDraggingRef.current) return;

    // Get position
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const position = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );

    // Calculate new value
    const newValue = Math.round(
      minPossible + position * (maxPossible - minPossible)
    );

    // Update the appropriate value
    if (isDraggingRef.current === "min") {
      setMinValue(Math.min(newValue, maxValue - 1));
    } else {
      setMaxValue(Math.max(newValue, minValue + 1));
    }
  };

  // Handle mouse/touch end
  const handleEnd = () => {
    if (isDraggingRef.current) {
      onChange([minValue, maxValue]);
      isDraggingRef.current = null;

      // Remove event listeners
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setMinValue(minPossible);
    setMaxValue(maxPossible);
    onChange([minPossible, maxPossible]);
  };

  // Apply current values
  const handleApply = () => {
    onChange([minValue, maxValue]);
  };

  // Calculate percentages
  const minPercentage = getPercent(minValue);
  const maxPercentage = getPercent(maxValue);

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Price Range</span>
        <button
          onClick={handleReset}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Reset
        </button>
      </div>

      {/* Price displays */}
      <div className="flex justify-between mb-4">
        <div className="px-2 py-1 bg-gray-100 rounded text-sm">
          TND {minValue}
        </div>
        <div className="px-2 py-1 bg-gray-100 rounded text-sm">
          TND {maxValue}
        </div>
      </div>

      {/* Slider */}
      <div ref={sliderRef} className="relative h-6 my-4 touch-none">
        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2" />

        {/* Active track */}
        <div
          className="absolute top-1/2 h-1 bg-indigo-600 rounded-full transform -translate-y-1/2"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />

        {/* Min handle */}
        <div
          role="slider"
          aria-valuemin={minPossible}
          aria-valuemax={maxPossible}
          aria-valuenow={minValue}
          className="absolute top-1/2 w-6 h-6 bg-white rounded-full border-2 border-indigo-600 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:shadow-md"
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleStart("min")}
          onTouchStart={handleStart("min")}
        />

        {/* Max handle */}
        <div
          role="slider"
          aria-valuemin={minPossible}
          aria-valuemax={maxPossible}
          aria-valuenow={maxValue}
          className="absolute top-1/2 w-6 h-6 bg-white rounded-full border-2 border-indigo-600 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:shadow-md"
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleStart("max")}
          onTouchStart={handleStart("max")}
        />
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={handleApply}
        disabled={minValue === currentMin && maxValue === currentMax}
        className={`mt-4 w-full py-2 px-4 rounded-md text-white text-sm font-medium 
          ${
            minValue === currentMin && maxValue === currentMax
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
      >
        Apply Filter
      </button>
    </div>
  );
};

export default PriceRangeSlider;
