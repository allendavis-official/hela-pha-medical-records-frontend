import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth, useAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaSave, FaTimes, FaHeartbeat } from "react-icons/fa";

function NewClinicalNotePage() {
  const router = useRouter();
  const { encounterId } = router.query;
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [includeVitals, setIncludeVitals] = useState(false);

  const [formData, setFormData] = useState({
    encounterId: encounterId || "",
    noteType: "progress",
    noteText: "",
    vitals: {
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      temperature: "",
      pulse: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
    },
  });

  // Load encounter details if encounterId is provided
  const { data: encounterData } = useSWR(
    encounterId ? `/encounters/${encounterId}` : null,
    () => api.getEncounterById(encounterId)
  );

  const encounter = encounterData?.data;

  // Set encounterId from URL
  useEffect(() => {
    if (encounterId && !formData.encounterId) {
      setFormData((prev) => ({ ...prev, encounterId }));
    }
  }, [encounterId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        encounterId: formData.encounterId,
        noteType: formData.noteType,
        noteText: formData.noteText,
      };

      // Include vitals only if checkbox is checked and at least one vital is filled
      if (includeVitals) {
        const vitalsData = {};
        let hasVitals = false;

        Object.keys(formData.vitals).forEach((key) => {
          const value = formData.vitals[key];
          if (value !== "" && value !== null) {
            // Convert to number for numeric fields
            vitalsData[key] = parseFloat(value);
            hasVitals = true;
          }
        });

        if (hasVitals) {
          submitData.vitals = vitalsData;
        }
      }

      const response = await api.createClinicalNote(submitData);

      // Redirect back to encounter details
      router.push(`/encounters/${formData.encounterId}`);
    } catch (err) {
      setError(err.message || "Failed to create clinical note");
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.vitals.weight);
    const height = parseFloat(formData.vitals.height);

    if (weight && height && height > 0) {
      // BMI = weight(kg) / (height(m))^2
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return "";
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              New Clinical Note
            </h1>
            {encounter && (
              <p className="text-gray-600 mt-1">
                For: {encounter.patient.firstName} {encounter.patient.lastName}{" "}
                (MRN: {encounter.patient.mrn})
              </p>
            )}
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

        {/* Encounter Info */}
        {encounter && (
          <div className="card bg-primary-50 border-primary-200">
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
                <p className="font-semibold capitalize">{encounter.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Attending</p>
                <p className="font-semibold">
                  {encounter.attendingClinician
                    ? `Dr. ${encounter.attendingClinician.lastName}`
                    : "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Note Details */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Note Information</h2>

            <div>
              <label className="label">Note Type *</label>
              <select
                name="noteType"
                value={formData.noteType}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="admission">Admission Note</option>
                <option value="progress">Progress Note</option>
                <option value="discharge">Discharge Summary</option>
                <option value="other">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.noteType === "admission" &&
                  "Initial assessment and admission details"}
                {formData.noteType === "progress" &&
                  "Patient progress and ongoing care"}
                {formData.noteType === "discharge" &&
                  "Discharge summary and instructions"}
                {formData.noteType === "other" && "General clinical note"}
              </p>
            </div>

            <div className="mt-4">
              <label className="label">Clinical Note *</label>
              <textarea
                name="noteText"
                value={formData.noteText}
                onChange={handleChange}
                className="input"
                rows="8"
                placeholder="Enter clinical note... Include subjective findings, objective findings, assessment, and plan (SOAP format recommended)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Document patient assessment, findings, diagnosis, treatment
                plan, etc.
              </p>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <FaHeartbeat className="mr-2 text-red-500" />
                Vital Signs
              </h2>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVitals}
                  onChange={(e) => setIncludeVitals(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Include vitals with this note</span>
              </label>
            </div>

            {includeVitals && (
              <div className="space-y-4">
                {/* Blood Pressure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Blood Pressure - Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      name="bloodPressureSystolic"
                      value={formData.vitals.bloodPressureSystolic}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="120"
                      min="50"
                      max="250"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="label">
                      Blood Pressure - Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      name="bloodPressureDiastolic"
                      value={formData.vitals.bloodPressureDiastolic}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="80"
                      min="30"
                      max="150"
                      step="1"
                    />
                  </div>
                </div>

                {/* Temperature and Pulse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Temperature (°C)</label>
                    <input
                      type="number"
                      name="temperature"
                      value={formData.vitals.temperature}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="37.0"
                      min="30"
                      max="45"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="label">Pulse (bpm)</label>
                    <input
                      type="number"
                      name="pulse"
                      value={formData.vitals.pulse}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="72"
                      min="30"
                      max="250"
                      step="1"
                    />
                  </div>
                </div>

                {/* Respiratory Rate and Oxygen Saturation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      Respiratory Rate (breaths/min)
                    </label>
                    <input
                      type="number"
                      name="respiratoryRate"
                      value={formData.vitals.respiratoryRate}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="16"
                      min="5"
                      max="60"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="label">Oxygen Saturation (%)</label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      value={formData.vitals.oxygenSaturation}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="98"
                      min="50"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>

                {/* Weight and Height */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.vitals.weight}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="70"
                      min="0"
                      max="500"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="label">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.vitals.height}
                      onChange={handleVitalChange}
                      className="input"
                      placeholder="170"
                      min="0"
                      max="300"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="label">BMI (Calculated)</label>
                    <input
                      type="text"
                      value={calculateBMI()}
                      className="input bg-gray-50"
                      placeholder="Auto-calculated"
                      disabled
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Note:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All vital sign fields are optional</li>
                    <li>
                      BMI is automatically calculated from weight and height
                    </li>
                    <li>
                      Values are validated to ensure they're within normal
                      ranges
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {!includeVitals && (
              <p className="text-gray-600 text-center py-4">
                Check the box above to record vital signs with this note
              </p>
            )}
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
              disabled={loading || !formData.encounterId}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Saving..." : "Save Clinical Note"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(NewClinicalNotePage);
