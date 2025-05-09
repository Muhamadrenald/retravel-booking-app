import React from "react";
import { MapPin, Star } from "lucide-react";

const ActivityCard = ({ activity, onClick, handleImageError }) => {
  const getImageUrl = (img) => {
    return img && img.trim() !== "" ? img : "https://picsum.photos/800/400";
  };

  const formatCurrency = (amount) => {
    return `IDR ${amount?.toLocaleString("id-ID") || "0"}`;
  };

  // Calculate discount percentage
  const discountPercentage =
    activity?.originalPrice && activity?.priceDiscount
      ? Math.round((1 - activity.priceDiscount / activity.originalPrice) * 100)
      : 0;

  console.log("ActivityCard activity:", JSON.stringify(activity, null, 2));

  return (
    <div
      onClick={() => onClick(activity.id)}
      tabIndex={-1}
      className="cursor-pointer bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
    >
      <div className="relative">
        <img
          src={getImageUrl(activity.image)}
          alt={activity.name}
          className="h-48 w-full object-cover rounded-t-lg"
          onError={
            handleImageError ||
            ((e) => {
              e.target.src = "https://picsum.photos/800/400";
            })
          }
        />
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-teal-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
            Save {discountPercentage}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {activity.name}
        </h3>
        <p className="text-sm text-gray-600 flex items-center mb-1">
          <MapPin size={16} className="mr-2 text-gray-500" />
          {activity.location}
        </p>
        <p className="text-sm text-gray-600 flex items-center mb-2">
          <Star size={16} className="mr-2 text-yellow-400 fill-yellow-400" />
          {activity.rating}/5
        </p>
        <p className="text-sm">
          {activity.originalPrice && (
            <span className="line-through text-red-600 mr-2">
              {formatCurrency(activity.originalPrice)}
            </span>
          )}
          <span className="text-base font-semibold text-teal-600">
            {formatCurrency(activity.priceDiscount || activity.price)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ActivityCard;
