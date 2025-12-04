import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import useSWR from "swr";
import api from "../../../lib/api";
import {
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
} from "react-icons/fa";
import { format } from "date-fns";

function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    isActive: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data
  const { data: userData, error: fetchError } = useSWR(
    id ? `/users/${id}` : null,
    () => api.getUserById(id)
  );

  // Load roles
  const { data: rolesData } = useSWR("/roles", () => api.getRoles());
  const roles = rolesData?.data || [];
  const user = userData?.data;

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        roleId: user.roleId || "",
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [user]);

  if (fetchError) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load user</div>
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = { ...formData };

      // Remove empty phone
      if (!submitData.phone) {
        delete submitData.phone;
      }

      await api.updateUser(id, submitData);

      // Redirect to users list
      router.push("/users");
    } catch (err) {
      setError(err.message || "Failed to update user");
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.resetUserPassword(id, { password: passwordData.newPassword });
      setShowPasswordReset(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
      alert("Password reset successfully");
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    const action = formData.isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    setLoading(true);
    setError("");

    try {
      await api.updateUser(id, { isActive: !formData.isActive });
      setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
    } catch (err) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (roleName) => {
    return roleName
      ?.split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600 mt-1">
              {user.firstName} {user.lastName} ({user.email})
            </p>
          </div>
          <button
            onClick={() => router.push("/users")}
            className="btn btn-secondary"
          >
            <FaTimes className="inline mr-2" />
            Cancel
          </button>
        </div>

        {/* User Status */}
        <div
          className={`card ${
            formData.isActive
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.isActive ? (
                <FaCheckCircle className="text-3xl text-green-600" />
              ) : (
                <FaTimesCircle className="text-3xl text-red-600" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {formData.isActive ? "Active User" : "Inactive User"}
                </p>
                <p className="text-sm text-gray-600">
                  Created: {format(new Date(user.createdAt), "MMM d, yyyy")}
                  {" • "}
                  Last login:{" "}
                  {user.lastLogin
                    ? format(new Date(user.lastLogin), "MMM d, yyyy")
                    : "Never"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleUserStatus}
              className={`btn ${
                formData.isActive ? "btn-danger" : "btn-success"
              }`}
              disabled={loading}
            >
              {formData.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+231-777-123-4567"
                />
              </div>
            </div>
          </div>

          {/* Role Assignment */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Role & Permissions</h2>

            <div>
              <label className="label">User Role *</label>
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {getRoleDisplayName(role.name)}
                  </option>
                ))}
              </select>
            </div>

            {user.role && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Current Role:{" "}
                  <span className="font-semibold">
                    {getRoleDisplayName(user.role.name)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/users")}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Password Reset Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <FaKey className="mr-2 text-yellow-600" />
              Password Reset
            </h2>
            {!showPasswordReset && (
              <button
                onClick={() => setShowPasswordReset(true)}
                className="btn btn-secondary"
              >
                Reset Password
              </button>
            )}
          </div>

          {showPasswordReset ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setPasswordData({ newPassword: "", confirmPassword: "" });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Reset Password
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Click "Reset Password" to change this user's password.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(EditUserPage);
