import { GiftCard } from "../../../types/product";
import { Edit2, Trash2 } from "lucide-react";

interface ProductListViewProps {
  cards: GiftCard[];
  onEdit: (card: GiftCard) => void;
  onDelete: (id: string) => void;
}

const ProductListView = ({ cards, onEdit, onDelete }: ProductListViewProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Card
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Details
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Stock
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map((card) => {
              const finalPrice =
                card.discount && card.discount > 0
                  ? card.price * (1 - card.discount / 100)
                  : card.price;

              return (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-14 w-14 flex-shrink-0 mr-4">
                        <img
                          className="h-14 w-14 rounded-md object-cover"
                          src={card.imageUrl}
                          alt={card.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/100?text=No+Image";
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {card.name}
                        </div>
                        {card.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {card.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{card.brand}</div>
                    <div className="text-sm text-gray-500">
                      {card.category} • {card.region}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        TND{" "}
                        {finalPrice % 1 === 0
                          ? finalPrice.toFixed(0)
                          : finalPrice.toFixed(2)}
                      </div>
                      {card.discount && card.discount > 0 && (
                        <div className="ml-2 flex flex-col">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            -{card.discount}%
                          </span>
                          <span className="text-xs text-gray-500 line-through mt-0.5">
                            TND{" "}
                            {card.price % 1 === 0
                              ? card.price.toFixed(0)
                              : card.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        card.stock > 10
                          ? "bg-green-100 text-green-800"
                          : card.stock > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {card.stock > 0 ? `${card.stock} in stock` : "Sold out"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(card)}
                        className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(card.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListView;
