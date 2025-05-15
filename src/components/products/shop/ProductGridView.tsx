import { GiftCard } from "../../../types/product";
import ProductPreviewCard from "./ProductPreviewCard";
import { Edit2, Trash2 } from "lucide-react";

interface ProductGridViewProps {
  cards: GiftCard[];
  onEdit: (card: GiftCard) => void;
  onDelete: (id: string) => void;
}

const ProductGridView = ({ cards, onEdit, onDelete }: ProductGridViewProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.id} className="relative group">
          <ProductPreviewCard card={card} />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(card)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Edit2 size={16} className="text-indigo-600" />
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={16} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridView;
