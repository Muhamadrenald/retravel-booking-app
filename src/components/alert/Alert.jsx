import React, { useEffect } from "react";

const Alert = ({ type, message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: "bg-green-50 border-l-4 border-green-500 text-green-700",
    error: "bg-red-50 border-l-4 border-red-500 text-red-700",
  };

  return (
    <div
      className={`${styles[type]} p-4 rounded-lg mb-4 sm:mb-6 shadow-sm text-sm sm:text-base`}
    >
      {message}
    </div>
  );
};

export default Alert;
