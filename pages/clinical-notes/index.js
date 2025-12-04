import { useState } from "react";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaPlus, FaEye, FaNotesMedical, FaUser } from "react-icons/fa";
import { format } from "date-fns";

function ClinicalNotesPage() {
  const [filters, setFilters] = useState({
    noteType: "",
    page: 1,
    limit: 50,
  });

  // Fetch all clinical notes directly
  const { data: notesData, error } = useSWR(
    `/clinical-notes?${JSON.stringify(filters)}`,
    () => api.getAllClinicalNotes(filters)
  );

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">
          Failed to load clinical notes: {error.message}
        </div>
      </Layout>
    );
  }

  const allNotes = notesData?.data || [];
  const pagination = notesData?.pagination || { page: 1, pages: 1, total: 0 };

  // Filter notes by type if selected (for statistics)
  const filteredNotes = allNotes;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinical Notes</h1>
            <p className="text-gray-600 mt-1">
              View and manage clinical documentation
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Note Type</label>
              <select
                value={filters.noteType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, noteType: e.target.value }))
                }
                className="input"
              >
                <option value="">All Types</option>
                <option value="admission">Admission</option>
                <option value="progress">Progress</option>
                <option value="discharge">Discharge</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Notes</p>
            <p className="text-3xl font-bold text-gray-900">
              {allNotes.length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Admission Notes</p>
            <p className="text-3xl font-bold text-green-600">
              {allNotes.filter((n) => n.noteType === "admission").length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Progress Notes</p>
            <p className="text-3xl font-bold text-blue-600">
              {allNotes.filter((n) => n.noteType === "progress").length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Discharge Notes</p>
            <p className="text-3xl font-bold text-yellow-600">
              {allNotes.filter((n) => n.noteType === "discharge").length}
            </p>
          </div>
        </div>

        {/* Notes List */}
        <div className="card">
          {!notesData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading clinical notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FaNotesMedical className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No clinical notes found</p>
              <p className="text-sm text-gray-500 mt-2">
                {filters.noteType
                  ? "Try changing the filter"
                  : "Clinical notes will appear here once created"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`badge ${
                          note.noteType === "admission"
                            ? "badge-success"
                            : note.noteType === "progress"
                            ? "badge-info"
                            : note.noteType === "discharge"
                            ? "badge-warning"
                            : "badge-info"
                        } capitalize`}
                      >
                        {note.noteType}
                      </span>
                      <span className="badge badge-warning uppercase">
                        {note.encounter.encounterType}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaUser className="text-gray-400" />
                      <Link
                        href={`/patients/${note.encounter.patient.id}`}
                        className="font-semibold text-primary-600 hover:text-primary-800"
                      >
                        {note.encounter.patient.firstName}{" "}
                        {note.encounter.patient.lastName}
                      </Link>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        MRN: {note.encounter.patient.mrn}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
                      {note.noteText}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      <span>
                        By: {note.clinician.firstName} {note.clinician.lastName}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Department: {note.encounter.department?.name || "N/A"}
                      </span>
                      {note.vitals && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-green-600 font-medium">
                            Vitals recorded
                          </span>
                        </>
                      )}
                    </div>
                    <Link
                      href={`/encounters/${note.encounter.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                    >
                      <FaEye className="mr-1" />
                      View Encounter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(ClinicalNotesPage);
