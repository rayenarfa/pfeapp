import React from "react";
import { GiftCard } from "../../../types/product";

interface ProductPreviewCardProps {
  card: GiftCard;
}

const ProductPreviewCard = ({ card }: ProductPreviewCardProps) => {
  // Calculate the final price after discount
  const finalPrice =
    card.discount && card.discount > 0
      ? card.price * (1 - card.discount / 100)
      : card.price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <div className="aspect-w-1 aspect-h-1 w-full">
          <img
            src={card.imageUrl}
            alt={card.name}
            className="object-cover w-full h-40 sm:h-48"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        </div>
        {card.discount && card.discount > 0 && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500 text-white">
              {card.discount}% OFF
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-md font-semibold text-gray-900 line-clamp-1">
            {card.name}
          </h3>
          <div className="text-right">
            <div className="text-md font-bold text-indigo-600">
              TND{" "}
              {finalPrice % 1 === 0
                ? finalPrice.toFixed(0)
                : finalPrice.toFixed(2)}
            </div>
            {card.discount && card.discount > 0 && (
              <span className="text-xs text-gray-500 line-through">
                TND{" "}
                {card.price % 1 === 0
                  ? card.price.toFixed(0)
                  : card.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-300 text-gray-800">
            {card.brand}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {card.region}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {card.category}
          </span>
        </div>
        {card.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {card.description}
          </p>
        )}
        <div className="flex justify-between items-center mt-3">
          <span
            className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
              card.stock > 10
                ? "bg-green-100 text-green-800"
                : card.stock > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {card.stock > 0 ? `${card.stock} in stock` : "Sold out"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewCard;
