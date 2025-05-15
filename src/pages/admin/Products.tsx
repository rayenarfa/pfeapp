import React, { useState } from "react";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
import { Plus } from "lucide-react";
import ProductFilters from "../../components/products/shop/ProductFilters";
import ProductGridView from "../../components/products/shop/ProductGridView";
import ProductListView from "../../components/products/shop/ProductListView";
import ProductForm from "../../components/products/admin/ProductForm";
import Modal from "../../components/ui/modals/Modal";
import ConfirmationModal from "../../components/ui/modals/ConfirmationModal";
import { useProducts } from "../../hooks/useProducts";
import { GiftCard, initialGiftCardValues } from "../../types/product";

// Main component
const ProductsDashboard = () => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(
    null
  );

  // Use our custom hook for managing products
  const {
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
    addProduct,
    updateProduct,
    deleteProduct,
    handleInputChange,
    resetFormValues,
    clearFilters,
  } = useProducts();

  // Modal handlers
  const openAddModal = () => {
    resetFormValues();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    resetFormValues();
    setIsAddModalOpen(false);
  };

  const openEditModal = (product: GiftCard) => {
    // Using the initialGiftCardValues as a base to ensure all required properties are set
    const updatedValues = {
      ...initialGiftCardValues,
      id: product.id, // Include the id to satisfy the GiftCard type
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      category: product.category,
      region: product.region,
      currency: product.currency,
      stock: product.stock,
      discount: product.discount ?? undefined,
      description: product.description || "",
    };
    setFormValues(updatedValues);
    setEditingProductId(product.id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    resetFormValues();
    setIsEditModalOpen(false);
  };

  const openDeleteDialog = (id: string) => {
    setProductToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setProductToDeleteId(null);
  };

  // Form submission handlers
  const handleAddProduct = async () => {
    const success = await addProduct();
    if (success) {
      closeAddModal();
    }
  };

  const handleUpdateProduct = async () => {
    const success = await updateProduct();
    if (success) {
      closeEditModal();
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDeleteId) return;

    const success = await deleteProduct(productToDeleteId);
    if (success) {
      closeDeleteDialog();
    }
  };

  // Render
  return (
    <AdminDashboardLayout>
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Gift Cards</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Add button */}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Product</span>
          </button>

          {/* View toggle */}
          <div className="flex rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <ProductFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        categories={categories}
        brands={brands}
        hasFilters={hasFilters}
        clearFilters={clearFilters}
      />

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Cards display - either grid or list view */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No gift cards found
              </h3>
              <p className="mt-2 text-gray-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Add a new gift card to get started."}
              </p>
              <div className="mt-6">
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus size={16} className="mr-2" />
                  Add Gift Card
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <ProductGridView
                  cards={filteredProducts}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                />
              )}

              {/* List View */}
              {viewMode === "list" && (
                <ProductListView
                  cards={filteredProducts}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={isAddModalOpen ? closeAddModal : closeEditModal}
        title={isAddModalOpen ? "Add Gift Card" : "Edit Gift Card"}
        onSubmit={isAddModalOpen ? handleAddProduct : handleUpdateProduct}
        submitLabel={isAddModalOpen ? "Add Card" : "Update Card"}
        size="lg"
      >
        <ProductForm
          values={{
            ...formValues,
            id: editingProductId || undefined,
          }}
          onChange={handleInputChange}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteProduct}
        title="Confirm Delete"
        message="Are you sure you want to delete this gift card? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />
    </AdminDashboardLayout>
  );
};

export default ProductsDashboard;
