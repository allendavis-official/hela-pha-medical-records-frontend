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
  FaMale,
  FaFemale,
  FaUser,
  FaTrash,
  FaArchive,
} from "react-icons/fa";
import { format } from "date-fns";

function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const { data, error, mutate } = useSWR(
    `/patients?search=${searchTerm}&page=${page}&limit=20`,
    () => api.getPatients({ search: searchTerm, page, limit: 20 })
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    mutate();
  };

  const handleDelete = async (patientId, patientName) => {
    if (
      !confirm(
        `⚠️ DELETE ${patientName}?\n\nThis will permanently remove this patient from the system.\n\nAre you sure?`
      )
    ) {
      return;
    }

    setDeletingId(patientId);
    try {
      await api.deletePatient(patientId);
      mutate(); // Refresh the list
      alert("Patient deleted successfully");
    } catch (error) {
      alert("Failed to delete patient: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleArchive = async (patientId, patientName) => {
    if (
      !confirm(
        `Archive ${patientName}?\n\nThe patient will be hidden from the list but can be restored later.`
      )
    ) {
      return;
    }

    setDeletingId(patientId);
    try {
      await api.archivePatient(patientId);
      mutate(); // Refresh the list
      alert("Patient archived successfully");
    } catch (error) {
      alert("Failed to archive patient: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load patients</div>
      </Layout>
    );
  }

  const patients = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">
              Manage patient records and information
            </p>
          </div>
          <Link href="/patients/new" className="btn btn-primary">
            <FaPlus className="inline mr-2" />
            New Patient
          </Link>
        </div>

        {/* Search Bar */}
        <div className="card">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, MRN, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Patients Table */}
        <div className="card">
          {!data ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No patients found</p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>MRN</th>
                      <th>Patient Name</th>
                      <th>Sex</th>
                      <th>Age</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => {
                      const age = patient.dateOfBirth
                        ? new Date().getFullYear() -
                          new Date(patient.dateOfBirth).getFullYear()
                        : patient.ageEstimate;

                      return (
                        <tr key={patient.id}>
                          <td>
                            {/* Patient Photo */}
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {patient.profileImage ? (
                                <img
                                  src={patient.profileImage}
                                  alt={`${patient.firstName} ${patient.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaUser className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="font-mono text-sm font-semibold text-primary-600">
                              {patient.mrn}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              {patient.sex === "male" ? (
                                <FaMale className="text-blue-500" />
                              ) : (
                                <FaFemale className="text-pink-500" />
                              )}
                              <span className="font-medium">
                                {patient.firstName} {patient.middleName}{" "}
                                {patient.lastName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="capitalize">{patient.sex}</span>
                          </td>
                          <td>{age ? `${age} years` : "-"}</td>
                          <td>{patient.phoneNumber || "-"}</td>
                          <td>{patient.city || "-"}</td>
                          <td>
                            {format(new Date(patient.createdAt), "MMM d, yyyy")}
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <Link
                                href={`/patients/${patient.id}`}
                                className="text-primary-600 hover:text-primary-800"
                                title="View Details"
                              >
                                <FaEye />
                              </Link>
                              <Link
                                href={`/patients/${patient.id}/edit`}
                                className="text-gray-600 hover:text-gray-800"
                                title="Edit Patient"
                              >
                                <FaEdit />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDelete(
                                    patient.id,
                                    `${patient.firstName} ${patient.lastName}`
                                  )
                                }
                                disabled={deletingId === patient.id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Delete Patient"
                              >
                                {deletingId === patient.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                                ) : (
                                  <FaTrash />
                                )}
                              </button>
                              {/* Archive Button */}
                              <button
                                onClick={() =>
                                  handleArchive(
                                    patient.id,
                                    `${patient.firstName} ${patient.lastName}`
                                  )
                                }
                                disabled={deletingId === patient.id}
                                className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                                title="Archive Patient"
                              >
                                {deletingId === patient.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                                ) : (
                                  <FaArchive />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between border-t pt-6">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * 20 + 1} to{" "}
                  {Math.min(pagination.page * 20, pagination.total)} of{" "}
                  {pagination.total} patients
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
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

export default withAuth(PatientsPage);
