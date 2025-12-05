import { withAuth } from "../lib/auth";
import Layout from "../components/layout/Layout";
import { FaExclamationTriangle, FaTools } from "react-icons/fa";

function DataQualityPage() {
  return (
    <Layout>
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
            <FaExclamationTriangle className="text-5xl text-yellow-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Data Quality Module
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            This module is under development and will be available soon.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <FaTools className="text-2xl text-blue-600 mt-1" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Planned Features:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Data quality issue tracking</li>
                  <li>• Missing data reports</li>
                  <li>• Duplicate record detection</li>
                  <li>• Data completeness metrics</li>
                  <li>• Issue resolution workflow</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(DataQualityPage);
