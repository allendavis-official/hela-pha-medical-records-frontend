import { useState } from "react";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaPlus, FaEye, FaSearch, FaTimesCircle } from "react-icons/fa";
import { format } from "date-fns";

function EncountersPage() {
  const [filters, setFilters] = useState({
    status: "open",
    encounterType: "",
    departmentId: "",
    patientId: "",
    page: 1,
    limit: 20,
  });

  const {
    data: encountersData,
    error,
    mutate,
  } = useSWR(`/encounters?${new URLSearchParams(filters).toString()}`, () =>
    api.getEncounters(filters)
  );

  const { data: departmentsData } = useSWR("/departments", () =>
    api.getDepartments()
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load encounters</div>
      </Layout>
    );
  }

  const encounters = encountersData?.data || [];
  const pagination = encountersData?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
  };
  const departments = departmentsData?.data || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Encounters</h1>
            <p className="text-gray-600 mt-1">
              Manage patient encounters and visits
            </p>
          </div>
          <Link href="/encounters/new" className="btn btn-primary">
            <FaPlus className="inline mr-2" />
            New Encounter
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
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Encounter Type Filter */}
            <div>
              <label className="label">Encounter Type</label>
              <select
                value={filters.encounterType}
                onChange={(e) =>
                  handleFilterChange("encounterType", e.target.value)
                }
                className="input"
              >
                <option value="">All Types</option>
                <option value="opd">OPD (Outpatient)</option>
                <option value="ipd">IPD (Inpatient)</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="label">Department</label>
              <select
                value={filters.departmentId}
                onChange={(e) =>
                  handleFilterChange("departmentId", e.target.value)
                }
                className="input"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    status: "open",
                    encounterType: "",
                    departmentId: "",
                    patientId: "",
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

        {/* Encounters Table */}
        <div className="card">
          {!encountersData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading encounters...</p>
            </div>
          ) : encounters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No encounters found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your filters or create a new encounter
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>MRN</th>
                      <th>Type</th>
                      <th>Department</th>
                      <th>Clinician</th>
                      <th>Chief Complaint</th>
                      <th>Admission Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {encounters.map((encounter) => (
                      <tr key={encounter.id}>
                        <td>
                          <Link
                            href={`/patients/${encounter.patient.id}`}
                            className="font-medium text-primary-600 hover:text-primary-800"
                          >
                            {encounter.patient.firstName}{" "}
                            {encounter.patient.lastName}
                          </Link>
                        </td>
                        <td>
                          <span className="font-mono text-sm">
                            {encounter.patient.mrn}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              encounter.encounterType === "emergency"
                                ? "badge-danger"
                                : encounter.encounterType === "ipd"
                                ? "badge-warning"
                                : "badge-info"
                            } uppercase`}
                          >
                            {encounter.encounterType}
                          </span>
                        </td>
                        <td>{encounter.department?.name || "-"}</td>
                        <td>
                          {encounter.attendingClinician ? (
                            `Dr. ${encounter.attendingClinician.lastName}`
                          ) : (
                            <span className="text-gray-400 italic">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="text-sm">
                            {encounter.chiefComplaint
                              ? encounter.chiefComplaint.substring(0, 40) +
                                (encounter.chiefComplaint.length > 40
                                  ? "..."
                                  : "")
                              : "-"}
                          </span>
                        </td>
                        <td>
                          {format(
                            new Date(encounter.admissionDate),
                            "MMM d, yyyy"
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              encounter.status === "open"
                                ? "badge-success"
                                : "badge-info"
                            }`}
                          >
                            {encounter.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <Link
                              href={`/encounters/${encounter.id}`}
                              className="text-primary-600 hover:text-primary-800"
                              title="View Details"
                            >
                              <FaEye />
                            </Link>
                            {encounter.status === "open" && (
                              <Link
                                href={`/encounters/${encounter.id}?action=close`}
                                className="text-red-600 hover:text-red-800"
                                title="Close Encounter"
                              >
                                <FaTimesCircle />
                              </Link>
                            )}
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
                  of {pagination.total} encounters
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

export default withAuth(EncountersPage);
