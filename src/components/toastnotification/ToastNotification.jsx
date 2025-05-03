// components/toastnotification/ToastNotification.jsx
import { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";

function ToastNotification({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Give some time for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="text-white" size={18} />;
      case "error":
        return <AlertCircle className="text-white" size={18} />;
      default:
        return <Check className="text-white" size={18} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`${getBackgroundColor()} text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md`}
      >
        <div className="mr-3">
          <div className="rounded-full p-1">{getIcon()}</div>
        </div>
        <div className="flex-1">{message}</div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }}
          className="ml-4 text-white hover:text-gray-200"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default ToastNotification;
