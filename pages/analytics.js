import { useState } from "react";
import { withAuth } from "../lib/auth";
import Layout from "../components/layout/Layout";
import useSWR from "swr";
import api from "../lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  FaUsers,
  FaStethoscope,
  FaFlask,
  FaChartLine,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30); // Days

  // Fetch all analytics data
  const { data: dashboardData } = useSWR("/kpi/dashboard", () =>
    api.getDashboard()
  );
  const { data: departmentData } = useSWR("/kpi/departments", () =>
    api.getDepartmentPerformance()
  );
  const { data: trendsData } = useSWR(
    `/kpi/trends/patients?days=${timeRange}`,
    () => api.getPatientTrends(timeRange)
  );
  const { data: qualityData } = useSWR("/kpi/data-quality", () =>
    api.getDataQuality()
  );

  const dashboard = dashboardData?.data;
  const departments = departmentData?.data;
  const trends = trendsData?.data;
  const quality = qualityData?.data;

  // Patient Trends Chart
  const patientTrendsChart = trends
    ? {
        labels: trends.dates || [],
        datasets: [
          {
            label: "New Registrations",
            data: trends.registrations || [],
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
          },
        ],
      }
    : null;

  // Encounter Types Chart
  const encounterTypesChart = dashboard
    ? {
        labels: dashboard.encounters.typeDistribution.map((t) =>
          t.type.toUpperCase()
        ),
        datasets: [
          {
            data: dashboard.encounters.typeDistribution.map((t) => t.count),
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)", // Blue - OPD
              "rgba(234, 179, 8, 0.8)", // Yellow - IPD
              "rgba(239, 68, 68, 0.8)", // Red - Emergency
            ],
            borderColor: [
              "rgb(59, 130, 246)",
              "rgb(234, 179, 8)",
              "rgb(239, 68, 68)",
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  // Department Workload Chart
  const departmentChart = departments
    ? {
        labels: departments.map((d) => d.department),
        datasets: [
          {
            label: "Open Encounters",
            data: departments.map((d) => d.openEncounters),
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
          {
            label: "Total Encounters",
            data: departments.map((d) => d.totalEncounters),
            backgroundColor: "rgba(156, 163, 175, 0.8)",
            borderColor: "rgb(156, 163, 175)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Order Status Chart
  const orderStatusChart = dashboard
    ? {
        labels: ["Pending", "Processing", "Completed"],
        datasets: [
          {
            data: [
              dashboard.orders.totalPending || 0,
              dashboard.orders.processing || 0,
              dashboard.orders.completed || 0,
            ],
            backgroundColor: [
              "rgba(234, 179, 8, 0.8)",
              "rgba(59, 130, 246, 0.8)",
              "rgba(34, 197, 94, 0.8)",
            ],
            borderColor: [
              "rgb(234, 179, 8)",
              "rgb(59, 130, 246)",
              "rgb(34, 197, 94)",
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  if (!dashboard) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FaChartLine className="mr-3 text-primary-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              System performance metrics and insights
            </p>
          </div>
          <div>
            <label className="label">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="input"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Patients</p>
                <p className="text-4xl font-bold">{dashboard.patients.total}</p>
                <p className="text-blue-100 text-xs mt-2">
                  +{dashboard.patients.registeredToday} today
                </p>
              </div>
              <FaUsers className="text-5xl text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Open Encounters</p>
                <p className="text-4xl font-bold">
                  {dashboard.encounters.totalOpen}
                </p>
                <p className="text-green-100 text-xs mt-2">
                  {dashboard.encounters.admissionsToday} admitted today
                </p>
              </div>
              <FaStethoscope className="text-5xl text-green-200 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Pending Orders</p>
                <p className="text-4xl font-bold">
                  {dashboard.orders.totalPending}
                </p>
                <p className="text-yellow-100 text-xs mt-2">
                  {dashboard.orders.ordersToday} ordered today
                </p>
              </div>
              <FaFlask className="text-5xl text-yellow-200 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Critical Results</p>
                <p className="text-4xl font-bold">
                  {dashboard.orders.criticalResults}
                </p>
                <p className="text-red-100 text-xs mt-2">Requires attention</p>
              </div>
              <FaExclamationTriangle className="text-5xl text-red-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Registrations Trend */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-primary-600" />
              Patient Registrations Trend
            </h2>
            <div style={{ height: "300px" }}>
              {patientTrendsChart && (
                <Line data={patientTrendsChart} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Encounter Types Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              Encounter Types Distribution
            </h2>
            <div style={{ height: "300px" }}>
              {encounterTypesChart && (
                <Doughnut
                  data={encounterTypesChart}
                  options={doughnutOptions}
                />
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Workload */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Department Workload</h2>
            <div style={{ height: "300px" }}>
              {departmentChart && (
                <Bar data={departmentChart} options={chartOptions} />
              )}
            </div>
          </div>

          {/* Order Status */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Status Overview</h2>
            <div style={{ height: "300px" }}>
              {orderStatusChart && (
                <Doughnut data={orderStatusChart} options={doughnutOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Encounter Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Length of Stay</span>
                <span className="text-2xl font-bold text-primary-600">
                  {dashboard.encounters.avgLengthOfStayDays} days
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Total Closed</span>
                <span className="text-xl font-semibold">
                  {dashboard.encounters.totalClosed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Admissions Today</span>
                <span className="text-xl font-semibold">
                  {dashboard.encounters.admissionsToday}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Lab Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Turnaround Time</span>
                <span className="text-2xl font-bold text-blue-600">
                  {dashboard.orders.avgTurnaroundHours}h
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Completed Orders</span>
                <span className="text-xl font-semibold">
                  {dashboard.orders.completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Processing</span>
                <span className="text-xl font-semibold">
                  {dashboard.orders.processing || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Clinical Documentation</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Notes Created Today</span>
                <span className="text-2xl font-bold text-green-600">
                  {dashboard.clinicalNotes.notesToday}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Total Notes</span>
                <span className="text-xl font-semibold">
                  {dashboard.clinicalNotes.total || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">With Vitals</span>
                <span className="text-xl font-semibold">
                  {dashboard.clinicalNotes.withVitals || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Section */}
        {quality && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-yellow-600" />
              Data Quality Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {quality.totalIssues || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Issues</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">
                  {quality.openIssues || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Open Issues</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {quality.resolvedIssues || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Resolved</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {quality.completenessScore || 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Data Completeness</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(AnalyticsPage);
