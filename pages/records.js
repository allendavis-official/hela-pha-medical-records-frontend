import { withAuth } from "../lib/auth";
import Layout from "../components/layout/Layout";
import { FaFolder, FaTools } from "react-icons/fa";

function RecordsPage() {
  return (
    <Layout>
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full mb-6">
            <FaFolder className="text-5xl text-indigo-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Medical Records Module
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            This module is under development and will be available soon.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Planned Features:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Document upload and storage</li>
              <li>• Medical record scanning</li>
              <li>• File categorization</li>
              <li>• Search and retrieval</li>
              <li>• Access audit trail</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(RecordsPage);
