import { useState } from "react";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { format } from "date-fns";

function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const {
    data: usersData,
    error,
    mutate,
  } = useSWR("/users", () => api.getUsers());

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load users</div>
      </Layout>
    );
  }

  const allUsers = usersData?.data || [];

  // Filter users
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role?.name === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const roles = [...new Set(allUsers.map((u) => u.role?.name).filter(Boolean))];

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case "admin":
        return "badge-danger";
      case "clinician":
        return "badge-success";
      case "records_staff":
        return "badge-info";
      case "lab_tech":
        return "badge-warning";
      case "radiographer":
        return "badge-warning";
      default:
        return "badge-info";
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaUser className="mr-3 text-primary-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system users and access permissions
            </p>
          </div>
          <Link href="/users/new" className="btn btn-primary">
            <FaPlus className="inline mr-2" />
            New User
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-primary-600">
              {allUsers.length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-green-600">
              {allUsers.filter((u) => u.isActive).length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Clinicians</p>
            <p className="text-3xl font-bold text-blue-600">
              {allUsers.filter((u) => u.role?.name === "clinician").length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Administrators</p>
            <p className="text-3xl font-bold text-red-600">
              {allUsers.filter((u) => u.role?.name === "admin").length}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Search Users</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">Filter by Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          {!usersData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Created</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.isActive ? (
                          <FaCheckCircle
                            className="text-green-600 text-xl"
                            title="Active"
                          />
                        ) : (
                          <FaTimesCircle
                            className="text-red-600 text-xl"
                            title="Inactive"
                          />
                        )}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary-600">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm">{user.email}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getRoleBadgeColor(
                            user.role?.name
                          )}`}
                        >
                          {getRoleDisplayName(user.role?.name)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm">{user.phone || "-"}</span>
                      </td>
                      <td>
                        <span className="text-sm">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {user.lastLogin
                            ? format(new Date(user.lastLogin), "MMM d, yyyy")
                            : "Never"}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <Link
                            href={`/users/${user.id}/edit`}
                            className="text-primary-600 hover:text-primary-800"
                            title="Edit User"
                          >
                            <FaEdit />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role Summary */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Users by Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles.map((role) => {
              const count = allUsers.filter(
                (u) => u.role?.name === role
              ).length;
              return (
                <div
                  key={role}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {getRoleDisplayName(role)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(UsersPage);
