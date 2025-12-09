import { useState } from "react";
import { withAuth, useAuth } from "../lib/auth";
import Layout from "../components/layout/Layout";
import ImageUpload from "../components/common/ImageUpload";
import useSWR from "swr";
import api from "../lib/api";
import { FaLock, FaUser } from "react-icons/fa";

function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch full user data
  const { data: userData, mutate } = useSWR(
    currentUser ? "/users/me" : null,
    () => api.getCurrentUserProfile()
  );

  const user = userData?.data;

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.uploadOwnProfileImage(file);

      if (response?.data?.imageUrl) {
        setSuccess("Profile image updated successfully!");

        // Update local data
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

        // Dispatch custom event with updated image
        const updatedUser = {
          ...user,
          profileImage: response.data.imageUrl,
        };

        window.dispatchEvent(
          new CustomEvent("profileUpdated", {
            detail: updatedUser,
          })
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
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
            Update your profile image and password
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

        {/* Read-Only Profile Information */}
        <div className="card bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            Contact an administrator to update your profile information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{user.phone || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium">{user.position || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{user.role?.name}</p>
            </div>
          </div>
        </div>

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
