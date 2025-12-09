import React from "react";
import { format } from "date-fns";

const PrintablePatientDetails = React.forwardRef(({ patient, vitals }, ref) => {
  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : patient.ageEstimate;

  return (
    <div ref={ref} className="print-container">
      {/* Header */}
      <div className="print-header">
        <div>
          <h1>Hela PHA Medical Records</h1>
          <p>Patient Information Sheet</p>
        </div>
        <div className="print-date">
          Printed: {format(new Date(), "MMMM d, yyyy h:mm a")}
        </div>
      </div>

      {/* Patient Photo and Basic Info */}
      <div className="print-section">
        <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
          {patient.profileImage && (
            <div style={{ flexShrink: 0 }}>
              <img
                src={patient.profileImage}
                alt={`${patient.firstName} ${patient.lastName}`}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h2 className="print-section-title">Patient Information</h2>
            <table className="print-table">
              <tbody>
                <tr>
                  <td className="print-label">Medical Record Number:</td>
                  <td className="print-value">
                    <strong>{patient.mrn}</strong>
                  </td>
                </tr>
                <tr>
                  <td className="print-label">Full Name:</td>
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
                {patient.dateOfBirth && (
                  <tr>
                    <td className="print-label">Date of Birth:</td>
                    <td className="print-value">
                      {format(new Date(patient.dateOfBirth), "MMMM d, yyyy")}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="print-label">Registration Date:</td>
                  <td className="print-value">
                    {format(new Date(patient.createdAt), "MMMM d, yyyy")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="print-section">
        <h2 className="print-section-title">Contact Information</h2>
        <table className="print-table">
          <tbody>
            <tr>
              <td className="print-label">Phone Number:</td>
              <td className="print-value">
                {patient.phoneNumber || "Not provided"}
              </td>
            </tr>
            <tr>
              <td className="print-label">Address:</td>
              <td className="print-value">
                {patient.address || "Not provided"}
              </td>
            </tr>
            <tr>
              <td className="print-label">City:</td>
              <td className="print-value">{patient.city || "-"}</td>
            </tr>
            <tr>
              <td className="print-label">Town/Village:</td>
              <td className="print-value">{patient.town || "-"}</td>
            </tr>
            <tr>
              <td className="print-label">District:</td>
              <td className="print-value">{patient.district || "-"}</td>
            </tr>
            <tr>
              <td className="print-label">Province:</td>
              <td className="print-value">{patient.province || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Next of Kin */}
      {patient.nextOfKinName && (
        <div className="print-section">
          <h2 className="print-section-title">Next of Kin</h2>
          <table className="print-table">
            <tbody>
              <tr>
                <td className="print-label">Name:</td>
                <td className="print-value">{patient.nextOfKinName}</td>
              </tr>
              <tr>
                <td className="print-label">Phone:</td>
                <td className="print-value">{patient.nextOfKinPhone || "-"}</td>
              </tr>
              <tr>
                <td className="print-label">Relationship:</td>
                <td
                  className="print-value"
                  style={{ textTransform: "capitalize" }}
                >
                  {patient.nextOfKinRelation || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Latest Vitals */}
      {vitals && (
        <div className="print-section">
          <h2 className="print-section-title">Latest Vital Signs</h2>
          <table className="print-table">
            <tbody>
              {vitals.vitals.temperature && (
                <tr>
                  <td className="print-label">Temperature:</td>
                  <td className="print-value">{vitals.vitals.temperature}°C</td>
                </tr>
              )}
              {vitals.vitals.bloodPressureSystolic && (
                <tr>
                  <td className="print-label">Blood Pressure:</td>
                  <td className="print-value">
                    {vitals.vitals.bloodPressureSystolic}/
                    {vitals.vitals.bloodPressureDiastolic} mmHg
                  </td>
                </tr>
              )}
              {vitals.vitals.pulse && (
                <tr>
                  <td className="print-label">Pulse:</td>
                  <td className="print-value">{vitals.vitals.pulse} bpm</td>
                </tr>
              )}
              {vitals.vitals.respiratoryRate && (
                <tr>
                  <td className="print-label">Respiratory Rate:</td>
                  <td className="print-value">
                    {vitals.vitals.respiratoryRate} breaths/min
                  </td>
                </tr>
              )}
              {vitals.vitals.oxygenSaturation && (
                <tr>
                  <td className="print-label">Oxygen Saturation:</td>
                  <td className="print-value">
                    {vitals.vitals.oxygenSaturation}%
                  </td>
                </tr>
              )}
              {vitals.vitals.weight && (
                <tr>
                  <td className="print-label">Weight:</td>
                  <td className="print-value">{vitals.vitals.weight} kg</td>
                </tr>
              )}
              {vitals.vitals.height && (
                <tr>
                  <td className="print-label">Height:</td>
                  <td className="print-value">{vitals.vitals.height} cm</td>
                </tr>
              )}
              <tr>
                <td className="print-label">Recorded:</td>
                <td className="print-value">
                  {format(new Date(vitals.createdAt), "MMMM d, yyyy")} by{" "}
                  {vitals.clinician.firstName} {vitals.clinician.lastName}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Encounters */}
      {patient.encounters && patient.encounters.length > 0 && (
        <div className="print-section">
          <h2 className="print-section-title">Recent Encounters</h2>
          <table className="print-table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Department</th>
                <th>Status</th>
                <th>Chief Complaint</th>
              </tr>
            </thead>
            <tbody>
              {patient.encounters.slice(0, 5).map((encounter) => (
                <tr key={encounter.id}>
                  <td>
                    {format(new Date(encounter.admissionDate), "MMM d, yyyy")}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {encounter.encounterType}
                  </td>
                  <td>{encounter.department?.name}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {encounter.status}
                  </td>
                  <td>{encounter.chiefComplaint || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

PrintablePatientDetails.displayName = "PrintablePatientDetails";

export default PrintablePatientDetails;
