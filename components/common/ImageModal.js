import { FaTimes } from "react-icons/fa";

export default function ImageModal({ isOpen, onClose, imageUrl, name }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative max-w-4xl w-full">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>

          {/* Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            {name && (
              <div className="p-4 bg-gray-50 border-t">
                <p className="text-center text-gray-700 font-medium">{name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
