import { useState } from "react";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaUser,
  FaTrash,
  FaBan,
} from "react-icons/fa";

function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const { data, error, mutate } = useSWR(`/users?search=${searchTerm}`, () =>
    api.getUsers({ search: searchTerm })
  );

  const handleDeactivate = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to deactivate ${userName}? The user will no longer be able to log in.`
      )
    ) {
      return;
    }

    setDeactivatingId(userId);
    try {
      await api.deactivateUser(userId);
      mutate(); // Refresh the list
      alert("User deactivated successfully");
    } catch (error) {
      alert("Failed to deactivate user: " + error.message);
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (
      !confirm(
        `⚠️ PERMANENTLY DELETE ${userName}?\n\nThis will:\n- Remove user from database\n- Cannot be undone\n- All audit logs will remain\n\nAre you absolutely sure?`
      )
    ) {
      return;
    }

    setDeletingId(userId);
    try {
      await api.deleteUser(userId);
      mutate(); // Refresh the list
      alert("User deleted permanently");
    } catch (error) {
      alert("Failed to delete user: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load users</div>
      </Layout>
    );
  }

  const users = data?.data || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system users and permissions
            </p>
          </div>
          <Link href="/users/new" className="btn btn-primary">
            <FaPlus className="inline mr-2" />
            New User
          </Link>
        </div>

        {/* Search Bar */}
        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          {!data ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          {/* Profile Image */}
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaUser className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge badge-info capitalize">
                          {user.role.name}
                        </span>
                      </td>
                      <td>{user.phone || "-"}</td>
                      <td>
                        {user.isActive ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Inactive</span>
                        )}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <Link
                            href={`/users/${user.id}`}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Details"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            href={`/users/${user.id}/edit`}
                            className="text-gray-600 hover:text-gray-800"
                            title="Edit User"
                          >
                            <FaEdit />
                          </Link>

                          {/* Deactivate Button */}
                          {user.isActive && (
                            <button
                              onClick={() =>
                                handleDeactivate(
                                  user.id,
                                  `${user.firstName} ${user.lastName}`
                                )
                              }
                              disabled={deactivatingId === user.id}
                              className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                              title="Deactivate User"
                            >
                              {deactivatingId === user.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <FaBan />
                              )}
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              handleDelete(
                                user.id,
                                `${user.firstName} ${user.lastName}`
                              )
                            }
                            disabled={deletingId === user.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete User Permanently"
                          >
                            {deletingId === user.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(UsersPage);
