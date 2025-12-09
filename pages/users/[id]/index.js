import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withAuth, useAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import ImageModal from "../../../components/common/ImageModal";
import useSWR from "swr";
import api from "../../../lib/api";
import {
  FaEdit,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBriefcase,
  FaShieldAlt,
  FaBan,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { format } from "date-fns";

function UserDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { data, error, mutate } = useSWR(id ? `/users/${id}` : null, () =>
    api.getUserById(id)
  );

  const handleDeactivate = async () => {
    if (
      !confirm(
        "Are you sure you want to deactivate this user? They will not be able to login until reactivated."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await api.deactivateUser(id);
      mutate();
      alert("User deactivated successfully");
    } catch (error) {
      alert("Failed to deactivate user: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will PERMANENTLY delete this user from the system.\n\nThis action cannot be undone!\n\nAre you absolutely sure?"
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await api.deleteUser(id);
      router.push("/users");
    } catch (error) {
      alert("Failed to delete user: " + error.message);
      setActionLoading(false);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load user details</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user...</p>
        </div>
      </Layout>
    );
  }

  const user = data.data;
  const isCurrentUser = currentUser?.id === user.id;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Profile Image */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {/* Clickable Profile Image */}
            <div
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => setShowImageModal(true)}
            >
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl transition-shadow">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>
              {user.profileImage && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Click to enlarge
                </p>
              )}
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                <span className="badge badge-info capitalize">
                  {user.role?.name}
                </span>
                {user.position && (
                  <span
                    className="badge"
                    style={{ backgroundColor: "#f97316", color: "white" }}
                  >
                    <FaBriefcase className="inline mr-1" />
                    {user.position}
                  </span>
                )}
                {user.isActive ? (
                  <span className="badge badge-success">
                    <FaCheckCircle className="inline mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="badge badge-danger">
                    <FaTimesCircle className="inline mr-1" />
                    Inactive
                  </span>
                )}
              </div>
              {isCurrentUser && (
                <p className="text-sm text-primary-600 mt-2 font-medium">
                  This is your account
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Link href={`/users/${user.id}/edit`} className="btn btn-secondary">
              <FaEdit className="inline mr-2" />
              Edit
            </Link>
            {!isCurrentUser && user.isActive && (
              <button
                onClick={handleDeactivate}
                disabled={actionLoading}
                className="btn btn-secondary text-orange-600 hover:bg-orange-50 disabled:opacity-50"
              >
                <FaBan className="inline mr-2" />
                Deactivate
              </button>
            )}
            {!isCurrentUser && (
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="btn btn-danger disabled:opacity-50"
              >
                <FaTrash className="inline mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaUser className="mr-2 text-primary-600" />
                Account Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium">{user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{user.phone || "Not set"}</p>
                </div>
                {user.position && (
                  <div>
                    <p className="text-sm text-gray-600">Position/Title</p>
                    <p className="font-medium">{user.position}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium capitalize">{user.role?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="font-medium">
                    {user.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-primary-600" />
                Permissions
              </h2>
              {user.role?.permissions &&
              Object.keys(user.role.permissions).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(user.role.permissions).map(
                    ([resource, actions]) => (
                      <div
                        key={resource}
                        className="border-b pb-3 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900 capitalize mb-2">
                          {resource.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action) => (
                            <span
                              key={action}
                              className="badge badge-info text-xs"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No permissions assigned</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Age</span>
                  <span className="font-semibold">
                    {Math.floor(
                      (new Date() - new Date(user.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold">
                    {format(new Date(user.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {user.profileImage && (
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl={user.profileImage}
          name={`${user.firstName} ${user.lastName}`}
        />
      )}
    </Layout>
  );
}

export default withAuth(UserDetailsPage);
