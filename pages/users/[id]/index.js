import { useRouter } from "next/router";
import Link from "next/link";
import { withAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import useSWR from "swr";
import api from "../../../lib/api";
import {
  FaEdit,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { format } from "date-fns";

function UserDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR(id ? `/users/${id}` : null, () =>
    api.getUserById(id)
  );

  if (error) {
    return (
      <Layout>
        <div className="card">
          <div className="text-red-600">Failed to load user details</div>
        </div>
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Profile Photo */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Profile Photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-4 border-white shadow-lg">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                  <FaUser className="text-4xl text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                {user.isActive ? (
                  <span className="badge badge-success flex items-center">
                    <FaCheckCircle className="mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="badge badge-danger flex items-center">
                    <FaTimesCircle className="mr-1" />
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                {user.position && (
                  <span className="flex items-center">
                    <FaBriefcase className="mr-2" />
                    <span className="font-medium">{user.position}</span>
                  </span>
                )}
                <span className="flex items-center">
                  <FaIdCard className="mr-2" />
                  <span className="badge badge-info capitalize">
                    {user.role?.name}
                  </span>
                </span>
                <span className="flex items-center">
                  <FaEnvelope className="mr-2" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link href={`/users/${user.id}/edit`} className="btn btn-primary">
              <FaEdit className="inline mr-2" />
              Edit User
            </Link>
          </div>
        </div>

        {/* User Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaPhone className="mr-2 text-primary-600" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Account Information - UPDATED */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaIdCard className="mr-2 text-primary-600" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Position/Title</p>
                <p className="font-medium text-lg">
                  {user.position ? (
                    <span className="badge badge-warning">{user.position}</span>
                  ) : (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium capitalize text-lg">
                  <span className="badge badge-info">{user.role?.name}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="font-medium">
                  {user.isActive ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-danger">Inactive</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-mono text-sm text-gray-700">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Account Dates */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaCalendar className="mr-2 text-primary-600" />
              Account Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {format(new Date(user.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(user.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Permissions</h2>
            {user.role?.permissions && user.role.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.role.permissions.map((permission) => (
                  <span
                    key={permission.id}
                    className="badge badge-info capitalize"
                  >
                    {permission.resource}:{permission.action}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No permissions assigned</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/users/${user.id}/edit`} className="btn btn-primary">
              <FaEdit className="inline mr-2" />
              Edit User Profile
            </Link>
            <button
              onClick={() => router.push("/users")}
              className="btn btn-secondary"
            >
              Back to Users List
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(UserDetailsPage);
