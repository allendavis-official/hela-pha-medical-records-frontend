import { useState } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaSave, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    roleId: "",
  });

  // Load roles
  const { data: rolesData } = useSWR("/roles", () => api.getRoles());
  const roles = rolesData?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength (basic)
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        roleId: formData.roleId,
      };

      await api.createUser(submitData);

      // Redirect to users list
      router.push("/users");
    } catch (err) {
      setError(err.message || "Failed to create user");
      setLoading(false);
    }
  };

  const getRoleDescription = (roleName) => {
    switch (roleName) {
      case "admin":
        return "Full system access - manage users, configure system";
      case "clinician":
        return "Create encounters, document notes, order tests";
      case "records_staff":
        return "Register patients, manage records, schedule appointments";
      case "lab_tech":
        return "Process lab orders, enter lab results";
      case "radiographer":
        return "Process radiology orders, enter radiology reports";
      default:
        return "";
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New User
            </h1>
            <p className="text-gray-600 mt-1">Add a new user to the system</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Account Information</h2>

            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
                placeholder="user@helapha.org"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used as the username for login
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input pr-10"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400" />
                    ) : (
                      <FaEye className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input"
                  required
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

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

            <div className="mt-4">
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
                    {role.name
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Description */}
            {formData.roleId && roles.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Role Permissions:
                </p>
                <p className="text-sm text-blue-800">
                  {getRoleDescription(
                    roles.find((r) => r.id === formData.roleId)?.name
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">
              Password Requirements:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Minimum 8 characters long</li>
              <li>• Include uppercase and lowercase letters (recommended)</li>
              <li>• Include numbers and special characters (recommended)</li>
            </ul>
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
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(NewUserPage);
