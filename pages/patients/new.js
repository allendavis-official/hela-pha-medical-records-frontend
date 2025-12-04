import { useState } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import api from "../../lib/api";
import { FaSave, FaTimes } from "react-icons/fa";

function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "male",
    dateOfBirth: "",
    ageEstimate: "",
    phoneNumber: "",
    address: "",
    city: "",
    county: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nextOfKinRelation: "",
  });

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
      // Prepare data
      const submitData = { ...formData };

      // STEP 1: Remove empty strings and convert to null
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "") {
          submitData[key] = null;
        }
      });

      // STEP 2: Handle date of birth/age estimate logic
      if (submitData.dateOfBirth) {
        // If date of birth is provided, remove age estimate entirely
        delete submitData.ageEstimate;
      } else if (submitData.ageEstimate) {
        // If age estimate is provided, parse it and remove date of birth
        submitData.ageEstimate = parseInt(submitData.ageEstimate);
        delete submitData.dateOfBirth;
      }

      // STEP 3: Validate that at least one is provided
      if (!submitData.dateOfBirth && !submitData.ageEstimate) {
        setError("Please provide either Date of Birth or Age Estimate");
        setLoading(false);
        return;
      }

      // STEP 4: Remove all null values to avoid validation issues
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === null) {
          delete submitData[key];
        }
      });

      const response = await api.createPatient(submitData);

      // Redirect to patient details
      router.push(`/patients/${response.data.id}`);
    } catch (err) {
      setError(err.message || "Failed to create patient");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              New Patient Registration
            </h1>
            <p className="text-gray-600 mt-1">
              Register a new patient in the system
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="label">Sex *</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input"
                  disabled={!!formData.ageEstimate}
                />
              </div>
              <div>
                <label className="label">Age Estimate (if DOB unknown)</label>
                <input
                  type="number"
                  name="ageEstimate"
                  value={formData.ageEstimate}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  max="150"
                  disabled={!!formData.dateOfBirth}
                  placeholder="Years"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Contact Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="+231-777-123-4567"
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">County</label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Next of Kin */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Next of Kin</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  name="nextOfKinName"
                  value={formData.nextOfKinName}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="nextOfKinPhone"
                  value={formData.nextOfKinPhone}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Relationship</label>
                <input
                  type="text"
                  name="nextOfKinRelation"
                  value={formData.nextOfKinRelation}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
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
              disabled={loading}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Saving..." : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(NewPatientPage);
