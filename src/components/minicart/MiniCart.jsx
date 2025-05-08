import { useState } from "react";
import { ShoppingCart, X, ChevronRight } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, cartCount, cartTotal, removeFromCart, isLoading } =
    useCart();

  const formatCurrency = (amount) => {
    return `Rp ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Cart Icon with Badge */}
      <button
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        onClick={toggleCart}
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>

      {/* Mini Cart Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Your Cart ({cartCount})</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : cartItems.length > 0 ? (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mr-3">
                        <ShoppingCart size={16} />
                      </div>
                      <div>
                        <div className="font-medium">
                          {item.activityName || "Activity"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.price)} x {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="font-medium mr-3">
                        {formatCurrency(item.totalPrice)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isLoading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Your cart is empty
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <a
                href="/checkout"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-md"
              >
                Checkout <ChevronRight size={16} className="inline ml-1" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniCart;
