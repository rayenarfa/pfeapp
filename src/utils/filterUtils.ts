import { Product } from "../types/product";

// Debounce helper function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers for price ranges
export const savePriceRangeToStorage = (
  category: string | undefined | null,
  range: [number, number]
) => {
  try {
    localStorage.setItem(
      `priceRange_${category || "all"}`,
      JSON.stringify(range)
    );
  } catch (error) {
    console.error("Error saving price range to localStorage:", error);
  }
};

export const loadPriceRangeFromStorage = (
  category: string | undefined | null
): [number, number] | null => {
  try {
    const savedRange = localStorage.getItem(`priceRange_${category || "all"}`);
    if (savedRange) {
      return JSON.parse(savedRange) as [number, number];
    }
  } catch (error) {
    console.error("Error loading price range from localStorage:", error);
  }
  return null;
};

// Sort products function
export const sortProducts = (
  productsToSort: Product[],
  sortingMethod: string
) => {
  return [...productsToSort].sort((a, b) => {
    const aPrice =
      a.discount && a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
    const bPrice =
      b.discount && b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;

    switch (sortingMethod) {
      case "price-low-high":
        return aPrice - bPrice;
      case "price-high-low":
        return bPrice - aPrice;
      case "name-a-z":
        return a.name.localeCompare(b.name);
      case "name-z-a":
        return b.name.localeCompare(a.name);
      case "newest": {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      }
      case "discount": {
        const aDiscount = a.discount || 0;
        const bDiscount = b.discount || 0;
        return bDiscount - aDiscount;
      }
      default: // Featured - could be based on popularity or manual selection
        return 0;
    }
  });
};
