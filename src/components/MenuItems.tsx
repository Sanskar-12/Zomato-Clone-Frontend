import { useState } from "react";
import type { IMenuItem } from "../types";
import { BsEye } from "react-icons/bs";
import { FiEyeOff } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items &&
        items.map((item) => {
          const isLoading = loadingItemId === item?._id;

          return (
            <div
              className={`relative flex gap-4 rounded-lg bg-white p-4 shadow-sm transition ${!item?.isAvailable ? "opacity-70" : ""}`}
            >
              <div className="relative shrink-0">
                <img
                  src={item.image}
                  alt="Image"
                  className={`h-20 w-20 rounded object-cover ${
                    !item.isAvailable ? "grayscale brightness-75" : ""
                  }`}
                />
                {!item.isAvailable && (
                  <span className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs font-semibold text-white">
                    Not Available
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-center">
                  <p className="font-medium">₹{item.price}</p>
                  {isSeller && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {}}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                      >
                        {item.isAvailable ? (
                          <BsEye size={18} />
                        ) : (
                          <FiEyeOff size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => {}}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <BiTrash size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MenuItems;
