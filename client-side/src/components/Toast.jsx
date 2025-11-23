import { useEffect } from "react";

const Toast = ({ open, message, onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow">
      {message}
    </div>
  );
};

export default Toast;
