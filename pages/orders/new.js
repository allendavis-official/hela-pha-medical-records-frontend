import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaSave, FaTimes, FaFlask, FaXRay, FaSearch } from "react-icons/fa";

// Common lab tests
const LAB_TESTS = {
  hematology: [
    "Complete Blood Count (CBC)",
    "Hemoglobin & Hematocrit",
    "White Blood Cell Count",
    "Platelet Count",
    "Blood Film",
    "ESR (Erythrocyte Sedimentation Rate)",
  ],
  chemistry: [
    "Basic Metabolic Panel",
    "Comprehensive Metabolic Panel",
    "Liver Function Tests (LFTs)",
    "Kidney Function Tests (KFTs)",
    "Lipid Profile",
    "Blood Glucose",
    "HbA1c",
    "Electrolytes",
  ],
  microbiology: [
    "Blood Culture",
    "Urine Culture",
    "Stool Culture",
    "Wound Swab Culture",
    "Throat Swab",
    "Malaria Test",
  ],
  serology: [
    "HIV Test",
    "Hepatitis B Surface Antigen",
    "Hepatitis C Antibody",
    "Syphilis Test (VDRL)",
    "Pregnancy Test",
  ],
};

// Common radiology procedures
const RADIOLOGY_TESTS = {
  "x-ray": [
    "Chest X-Ray (PA)",
    "Chest X-Ray (Lateral)",
    "Abdominal X-Ray",
    "Skull X-Ray",
    "Spine X-Ray",
    "Pelvis X-Ray",
    "Extremity X-Ray",
  ],
  ultrasound: [
    "Abdominal Ultrasound",
    "Pelvic Ultrasound",
    "Obstetric Ultrasound",
    "Breast Ultrasound",
    "Thyroid Ultrasound",
  ],
  ct: [
    "CT Scan - Head",
    "CT Scan - Chest",
    "CT Scan - Abdomen",
    "CT Scan - Pelvis",
  ],
};

function NewOrderPage() {
  const router = useRouter();
  const { encounterId, patientId } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientSearch, setShowPatientSearch] = useState(!encounterId);
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  const [formData, setFormData] = useState({
    encounterId: encounterId || "",
    orderType: "lab",
    orderCategory: "hematology",
    testName: "",
    priority: "routine",
    specimenType: "",
    notes: "",
  });

  // Load encounter if pre-selected
  const { data: encounterData } = useSWR(
    formData.encounterId ? `/encounters/${formData.encounterId}` : null,
    () => api.getEncounterById(formData.encounterId)
  );

  // Search patients for encounter selection
  const { data: patientsSearchData } = useSWR(
    patientSearch ? `/patients?search=${patientSearch}&limit=10` : null,
    () => api.getPatients({ search: patientSearch, limit: 10 })
  );

  const patientSearchResults = patientsSearchData?.data || [];
  const encounter = encounterData?.data;

  // Set encounterId from URL
  useEffect(() => {
    if (encounterId && !formData.encounterId) {
      setFormData((prev) => ({ ...prev, encounterId }));
      setShowPatientSearch(false);
    }
  }, [encounterId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset test name when category changes
    if (name === "orderCategory" || name === "orderType") {
      setFormData((prev) => ({ ...prev, testName: "" }));
    }
  };

  const handlePatientSelect = async (patient) => {
    setPatientSearch("");
    // Get patient's open encounter
    try {
      const encountersData = await api.getEncounters({
        patientId: patient.id,
        status: "open",
        limit: 1,
      });

      if (encountersData.data && encountersData.data.length > 0) {
        const openEncounter = encountersData.data[0];
        setFormData((prev) => ({ ...prev, encounterId: openEncounter.id }));
        setShowPatientSearch(false);
      } else {
        setError(
          `Patient ${patient.firstName} ${patient.lastName} has no open encounters. Please create an encounter first.`
        );
      }
    } catch (err) {
      setError("Failed to load patient encounters");
    }
  };

  const handleClearEncounter = () => {
    setFormData((prev) => ({ ...prev, encounterId: "" }));
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

      const response = await api.createOrder(submitData);

      // Redirect to order details
      router.push(`/orders/${response.data.id}`);
    } catch (err) {
      setError(err.message || "Failed to create order");
      setLoading(false);
    }
  };

  const getTestOptions = () => {
    if (formData.orderType === "lab") {
      return LAB_TESTS[formData.orderCategory] || [];
    } else {
      return RADIOLOGY_TESTS[formData.orderCategory] || [];
    }
  };

  const getCategoryOptions = () => {
    if (formData.orderType === "lab") {
      return [
        { value: "hematology", label: "Hematology" },
        { value: "chemistry", label: "Chemistry" },
        { value: "microbiology", label: "Microbiology" },
        { value: "serology", label: "Serology" },
      ];
    } else {
      return [
        { value: "x-ray", label: "X-Ray" },
        { value: "ultrasound", label: "Ultrasound" },
        { value: "ct", label: "CT Scan" },
      ];
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
            <p className="text-gray-600 mt-1">
              Create a new lab or radiology order
            </p>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {encounter.patient.firstName} {encounter.patient.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  MRN:{" "}
                  <span className="font-mono font-semibold">
                    {encounter.patient.mrn}
                  </span>
                  {" • "}
                  Encounter:{" "}
                  <span className="uppercase">{encounter.encounterType}</span>
                  {" • "}
                  Department: {encounter.department?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearEncounter}
                className="btn btn-secondary"
              >
                Change Patient
              </button>
            </div>
          </div>
        )}

        {/* Patient Search */}
        {!encounter && showPatientSearch && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Select Patient</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by patient name or MRN..."
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
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      MRN: {patient.mrn} • {patient.sex}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {patientSearch && patientSearchResults.length === 0 && (
              <p className="mt-2 text-sm text-gray-600">No patients found</p>
            )}
          </div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Order Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Order Type *</label>
                <select
                  name="orderType"
                  value={formData.orderType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="lab">
                    <FaFlask className="inline" /> Laboratory
                  </option>
                  <option value="radiology">
                    <FaXRay className="inline" /> Radiology
                  </option>
                </select>
              </div>

              <div>
                <label className="label">Category *</label>
                <select
                  name="orderCategory"
                  value={formData.orderCategory}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  {getCategoryOptions().map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="label">Test/Procedure *</label>
              <select
                name="testName"
                value={formData.testName}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select test or procedure</option>
                {getTestOptions().map((test) => (
                  <option key={test} value={test}>
                    {test}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT (Immediate)</option>
                </select>
              </div>

              {formData.orderType === "lab" && (
                <div>
                  <label className="label">Specimen Type</label>
                  <select
                    name="specimenType"
                    value={formData.specimenType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select specimen type</option>
                    <option value="blood">Blood</option>
                    <option value="urine">Urine</option>
                    <option value="stool">Stool</option>
                    <option value="csf">CSF (Cerebrospinal Fluid)</option>
                    <option value="sputum">Sputum</option>
                    <option value="swab">Swab</option>
                    <option value="tissue">Tissue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="label">Clinical Notes / Indication</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Enter clinical indication, relevant history, or special instructions..."
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
              disabled={loading || !formData.encounterId}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(NewOrderPage);
