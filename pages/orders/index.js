import { useState } from "react";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import {
  FaPlus,
  FaFlask,
  FaXRay,
  FaEye,
  FaExclamationTriangle,
} from "react-icons/fa";
import { format } from "date-fns";

function OrdersPage() {
  const [filters, setFilters] = useState({
    orderType: "",
    status: "pending",
    priority: "",
    page: 1,
    limit: 20,
  });

  const {
    data: ordersData,
    error,
    mutate,
  } = useSWR(`/orders?${JSON.stringify(filters)}`, () =>
    api.getOrders(filters)
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load orders</div>
      </Layout>
    );
  }

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination || { page: 1, pages: 1, total: 0 };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "collected":
        return "badge-info";
      case "processing":
        return "badge-info";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-info";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "stat":
        return "text-red-600 font-bold";
      case "urgent":
        return "text-orange-600 font-semibold";
      case "routine":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lab & Radiology Orders
            </h1>
            <p className="text-gray-600 mt-1">
              Manage diagnostic orders and results
            </p>
          </div>
          <Link href="/orders/new" className="btn btn-primary">
            <FaPlus className="inline mr-2" />
            New Order
          </Link>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="collected">Collected</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <label className="label">Order Type</label>
              <select
                value={filters.orderType}
                onChange={(e) =>
                  handleFilterChange("orderType", e.target.value)
                }
                className="input"
              >
                <option value="">All Types</option>
                <option value="lab">Laboratory</option>
                <option value="radiology">Radiology</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="label">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="input"
              >
                <option value="">All Priorities</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    orderType: "",
                    status: "pending",
                    priority: "",
                    page: 1,
                    limit: 20,
                  })
                }
                className="btn btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            href="/orders?status=pending"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </Link>
          <Link
            href="/orders?status=processing"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <p className="text-sm text-gray-600 mb-1">Processing</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "processing").length}
            </p>
          </Link>
          <Link
            href="/orders?status=completed"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <p className="text-sm text-gray-600 mb-1">Completed Today</p>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter((o) => o.status === "completed").length}
            </p>
          </Link>
          <Link
            href="/results/critical"
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <p className="text-sm text-gray-600 mb-1">Critical Results</p>
            <p className="text-3xl font-bold text-red-600">
              {
                orders.filter((o) => o.results?.some((r) => r.criticalFlag))
                  .length
              }
            </p>
          </Link>
        </div>

        {/* Orders Table */}
        <div className="card">
          {!ordersData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your filters or create a new order
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Priority</th>
                      <th>Patient</th>
                      <th>Type</th>
                      <th>Test Name</th>
                      <th>Ordered By</th>
                      <th>Ordered Date</th>
                      <th>Status</th>
                      <th>Results</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <span className={getPriorityColor(order.priority)}>
                            {order.priority?.toUpperCase()}
                          </span>
                          {order.priority === "stat" && (
                            <FaExclamationTriangle className="inline ml-1 text-red-600" />
                          )}
                        </td>
                        <td>
                          <Link
                            href={`/patients/${order.encounter.patient.id}`}
                            className="font-medium text-primary-600 hover:text-primary-800"
                          >
                            {order.encounter.patient.firstName}{" "}
                            {order.encounter.patient.lastName}
                          </Link>
                          <p className="text-xs text-gray-500 font-mono">
                            {order.encounter.patient.mrn}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.orderType === "lab"
                                ? "badge-info"
                                : "badge-warning"
                            }`}
                          >
                            {order.orderType === "lab" ? (
                              <>
                                <FaFlask className="inline mr-1" />
                                Lab
                              </>
                            ) : (
                              <>
                                <FaXRay className="inline mr-1" />
                                Radiology
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium">{order.testName}</span>
                          {order.orderCategory && (
                            <p className="text-xs text-gray-500 capitalize">
                              {order.orderCategory}
                            </p>
                          )}
                        </td>
                        <td>
                          <span className="text-sm">
                            Dr. {order.clinician.lastName}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm">
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </span>
                          <p className="text-xs text-gray-500">
                            {format(new Date(order.createdAt), "h:mm a")}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`badge ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          {order.results && order.results.length > 0 ? (
                            <div>
                              {order.results.some((r) => r.criticalFlag) && (
                                <span className="badge badge-danger">
                                  Critical
                                </span>
                              )}
                              {order.results.some((r) => r.isAbnormal) && (
                                <span className="badge badge-warning ml-1">
                                  Abnormal
                                </span>
                              )}
                              {!order.results.some(
                                (r) => r.criticalFlag || r.isAbnormal
                              ) && (
                                <span className="text-green-600 text-sm">
                                  ✓ Normal
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No results
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-primary-600 hover:text-primary-800"
                              title="View Details"
                            >
                              <FaEye />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between border-t pt-6">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * filters.limit + 1} to{" "}
                  {Math.min(pagination.page * filters.limit, pagination.total)}{" "}
                  of {pagination.total} orders
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.pages}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(OrdersPage);
