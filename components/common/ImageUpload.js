import { useState, useRef } from "react";
import { FaCamera, FaSpinner } from "react-icons/fa";
import Image from "next/image";

export default function ImageUpload({
  currentImage,
  onUpload,
  loading = false,
  label = "Profile Image",
}) {
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Call upload callback
      onUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center space-x-4">
        {/* Image Preview */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
          {preview ? (
            <img src={preview} alt="Profile" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaCamera className="text-4xl text-gray-400" />
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <FaSpinner className="text-white text-2xl animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? "Uploading..." : "Choose Image"}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG or GIF (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
}
