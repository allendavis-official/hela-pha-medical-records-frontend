import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import ImageUpload from "../../../components/common/ImageUpload";
import useSWR from "swr";
import api from "../../../lib/api";
import { FaSave, FaTimes } from "react-icons/fa";

function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    roleId: "",
    isActive: true,
  });

  // Fetch user data
  const {
    data: userData,
    error: userError,
    mutate,
  } = useSWR(id ? `/users/${id}` : null, () => api.getUserById(id));

  const user = userData?.data;

  // Fetch roles
  const { data: rolesData } = useSWR("/roles", () => api.getRoles());
  const roles = rolesData?.data || [];

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        roleId: user.roleId || "",
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const response = await api.uploadUserImage(id, file);

      // Update the image in the UI
      if (response?.data?.imageUrl) {
        mutate(
          {
            ...userData,
            data: {
              ...userData.data,
              profileImage: response.data.imageUrl,
            },
          },
          false
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.updateUser(id, formData);
      router.push("/users");
    } catch (err) {
      setError(err.message || "Failed to update user");
      setLoading(false);
    }
  };

  if (userError) {
    return (
      <Layout>
        <div className="card">
          <div className="text-red-600">Failed to load user data</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600 mt-1">
              Update user information and profile picture
            </p>
          </div>
          <button onClick={() => router.back()} className="btn btn-secondary">
            <FaTimes className="inline mr-2" />
            Cancel
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Profile Image</h2>
            <ImageUpload
              currentImage={user.profileImage}
              onUpload={handleImageUpload}
              loading={uploadingImage}
              label="User Profile Picture"
            />
          </div>

          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={user.email}
                  className="input bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+231-777-123-4567"
                />
              </div>

              <div>
                <label className="label">Role *</label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Account Active
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(EditUserPage);
