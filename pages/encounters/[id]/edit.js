import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import useSWR from "swr";
import api from "../../../lib/api";
import { FaSave, FaTimes } from "react-icons/fa";

function EditEncounterPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    attendingClinicianId: "",
    chiefComplaint: "",
    diagnosis: "",
    outcome: "",
  });

  // Load encounter data
  const { data: encounterData, error: fetchError } = useSWR(
    id ? `/encounters/${id}` : null,
    () => api.getEncounterById(id)
  );

  // Load clinicians
  const { data: usersData } = useSWR("/users", () => api.getUsers());

  const encounter = encounterData?.data;
  const users = usersData?.data || [];
  const clinicians = users.filter(
    (u) => u.role?.name === "clinician" || u.role?.name === "admin"
  );

  // Populate form when encounter data loads
  useEffect(() => {
    if (encounter) {
      setFormData({
        attendingClinicianId: encounter.attendingClinicianId || "",
        chiefComplaint: encounter.chiefComplaint || "",
        diagnosis: encounter.diagnosis || "",
        outcome: encounter.outcome || "",
      });
    }
  }, [encounter]);

  if (fetchError) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load encounter</div>
      </Layout>
    );
  }

  if (!encounter) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading encounter...</p>
        </div>
      </Layout>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      await api.updateEncounter(id, submitData);

      // Redirect to encounter details
      router.push(`/encounters/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update encounter");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Encounter</h1>
            <p className="text-gray-600 mt-1">
              Patient: {encounter.patient.firstName}{" "}
              {encounter.patient.lastName} (MRN: {encounter.patient.mrn})
            </p>
          </div>
          <button
            onClick={() => router.push(`/encounters/${id}`)}
            className="btn btn-secondary"
          >
            <FaTimes className="inline mr-2" />
            Cancel
          </button>
        </div>

        {/* Encounter Info */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Encounter Type</p>
              <p className="font-semibold uppercase">
                {encounter.encounterType}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Department</p>
              <p className="font-semibold">{encounter.department?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-semibold uppercase">{encounter.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Admission Date</p>
              <p className="font-semibold">
                {new Date(encounter.admissionDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Note about closed encounters */}
        {encounter.status === "closed" && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">⚠️ This encounter is closed</p>
            <p className="text-sm mt-1">
              Editing closed encounters is restricted. Contact an administrator
              if changes are needed.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Encounter Details */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Encounter Details</h2>

            <div>
              <label className="label">Attending Clinician</label>
              <select
                name="attendingClinicianId"
                value={formData.attendingClinicianId}
                onChange={handleChange}
                className="input"
                disabled={encounter.status === "closed"}
              >
                <option value="">Select clinician</option>
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
                placeholder="Primary reason for visit..."
                disabled={encounter.status === "closed"}
              />
            </div>

            <div className="mt-4">
              <label className="label">Diagnosis</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Clinical diagnosis..."
                disabled={encounter.status === "closed"}
              />
            </div>

            {encounter.status === "closed" && (
              <div className="mt-4">
                <label className="label">Outcome</label>
                <textarea
                  name="outcome"
                  value={formData.outcome}
                  onChange={handleChange}
                  className="input"
                  rows="2"
                  placeholder="Outcome/disposition..."
                  disabled
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/encounters/${id}`)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || encounter.status === "closed"}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(EditEncounterPage);
