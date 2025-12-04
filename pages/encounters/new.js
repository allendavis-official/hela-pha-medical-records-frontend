import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaSave, FaTimes, FaSearch } from "react-icons/fa";

function NewEncounterPage() {
  const router = useRouter();
  const { patientId } = router.query; // Pre-select patient if coming from patient details

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientSearch, setShowPatientSearch] = useState(!patientId);

  const [formData, setFormData] = useState({
    patientId: patientId || "",
    departmentId: "",
    encounterType: "opd",
    attendingClinicianId: "",
    chiefComplaint: "",
    diagnosis: "",
  });

  // Load departments
  const { data: departmentsData } = useSWR("/departments", () =>
    api.getDepartments()
  );

  // Load clinicians (users with clinician role)
  const { data: usersData } = useSWR("/users", () => api.getUsers());

  // Load patient if pre-selected
  const { data: selectedPatientData } = useSWR(
    formData.patientId ? `/patients/${formData.patientId}` : null,
    () => api.getPatientById(formData.patientId)
  );

  // Search patients
  const { data: patientsSearchData } = useSWR(
    patientSearch ? `/patients?search=${patientSearch}&limit=10` : null,
    () => api.getPatients({ search: patientSearch, limit: 10 })
  );

  const departments = departmentsData?.data || [];
  const users = usersData?.data || [];
  const clinicians = users.filter(
    (user) => user.role?.name === "clinician" || user.role?.name === "admin"
  );
  const selectedPatient = selectedPatientData?.data;
  const patientSearchResults = patientsSearchData?.data || [];

  // Pre-select patient from URL
  useEffect(() => {
    if (patientId && !formData.patientId) {
      setFormData((prev) => ({ ...prev, patientId }));
      setShowPatientSearch(false);
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientSelect = (patient) => {
    setFormData((prev) => ({ ...prev, patientId: patient.id }));
    setShowPatientSearch(false);
    setPatientSearch("");
  };

  const handleClearPatient = () => {
    setFormData((prev) => ({ ...prev, patientId: "" }));
    setShowPatientSearch(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = { ...formData };

      // Remove empty optional fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "") {
          delete submitData[key];
        }
      });

      const response = await api.createEncounter(submitData);

      // Redirect to encounter details
      router.push(`/encounters/${response.data.id}`);
    } catch (err) {
      setError(err.message || "Failed to create encounter");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Encounter</h1>
            <p className="text-gray-600 mt-1">Create a new patient encounter</p>
          </div>
          <button onClick={() => router.back()} className="btn btn-secondary">
            <FaTimes className="inline mr-2" />
            Cancel
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Patient Information</h2>

            {selectedPatient ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedPatient.firstName} {selectedPatient.middleName}{" "}
                      {selectedPatient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      MRN:{" "}
                      <span className="font-mono font-semibold">
                        {selectedPatient.mrn}
                      </span>
                      {" • "}
                      Sex:{" "}
                      <span className="capitalize">{selectedPatient.sex}</span>
                      {selectedPatient.dateOfBirth && (
                        <>
                          {" • "}
                          Age:{" "}
                          {new Date().getFullYear() -
                            new Date(
                              selectedPatient.dateOfBirth
                            ).getFullYear()}{" "}
                          years
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPatient}
                    className="btn btn-secondary"
                  >
                    Change Patient
                  </button>
                </div>
              </div>
            ) : showPatientSearch ? (
              <div>
                <label className="label">Search Patient *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or MRN..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="input pl-10"
                  />
                </div>

                {patientSearch && patientSearchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {patientSearchResults.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <p className="font-medium">
                          {patient.firstName} {patient.middleName}{" "}
                          {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          MRN: {patient.mrn} • {patient.sex}
                          {patient.dateOfBirth &&
                            ` • ${
                              new Date().getFullYear() -
                              new Date(patient.dateOfBirth).getFullYear()
                            } years`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {patientSearch && patientSearchResults.length === 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    No patients found
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* Encounter Details */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Encounter Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Encounter Type *</label>
                <select
                  name="encounterType"
                  value={formData.encounterType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="opd">OPD (Outpatient Department)</option>
                  <option value="ipd">IPD (Inpatient Department)</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="label">Department *</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="label">Attending Clinician</label>
              <select
                name="attendingClinicianId"
                value={formData.attendingClinicianId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Assign Later</option>
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    Dr. {clinician.firstName} {clinician.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="label">Chief Complaint</label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Patient's main complaint or reason for visit..."
              />
            </div>

            <div className="mt-4">
              <label className="label">Provisional Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Initial diagnosis or working diagnosis..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.patientId}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Creating..." : "Create Encounter"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(NewEncounterPage);
