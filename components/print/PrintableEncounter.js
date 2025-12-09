import React from "react";
import { format } from "date-fns";

const PrintableEncounter = React.forwardRef(({ encounter }, ref) => {
  const patient = encounter.patient;
  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : patient.ageEstimate;

  return (
    <div ref={ref} className="print-container">
      {/* Header */}
      <div className="print-header">
        <div>
          <h1>Hela PHA Medical Records</h1>
          <p>Encounter Summary</p>
        </div>
        <div className="print-date">
          Printed: {format(new Date(), "MMMM d, yyyy h:mm a")}
        </div>
      </div>

      {/* Patient Information */}
      <div className="print-section">
        <h2 className="print-section-title">Patient Information</h2>
        <table className="print-table">
          <tbody>
            <tr>
              <td className="print-label">MRN:</td>
              <td className="print-value">
                <strong>{patient.mrn}</strong>
              </td>
            </tr>
            <tr>
              <td className="print-label">Name:</td>
              <td className="print-value">
                {patient.firstName} {patient.middleName} {patient.lastName}
              </td>
            </tr>
            <tr>
              <td className="print-label">Sex:</td>
              <td
                className="print-value"
                style={{ textTransform: "capitalize" }}
              >
                {patient.sex}
              </td>
            </tr>
            <tr>
              <td className="print-label">Age:</td>
              <td className="print-value">
                {age ? `${age} years` : "Unknown"}
              </td>
            </tr>
            <tr>
              <td className="print-label">Phone:</td>
              <td className="print-value">
                {patient.phoneNumber || "Not provided"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Encounter Details */}
      <div className="print-section">
        <h2 className="print-section-title">Encounter Details</h2>
        <table className="print-table">
          <tbody>
            <tr>
              <td className="print-label">Encounter Type:</td>
              <td
                className="print-value"
                style={{ textTransform: "capitalize" }}
              >
                <strong>{encounter.encounterType}</strong>
              </td>
            </tr>
            <tr>
              <td className="print-label">Department:</td>
              <td className="print-value">{encounter.department?.name}</td>
            </tr>
            <tr>
              <td className="print-label">Attending Clinician:</td>
              <td className="print-value">
                {encounter.attendingClinician
                  ? `Dr. ${encounter.attendingClinician.firstName} ${encounter.attendingClinician.lastName}`
                  : "Not assigned"}
              </td>
            </tr>
            <tr>
              <td className="print-label">Admission Date:</td>
              <td className="print-value">
                {format(
                  new Date(encounter.admissionDate),
                  "MMMM d, yyyy h:mm a"
                )}
              </td>
            </tr>
            {encounter.dischargeDate && (
              <tr>
                <td className="print-label">Discharge Date:</td>
                <td className="print-value">
                  {format(
                    new Date(encounter.dischargeDate),
                    "MMMM d, yyyy h:mm a"
                  )}
                </td>
              </tr>
            )}
            <tr>
              <td className="print-label">Status:</td>
              <td
                className="print-value"
                style={{ textTransform: "capitalize" }}
              >
                <strong>{encounter.status}</strong>
              </td>
            </tr>
            {encounter.chiefComplaint && (
              <tr>
                <td className="print-label">Chief Complaint:</td>
                <td className="print-value">{encounter.chiefComplaint}</td>
              </tr>
            )}
            {encounter.diagnosis && (
              <tr>
                <td className="print-label">Diagnosis:</td>
                <td className="print-value">{encounter.diagnosis}</td>
              </tr>
            )}
            {encounter.outcome && (
              <tr>
                <td className="print-label">Outcome:</td>
                <td
                  className="print-value"
                  style={{ textTransform: "capitalize" }}
                >
                  {encounter.outcome}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Clinical Notes */}
      {encounter.clinicalNotes && encounter.clinicalNotes.length > 0 && (
        <div className="print-section page-break-before">
          <h2 className="print-section-title">Clinical Notes</h2>
          {encounter.clinicalNotes.map((note, index) => (
            <div key={note.id} className="print-note">
              <div className="print-note-header">
                <strong style={{ textTransform: "capitalize" }}>
                  {note.noteType} Note
                </strong>
                <span>
                  {format(new Date(note.createdAt), "MMM d, yyyy h:mm a")} by{" "}
                  {note.clinician.firstName} {note.clinician.lastName}
                </span>
              </div>

              {/* Vitals if present */}
              {note.vitals && (
                <div
                  style={{
                    marginTop: "10px",
                    marginBottom: "10px",
                    padding: "10px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <strong>Vital Signs:</strong>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "10px",
                      marginTop: "5px",
                    }}
                  >
                    {note.vitals.temperature && (
                      <div>Temp: {note.vitals.temperature}°C</div>
                    )}
                    {note.vitals.bloodPressureSystolic && (
                      <div>
                        BP: {note.vitals.bloodPressureSystolic}/
                        {note.vitals.bloodPressureDiastolic}
                      </div>
                    )}
                    {note.vitals.pulse && (
                      <div>Pulse: {note.vitals.pulse} bpm</div>
                    )}
                    {note.vitals.respiratoryRate && (
                      <div>RR: {note.vitals.respiratoryRate}</div>
                    )}
                    {note.vitals.oxygenSaturation && (
                      <div>SpO2: {note.vitals.oxygenSaturation}%</div>
                    )}
                    {note.vitals.weight && (
                      <div>Weight: {note.vitals.weight} kg</div>
                    )}
                  </div>
                </div>
              )}

              {/* Note text */}
              <div className="print-note-text">{note.noteText}</div>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
      {encounter.orders && encounter.orders.length > 0 && (
        <div className="print-section page-break-before">
          <h2 className="print-section-title">Orders</h2>
          <table className="print-table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Test/Procedure</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Ordered By</th>
              </tr>
            </thead>
            <tbody>
              {encounter.orders.map((order) => (
                <tr key={order.id}>
                  <td>{format(new Date(order.createdAt), "MMM d, yyyy")}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {order.orderType}
                  </td>
                  <td>{order.testName}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {order.priority}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {order.status}
                  </td>
                  <td>
                    {order.clinician.firstName} {order.clinician.lastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Results */}
          {encounter.orders.some(
            (order) => order.results && order.results.length > 0
          ) && (
            <div style={{ marginTop: "20px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "10px",
                }}
              >
                Results
              </h3>
              {encounter.orders.map(
                (order) =>
                  order.results &&
                  order.results.length > 0 && (
                    <div
                      key={order.id}
                      style={{
                        marginBottom: "15px",
                        padding: "10px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        {order.testName}
                        {order.results[0].isAbnormal && (
                          <span
                            style={{ color: "#ef4444", marginLeft: "10px" }}
                          >
                            (ABNORMAL)
                          </span>
                        )}
                        {order.results[0].criticalFlag && (
                          <span
                            style={{ color: "#dc2626", marginLeft: "10px" }}
                          >
                            (CRITICAL)
                          </span>
                        )}
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        {order.results[0].resultText ||
                          JSON.stringify(order.results[0].resultData)}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "5px",
                        }}
                      >
                        Result entered:{" "}
                        {format(
                          new Date(order.results[0].createdAt),
                          "MMM d, yyyy h:mm a"
                        )}{" "}
                        by {order.results[0].technician.firstName}{" "}
                        {order.results[0].technician.lastName}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="print-footer">
        <p>This is a confidential medical record. Handle with care.</p>
        <p>© {new Date().getFullYear()} Hela PHA Medical Records Platform</p>
      </div>
    </div>
  );
});

PrintableEncounter.displayName = "PrintableEncounter";

export default PrintableEncounter;
