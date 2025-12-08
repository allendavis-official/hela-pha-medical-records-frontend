import { useState } from "react";
import { withAuth, useAuth } from "../lib/auth";
import Layout from "../components/layout/Layout";
import ImageUpload from "../components/common/ImageUpload";
import useSWR from "swr";
import api from "../lib/api";
import { FaSave, FaLock, FaUser } from "react-icons/fa";

function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch full user data
  // Use /me endpoint
  const { data: userData, mutate } = useSWR(
    currentUser ? "/users/me" : null,
    () => api.getCurrentUserProfile()
  );

  const user = userData?.data;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    position: user?.position || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update formData when user data loads
  useState(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        email: user.email || "",
        position: user.position || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const response = await api.uploadOwnProfileImage(file);

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
        setSuccess("Profile image updated successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.updateOwnProfile(formData);
      mutate();
      setSuccess("Profile updated successfully!");

      // Reload auth context if email changed
      if (formData.email !== user.email) {
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and profile information
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Image */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaUser className="mr-2 text-primary-600" />
            Profile Picture
          </h2>
          <ImageUpload
            currentImage={user.profileImage}
            onUpload={handleImageUpload}
            loading={uploadingImage}
            label="Your Profile Picture"
          />
        </div>

        {/* Profile Information */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>

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
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You'll be logged out if you change your email
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
                <label className="label">Position/Title</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Head Nurse, Senior Doctor"
                />
              </div>

              <div>
                <label className="label">Role</label>
                <input
                  type="text"
                  value={user.role?.name || ""}
                  className="input bg-gray-100 cursor-not-allowed capitalize"
                  disabled
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact admin to change your role
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Password Change Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaLock className="mr-2 text-primary-600" />
              Password & Security
            </h2>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn btn-secondary"
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-6">
              <div>
                <label className="label">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <FaLock className="inline mr-2" />
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}

          {!showPasswordForm && (
            <p className="text-gray-600 text-sm">
              Click "Change Password" to update your password
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(ProfilePage);
