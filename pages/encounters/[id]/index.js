import { useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import PrintButton from "../../../components/common/PrintButton";
import PrintableEncounter from "../../../components/print/PrintableEncounter";
import useSWR from "swr";
import api from "../../../lib/api";
import {
  FaEdit,
  FaUser,
  FaStethoscope,
  FaCalendar,
  FaNotesMedical,
  FaFlask,
  FaTimesCircle,
  FaCheck,
  FaHospital,
} from "react-icons/fa";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

function EncounterDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeData, setCloseData] = useState({
    outcome: "",
    diagnosis: "",
  });
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef();

  const {
    data,
    error: fetchError,
    mutate,
  } = useSWR(id ? `/encounters/${id}` : null, () => api.getEncounterById(id));

  if (fetchError) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load encounter details</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading encounter...</p>
        </div>
      </Layout>
    );
  }

  const encounter = data.data;
  const patient = encounter.patient;

  // ADD THIS: Create the print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Encounter_${data?.data?.patient?.mrn || "Summary"}`,
  });

  const handleCloseEncounter = async () => {
    if (!closeData.outcome) {
      setError("Outcome is required to close encounter");
      return;
    }

    setClosing(true);
    setError("");

    try {
      await api.closeEncounter(id, closeData);
      mutate(); // Refresh the data
      setShowCloseModal(false);
      setCloseData({ outcome: "", diagnosis: "" });
    } catch (err) {
      setError(err.message || "Failed to close encounter");
    } finally {
      setClosing(false);
    }
  };

  const getEncounterTypeColor = (type) => {
    switch (type) {
      case "emergency":
        return "badge-danger";
      case "ipd":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Encounter Details
            </h1>
            <p className="text-gray-600 mt-1">
              {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
            </p>
          </div>
          <div className="flex space-x-3">
            <PrintButton onClick={handlePrint} buttonText="Print Summary" />
            {encounter.status === "open" && (
              <>
                <Link
                  href={`/encounters/${id}/edit`}
                  className="btn btn-secondary"
                >
                  <FaEdit className="inline mr-2" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="btn btn-danger"
                >
                  <FaTimesCircle className="inline mr-2" />
                  Close Encounter
                </button>
              </>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encounter Information */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaStethoscope className="mr-2 text-primary-600" />
                  Encounter Information
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`badge ${getEncounterTypeColor(
                      encounter.encounterType
                    )} uppercase`}
                  >
                    {encounter.encounterType}
                  </span>
                  <span
                    className={`badge ${
                      encounter.status === "open"
                        ? "badge-success"
                        : "badge-info"
                    }`}
                  >
                    {encounter.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{encounter.department?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attending Clinician</p>
                  <p className="font-medium">
                    {encounter.attendingClinician ? (
                      `Dr. ${encounter.attendingClinician.firstName} ${encounter.attendingClinician.lastName}`
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admission Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(encounter.admissionDate),
                      "MMMM d, yyyy h:mm a"
                    )}
                  </p>
                </div>
                {encounter.dischargeDate && (
                  <div>
                    <p className="text-sm text-gray-600">Discharge Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(encounter.dischargeDate),
                        "MMMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {encounter.chiefComplaint && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Chief Complaint</p>
                  <p className="text-gray-900">{encounter.chiefComplaint}</p>
                </div>
              )}

              {encounter.diagnosis && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Diagnosis</p>
                  <p className="text-gray-900">{encounter.diagnosis}</p>
                </div>
              )}

              {encounter.outcome && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Outcome</p>
                  <p className="text-gray-900 capitalize">
                    {encounter.outcome}
                  </p>
                </div>
              )}
            </div>

            {/* Clinical Notes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaNotesMedical className="mr-2 text-primary-600" />
                  Clinical Notes
                </h2>
                {encounter.status === "open" && (
                  <Link
                    href={`/clinical-notes/new?encounterId=${encounter.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Add Note
                  </Link>
                )}
              </div>

              {encounter.clinicalNotes && encounter.clinicalNotes.length > 0 ? (
                <div className="space-y-3">
                  {encounter.clinicalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
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
                        <span className="text-xs text-gray-500">
                          {format(
                            new Date(note.createdAt),
                            "MMM d, yyyy h:mm a"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                        {note.noteText}
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {note.clinician.firstName} {note.clinician.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No clinical notes recorded
                </p>
              )}
            </div>

            {/* Orders */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaFlask className="mr-2 text-primary-600" />
                  Lab Orders
                </h2>
                {encounter.status === "open" && (
                  <Link
                    href={`/orders/new?encounterId=${encounter.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    New Order
                  </Link>
                )}
              </div>

              {encounter.orders && encounter.orders.length > 0 ? (
                <div className="space-y-3">
                  {encounter.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`badge ${
                              order.status === "pending"
                                ? "badge-warning"
                                : order.status === "completed"
                                ? "badge-success"
                                : order.status === "cancelled"
                                ? "badge-danger"
                                : "badge-info"
                            } capitalize`}
                          >
                            {order.status}
                          </span>
                          <span className="badge badge-info uppercase">
                            {order.orderType}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {order.testName}
                      </p>
                      {order.results && order.results.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-gray-600 mb-1">Results:</p>
                          {order.results.map((result, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              {result.resultValue} {result.resultUnit}
                              {result.isCritical && (
                                <span className="ml-2 badge badge-danger">
                                  Critical
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No orders placed
                </p>
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
                    {patient.firstName} {patient.middleName} {patient.lastName}
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
                        : patient.ageEstimate
                        ? `${patient.ageEstimate} years (est.)`
                        : "-"}
                    </p>
                  </div>
                </div>
                {patient.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{patient.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {encounter.status === "open" && (
                  <>
                    <Link
                      href={`/clinical-notes/new?encounterId=${encounter.id}`}
                      className="block w-full btn btn-primary text-left"
                    >
                      Add Clinical Note
                    </Link>
                    <Link
                      href={`/orders/new?encounterId=${encounter.id}`}
                      className="block w-full btn btn-secondary text-left"
                    >
                      Order Lab Test
                    </Link>
                  </>
                )}
                <Link
                  href={`/patients/${patient.id}`}
                  className="block w-full btn btn-secondary text-left"
                >
                  View Patient Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Encounter Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Close Encounter</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">Outcome *</label>
                <select
                  value={closeData.outcome}
                  onChange={(e) =>
                    setCloseData((prev) => ({
                      ...prev,
                      outcome: e.target.value,
                    }))
                  }
                  className="input"
                  required
                >
                  <option value="">Select Outcome</option>
                  <option value="discharged">Discharged</option>
                  <option value="transferred">Transferred</option>
                  <option value="deceased">Deceased</option>
                  <option value="absconded">Absconded</option>
                </select>
              </div>

              <div>
                <label className="label">Final Diagnosis</label>
                <textarea
                  value={closeData.diagnosis}
                  onChange={(e) =>
                    setCloseData((prev) => ({
                      ...prev,
                      diagnosis: e.target.value,
                    }))
                  }
                  className="input"
                  rows="3"
                  placeholder="Enter final diagnosis..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setError("");
                  setCloseData({ outcome: "", diagnosis: "" });
                }}
                className="btn btn-secondary"
                disabled={closing}
              >
                Cancel
              </button>
              <button
                onClick={handleCloseEncounter}
                className="btn btn-danger"
                disabled={closing || !closeData.outcome}
              >
                <FaCheck className="inline mr-2" />
                {closing ? "Closing..." : "Close Encounter"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD HIDDEN PRINTABLE COMPONENT */}
      <div style={{ display: "none" }}>
        <PrintableEncounter ref={printRef} encounter={encounter} />
      </div>
    </Layout>
  );
}

export default withAuth(EncounterDetailsPage);
