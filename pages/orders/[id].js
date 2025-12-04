import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import {
  FaFlask,
  FaXRay,
  FaUser,
  FaStethoscope,
  FaCalendar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
} from "react-icons/fa";
import { format } from "date-fns";

function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const {
    data,
    error: fetchError,
    mutate,
  } = useSWR(id ? `/orders/${id}` : null, () => api.getOrderById(id));

  if (fetchError) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load order details</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </Layout>
    );
  }

  const order = data.data;
  const patient = order.encounter.patient;

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Update order status to "${newStatus}"?`)) return;

    setUpdating(true);
    setError("");

    try {
      await api.updateOrderStatus(id, newStatus);
      mutate(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    )
      return;

    setUpdating(true);
    setError("");

    try {
      await api.cancelOrder(id);
      mutate(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  };

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
        return "text-red-600";
      case "urgent":
        return "text-orange-600";
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
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">
              {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
            </p>
          </div>
          <div className="flex space-x-3">
            {order.status === "pending" && (
              <Link
                href={`/results/new?orderId=${order.id}`}
                className="btn btn-primary"
              >
                <FaPlus className="inline mr-2" />
                Add Results
              </Link>
            )}
            <Link
              href={`/patients/${patient.id}`}
              className="btn btn-secondary"
            >
              <FaUser className="inline mr-2" />
              View Patient
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  {order.orderType === "lab" ? (
                    <FaFlask className="mr-2 text-blue-600" />
                  ) : (
                    <FaXRay className="mr-2 text-yellow-600" />
                  )}
                  Order Information
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`badge ${
                      order.orderType === "lab" ? "badge-info" : "badge-warning"
                    } uppercase`}
                  >
                    {order.orderType}
                  </span>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span
                    className={`font-semibold ${getPriorityColor(
                      order.priority
                    )} uppercase`}
                  >
                    {order.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Test/Procedure</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.testName}
                  </p>
                  {order.orderCategory && (
                    <p className="text-sm text-gray-500 capitalize">
                      Category: {order.orderCategory}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Ordered By</p>
                    <p className="font-medium">
                      Dr. {order.clinician.firstName} {order.clinician.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>

                {order.specimenType && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Specimen Type</p>
                    <p className="font-medium capitalize">
                      {order.specimenType}
                    </p>
                  </div>
                )}

                {order.collectedAt && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Collected At</p>
                    <p className="font-medium">
                      {format(
                        new Date(order.collectedAt),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Clinical Notes / Indication
                    </p>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Results</h2>
                {order.status !== "completed" &&
                  order.status !== "cancelled" && (
                    <Link
                      href={`/results/new?orderId=${order.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Add Results
                    </Link>
                  )}
              </div>

              {order.results && order.results.length > 0 ? (
                <div className="space-y-4">
                  {order.results.map((result, index) => (
                    <div
                      key={result.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            Result #{index + 1}
                          </span>
                          <span
                            className={`badge ${
                              result.resultType === "quantitative"
                                ? "badge-info"
                                : result.resultType === "qualitative"
                                ? "badge-success"
                                : "badge-warning"
                            } capitalize`}
                          >
                            {result.resultType}
                          </span>
                          {result.isAbnormal && (
                            <span className="badge badge-warning">
                              Abnormal
                            </span>
                          )}
                          {result.criticalFlag && (
                            <span className="badge badge-danger flex items-center">
                              <FaExclamationTriangle className="mr-1" />
                              Critical
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(result.createdAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </span>
                      </div>

                      {result.resultData && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">Values:</p>
                          <div className="bg-gray-50 rounded p-3">
                            <pre className="text-sm whitespace-pre-wrap">
                              {JSON.stringify(result.resultData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {result.resultText && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Report:</p>
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {result.resultText}
                          </p>
                        </div>
                      )}

                      <div className="pt-3 border-t flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span>
                            Entered by: {result.technician.firstName}{" "}
                            {result.technician.lastName}
                          </span>
                          {result.approvedBy && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-green-600">
                                <FaCheckCircle className="inline mr-1" />
                                Approved
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No results available yet</p>
                  {order.status !== "cancelled" && (
                    <Link
                      href={`/results/new?orderId=${order.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
                    >
                      Add results →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Patient Summary */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaUser className="mr-2 text-primary-600" />
                Patient Summary
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">MRN</p>
                  <p className="font-mono font-semibold">{patient.mrn}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sex</p>
                    <p className="font-medium capitalize">{patient.sex}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">
                      {patient.dateOfBirth
                        ? `${
                            new Date().getFullYear() -
                            new Date(patient.dateOfBirth).getFullYear()
                          } years`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Updates */}
            {order.status !== "completed" && order.status !== "cancelled" && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Update Status</h2>
                <div className="space-y-2">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleStatusUpdate("collected")}
                      className="block w-full btn btn-primary text-left"
                      disabled={updating}
                    >
                      Mark as Collected
                    </button>
                  )}
                  {order.status === "collected" && (
                    <button
                      onClick={() => handleStatusUpdate("processing")}
                      className="block w-full btn btn-primary text-left"
                      disabled={updating}
                    >
                      Mark as Processing
                    </button>
                  )}
                  {(order.status === "collected" ||
                    order.status === "processing") && (
                    <button
                      onClick={() => handleStatusUpdate("completed")}
                      className="block w-full btn btn-success text-left"
                      disabled={updating}
                    >
                      <FaCheckCircle className="inline mr-2" />
                      Mark as Completed
                    </button>
                  )}
                  <div className="pt-2 border-t">
                    <button
                      onClick={handleCancelOrder}
                      className="block w-full btn btn-danger text-left"
                      disabled={updating}
                    >
                      <FaTimesCircle className="inline mr-2" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/encounters/${order.encounter.id}`}
                  className="block w-full btn btn-secondary text-left"
                >
                  <FaStethoscope className="inline mr-2" />
                  View Encounter
                </Link>
                <Link
                  href={`/patients/${patient.id}`}
                  className="block w-full btn btn-secondary text-left"
                >
                  <FaUser className="inline mr-2" />
                  View Patient Details
                </Link>
                {order.status !== "completed" &&
                  order.status !== "cancelled" && (
                    <Link
                      href={`/results/new?orderId=${order.id}`}
                      className="block w-full btn btn-primary text-left"
                    >
                      <FaPlus className="inline mr-2" />
                      Add Results
                    </Link>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(OrderDetailsPage);
