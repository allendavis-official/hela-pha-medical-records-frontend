import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import useSWR from "swr";
import api from "../../lib/api";
import { FaSave, FaTimes, FaExclamationTriangle } from "react-icons/fa";

function NewResultPage() {
  const router = useRouter();
  const { orderId } = router.query;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    orderId: orderId || "",
    resultType: "quantitative",
    resultData: "",
    resultText: "",
    isAbnormal: false,
    criticalFlag: false,
  });

  // Load order details
  const { data: orderData } = useSWR(
    orderId ? `/orders/${orderId}` : null,
    () => api.getOrderById(orderId)
  );

  const order = orderData?.data;

  useEffect(() => {
    if (orderId && !formData.orderId) {
      setFormData((prev) => ({ ...prev, orderId }));
    }
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        orderId: formData.orderId,
        resultType: formData.resultType,
        isAbnormal: formData.isAbnormal,
        criticalFlag: formData.criticalFlag,
      };

      // Handle different result types
      if (
        formData.resultType === "quantitative" ||
        formData.resultType === "qualitative"
      ) {
        if (formData.resultData) {
          try {
            // Try to parse as JSON for structured data
            submitData.resultData = JSON.parse(formData.resultData);
          } catch {
            // If not valid JSON, treat as simple key-value
            setError("Result data must be valid JSON format");
            setLoading(false);
            return;
          }
        }
      }

      if (formData.resultText) {
        submitData.resultText = formData.resultText;
      }

      // Validate that at least one result field is provided
      if (!submitData.resultData && !submitData.resultText) {
        setError("Please provide either result data or result text");
        setLoading(false);
        return;
      }

      const response = await api.createResult(submitData);

      // Redirect to order details
      router.push(`/orders/${formData.orderId}`);
    } catch (err) {
      setError(err.message || "Failed to create result");
      setLoading(false);
    }
  };

  // Example JSON templates for different test types
  const getExampleJSON = () => {
    if (
      order?.testName.includes("CBC") ||
      order?.testName.includes("Blood Count")
    ) {
      return JSON.stringify(
        {
          WBC: { value: 7.5, unit: "10^3/μL", normal: "4.5-11.0" },
          RBC: { value: 4.8, unit: "10^6/μL", normal: "4.5-5.5" },
          Hemoglobin: { value: 14.2, unit: "g/dL", normal: "13.5-17.5" },
          Hematocrit: { value: 42, unit: "%", normal: "38.3-48.6" },
          Platelets: { value: 250, unit: "10^3/μL", normal: "150-400" },
        },
        null,
        2
      );
    } else if (order?.orderType === "lab") {
      return JSON.stringify(
        {
          parameter1: { value: 0, unit: "", normal: "" },
          parameter2: { value: 0, unit: "", normal: "" },
        },
        null,
        2
      );
    } else {
      return JSON.stringify(
        {
          findings: "Enter findings here",
        },
        null,
        2
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enter Results</h1>
            {order && (
              <p className="text-gray-600 mt-1">For: {order.testName}</p>
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

        {/* Order Info */}
        {order && (
          <div className="card bg-primary-50 border-primary-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Patient</p>
                <p className="font-semibold">
                  {order.encounter.patient.firstName}{" "}
                  {order.encounter.patient.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {order.encounter.patient.mrn}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Test</p>
                <p className="font-semibold">{order.testName}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Type</p>
                <p className="font-semibold uppercase">{order.orderType}</p>
              </div>
              <div>
                <p className="text-gray-600">Priority</p>
                <p className="font-semibold uppercase">{order.priority}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Result Type */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Result Information</h2>

            <div>
              <label className="label">Result Type *</label>
              <select
                name="resultType"
                value={formData.resultType}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="quantitative">
                  Quantitative (Numerical values)
                </option>
                <option value="qualitative">
                  Qualitative (Positive/Negative)
                </option>
                <option value="narrative">
                  Narrative (Descriptive report)
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.resultType === "quantitative" &&
                  "For numerical lab values (e.g., CBC, Chemistry)"}
                {formData.resultType === "qualitative" &&
                  "For positive/negative results (e.g., Pregnancy test, Culture)"}
                {formData.resultType === "narrative" &&
                  "For descriptive reports (e.g., Radiology, Pathology)"}
              </p>
            </div>

            {/* Structured Data (for quantitative/qualitative) */}
            {(formData.resultType === "quantitative" ||
              formData.resultType === "qualitative") && (
              <div className="mt-4">
                <label className="label">Result Data (JSON format)</label>
                <textarea
                  name="resultData"
                  value={formData.resultData}
                  onChange={handleChange}
                  className="input font-mono text-sm"
                  rows="12"
                  placeholder={getExampleJSON()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter results as JSON. Include value, unit, and normal range
                  for each parameter.
                </p>
              </div>
            )}

            {/* Narrative Text (always available as option) */}
            <div className="mt-4">
              <label className="label">
                {formData.resultType === "narrative"
                  ? "Report Text *"
                  : "Additional Comments / Interpretation"}
              </label>
              <textarea
                name="resultText"
                value={formData.resultText}
                onChange={handleChange}
                className="input"
                rows="8"
                placeholder={
                  formData.resultType === "narrative"
                    ? "Enter detailed findings, impression, and recommendations..."
                    : "Enter any additional comments, interpretation, or notes..."
                }
                required={formData.resultType === "narrative"}
              />
            </div>
          </div>

          {/* Flags */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Result Flags</h2>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAbnormal"
                  checked={formData.isAbnormal}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-medium">Mark as Abnormal</span>
                  <p className="text-sm text-gray-600">
                    Check if result is outside normal range
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="criticalFlag"
                  checked={formData.criticalFlag}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <div>
                  <span className="font-medium text-red-600 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Mark as Critical
                  </span>
                  <p className="text-sm text-gray-600">
                    Check if result requires immediate attention
                  </p>
                </div>
              </label>
            </div>

            {formData.criticalFlag && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Critical Result Alert
                </p>
                <p className="text-red-700 text-sm mt-2">
                  This result will be flagged for immediate clinician review.
                  Ensure all values are correct.
                </p>
              </div>
            )}
          </div>

          {/* Example/Help */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              JSON Format Example:
            </h3>
            <pre className="text-xs bg-white rounded p-3 overflow-x-auto">
              {`{
  "Parameter Name": {
    "value": 7.5,
    "unit": "g/dL",
    "normal": "13.5-17.5"
  },
  "Another Parameter": {
    "value": 4.2,
    "unit": "mmol/L",
    "normal": "3.5-5.0"
  }
}`}
            </pre>
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
              disabled={loading || !formData.orderId}
            >
              <FaSave className="inline mr-2" />
              {loading ? "Saving..." : "Save Results"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(NewResultPage);
