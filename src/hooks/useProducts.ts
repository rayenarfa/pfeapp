import { useState, useEffect } from "react";
import { db } from "../config/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "sonner";
import { GiftCard, initialGiftCardValues } from "../types/product";

export interface UseProductsReturn {
  products: GiftCard[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterBrand: string;
  setFilterBrand: (brand: string) => void;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
  formValues: Omit<GiftCard, "id" | "createdAt" | "updatedAt">;
  setFormValues: (
    values: Omit<GiftCard, "id" | "createdAt" | "updatedAt">
  ) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  categories: string[];
  brands: string[];
  filteredProducts: GiftCard[];
  hasFilters: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: () => Promise<boolean>;
  updateProduct: () => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  resetFormValues: () => void;
  clearFilters: () => void;
}

export const useProducts = (): UseProductsReturn => {
  // State for products data
  const [products, setProducts] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and view state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Form state
  const [formValues, setFormValues] = useState<
    Omit<GiftCard, "id" | "createdAt" | "updatedAt">
  >(initialGiftCardValues);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Computed properties
  const categories = [...new Set(products.map((card) => card.category))].filter(
    Boolean
  );
  const brands = [...new Set(products.map((card) => card.brand))].filter(
    Boolean
  );
  const hasFilters = !!(searchQuery || filterCategory || filterBrand);

  // Data fetching
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productsQuery = query(collection(db, "products"), orderBy("name"));
      const querySnapshot = await getDocs(productsQuery);
      const productsList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as GiftCard)
      );
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  // Form input handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let numericValue;

    if (type === "number") {
      numericValue = value === "" ? 0 : Number(value);

      // Special handling for discount field
      if (name === "discount" && (numericValue === 0 || value === "")) {
        setFormValues((prev) => ({
          ...prev,
          [name]: undefined,
        }));
        return;
      }
    } else {
      numericValue = value;
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  // Reset form values
  const resetFormValues = () => {
    setFormValues(initialGiftCardValues);
    setEditingProductId(null);
  };

  // CRUD operations
  const addProduct = async (): Promise<boolean> => {
    try {
      // Process form values before sending to database
      const processedFormValues = {
        ...formValues,
        discount:
          formValues.discount === 0 || formValues.discount === undefined
            ? null
            : formValues.discount,
      };

      const productData = {
        ...processedFormValues,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "products"), productData);

      setProducts((prev) => [
        ...prev,
        { ...processedFormValues, id: docRef.id } as GiftCard,
      ]);

      toast.success("Product added successfully");
      resetFormValues();
      return true;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      return false;
    }
  };

  const updateProduct = async (): Promise<boolean> => {
    if (!editingProductId) return false;

    try {
      // Process form values before sending to database
      const processedFormValues = {
        ...formValues,
        discount:
          formValues.discount === 0 || formValues.discount === undefined
            ? null
            : formValues.discount,
      };

      const updateData = {
        ...processedFormValues,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "products", editingProductId), updateData);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProductId
            ? { ...product, ...processedFormValues }
            : product
        )
      );

      toast.success("Product updated successfully");
      resetFormValues();
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "products", id));

      setProducts((prev) => prev.filter((product) => product.id !== id));

      toast.success("Product deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      return false;
    }
  };

  // Filter products based on search query and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    const matchesCategory = filterCategory
      ? product.category === filterCategory
      : true;
    const matchesBrand = filterBrand ? product.brand === filterBrand : true;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterBrand("");
  };

  return {
    products,
    isLoading,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterBrand,
    setFilterBrand,
    viewMode,
    setViewMode,
    formValues,
    setFormValues,
    editingProductId,
    setEditingProductId,
    categories,
    brands,
    filteredProducts,
    hasFilters,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    handleInputChange,
    resetFormValues,
    clearFilters,
  };
};

export default useProducts;
