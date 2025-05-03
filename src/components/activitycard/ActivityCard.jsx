import React from "react";

const ActivityCard = ({ activity, onClick, handleImageError }) => {
  return (
    <div
      onClick={() => onClick(activity.id)}
      className="cursor-pointer border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
    >
      <img
        src={activity.image}
        alt={activity.name}
        className="h-48 w-full object-cover"
        onError={handleImageError}
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{activity.name}</h3>
        <p className="text-gray-600">📍 {activity.location}</p>
        <p className="text-gray-600">⭐ {activity.rating}/10</p>
        <p className="text-gray-600">
          {activity.originalPrice && (
            <span className="line-through text-red-500 mr-2">
              Rp. {activity.price}
            </span>
          )}
          <span className="text-green-600 font-semibold">
            Rp. {activity.priceDiscount || activity.price}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ActivityCard;
