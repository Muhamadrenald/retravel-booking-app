import React, { useState } from "react";
import PriceRangeSlider from "../../../components/pricerange/PriceRangerSlider";

const Filter = ({ className }) => {
  const [rangeValues, setRangeValues] = useState({
    min: 0,
    max: 100,
  });

  const handleRangeChange = (values) => {
    setRangeValues({ values });
  };

  return (
    <div className={`w-full ${className}`}>
      <h1 className="text-xl text-neutral-700 font-semibold">Apply Filters</h1>

      {/* Price Filter */}
      <div className="w-full border border-neutral-300 rounded-xl p-4 space-y-1">
        <h1 className="text-lg text-neutral-600 font-medium">Apply Filters</h1>

        <PriceRangeSlider min={1000} max={3000} onChange={handleRangeChange} />
      </div>

      {/* Bus Type Filter */}
      <div className="w-full border border-neutral-300 rounded-xl p-4 space-y-3">
        <h1 className="text-lg text-neutral-600 font-medium">Bus Types</h1>

        <div className="space-y-2.5">
          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="ac"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="ac"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              AC Deluxe <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="tourist"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="tourist"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Tourist AC Deluxe
              <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="airsusp"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="airsusp"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Air Suspension <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="luxuryac"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="luxuryac"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Luxury AC Deluxe
              <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Bus Companies */}
      <div className="w-full border border-neutral-300 rounded-xl p-4 space-y-3">
        <h1 className="text-lg text-neutral-600 font-medium">Bus Companies</h1>

        <div className="space-y-2.5">
          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="juragandeluxe"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="juragandeluxe"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Juragan Deluxe
              <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="vipdeluxe"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="vipdeluxe"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              VIP Deluxe
              <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="premiumdeluxe"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="premiumdeluxe"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Premium Deluxe <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="regulerdeluxe"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="regulerdeluxe"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Reguler Deluxe
              <span className="text-xs text-neutral-">(10)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Amenities Filter  */}
      <div className="w-full border border-neutral-300 rounded-xl p-4 space-y-3">
        <h1 className="text-lg text-neutral-600 font-medium">Amenities</h1>

        <div className="space-y-2.5">
          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="internet"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="internet"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Internet/Wifi
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="acairsusp"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="acairsusp"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Ac & Air Suspension
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="waterbottles"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="waterbottles"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Water Bottles
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="chargingport"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="chargingport"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Charging Port
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="fan"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="fan"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Fan
            </label>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="checkbox"
              id="superac"
              className="h-3.5 w-3.5 border border-neutral-300 text-neutral-300 cursor-pointer"
            />
            <label
              htmlFor="superac"
              className="text-sm text-neutral-600 font-normal cursor-pointer"
            >
              Super AC
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
