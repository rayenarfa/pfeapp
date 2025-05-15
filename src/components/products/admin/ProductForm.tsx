import React from "react";
import { GiftCard } from "../../../types/product";
import { ChevronDown } from "lucide-react";
import ProductPreviewCard from "../../../components/products/shop/ProductPreviewCard";

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string | number;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  min?: number;
  options?: { value: string; label: string }[];
  rows?: number;
  required?: boolean;
  hint?: string;
  readOnly?: boolean;
}

const FormInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  min,
  options = [],
  rows,
  required = false,
  hint,
  readOnly,
}: FormInputProps) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1 items-center"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === "select" ? (
        <div className="relative">
          <select
            id={id}
            name={id}
            value={value.toString()}
            onChange={onChange}
            className="block w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors duration-200"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows || 3}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 resize-none transition-colors duration-200"
        />
      ) : (
        <div className="relative">
          {type === "number" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">#</span>
            </div>
          )}
          {type === "url" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          )}
          <input
            id={id}
            type={type}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            readOnly={readOnly}
            className={`block w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors duration-200 ${
              type === "number" || type === "url" ? "pl-8" : "px-4"
            } py-2.5 ${readOnly ? "bg-gray-100" : ""}`}
          />
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

interface ProductFormProps {
  values: Omit<GiftCard, "id" | "createdAt" | "updatedAt"> & { id?: string };
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const ProductForm = ({ values, onChange }: ProductFormProps) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-1">
        <div className="sm:col-span-2 bg-indigo-50 p-4 rounded-lg mb-2">
          <h4 className="text-sm font-medium text-indigo-800 mb-2">
            Basic Information
          </h4>
          <FormInput
            id="name"
            label="Card Name"
            value={values.name}
            onChange={onChange}
            placeholder="Enter card name"
            required
          />

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              id="brand"
              label="Brand"
              value={values.brand}
              onChange={onChange}
              placeholder="Brand name"
              required
            />
            <FormInput
              id="category"
              label="Category"
              value={values.category}
              onChange={onChange}
              placeholder="Category"
              required
            />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">Pricing</h4>
          <FormInput
            id="price"
            label="Price"
            type="number"
            value={values.price}
            onChange={onChange}
            min={0}
            required
            hint="Base price of the gift card"
          />

          <FormInput
            id="discount"
            label="Discount (%)"
            type="number"
            value={values.discount ?? 0}
            onChange={onChange}
            min={0}
            placeholder="0"
            hint="Optional percentage discount (leave 0 for no discount)"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Region & Stock
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              id="region"
              label="Region"
              value={values.region}
              onChange={onChange}
              placeholder="Region"
              required
            />

            <FormInput
              id="currency"
              label="Currency"
              type="text"
              value="TND"
              readOnly
              required
            />

            <FormInput
              id="stock"
              label="Stock"
              type="number"
              value={values.stock}
              onChange={onChange}
              min={0}
              required
              hint="Number of available gift cards"
            />
          </div>
        </div>

        <div className="sm:col-span-2 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Image & Description
          </h4>
          <FormInput
            id="imageUrl"
            label="Image URL"
            type="url"
            value={values.imageUrl}
            onChange={onChange}
            placeholder="Enter image URL"
            required
            hint="URL of the gift card image"
          />

          <FormInput
            id="description"
            label="Description"
            type="textarea"
            value={values.description || ""}
            onChange={onChange}
            placeholder="Enter card description"
            rows={3}
            hint="Brief description of the gift card"
          />
        </div>
      </div>

      {/* Preview of the current form values */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-indigo-500 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Card Preview
        </h4>
        <div className="max-w-sm mx-auto border border-gray-200 rounded-lg shadow-sm">
          <ProductPreviewCard
            card={{
              id: values.id || "preview",
              ...values,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ProductForm;
