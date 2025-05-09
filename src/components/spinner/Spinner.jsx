import React from "react";

const Spinner = ({ size = "md" }) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8 sm:h-10 sm:w-10",
    lg: "h-12 w-12",
  };

  return (
    <div className="text-center py-6">
      <div
        className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-b-2 border-indigo-600 mx-auto`}
      ></div>
    </div>
  );
};

export default Spinner;
