import { withAuth } from "../lib/auth";
import Layout from "../components/layout/Layout";
import useSWR from "swr";
import api from "../lib/api";
import {
  FaUsers,
  FaStethoscope,
  FaFlask,
  FaExclamationCircle,
} from "react-icons/fa";

function DashboardPage() {
  const { data, error } = useSWR("/kpi/dashboard", () => api.getDashboard());

  if (error) return <div>Failed to load dashboard</div>;
  if (!data) return <div>Loading...</div>;

  const stats = data.data;

  const cards = [
    {
      title: "Total Patients",
      value: stats.patients.total,
      change: `+${stats.patients.registeredToday} today`,
      icon: FaUsers,
      color: "bg-blue-500",
    },
    {
      title: "Open Encounters",
      value: stats.encounters.totalOpen,
      change: `${stats.encounters.admissionsToday} admitted today`,
      icon: FaStethoscope,
      color: "bg-green-500",
    },
    {
      title: "Pending Orders",
      value: stats.orders.totalPending,
      change: `${stats.orders.ordersToday} ordered today`,
      icon: FaFlask,
      color: "bg-yellow-500",
    },
    {
      title: "Critical Results",
      value: stats.orders.criticalResults,
      change: "Requires attention",
      icon: FaExclamationCircle,
      color: "bg-red-500",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div key={card.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{card.change}</p>
                </div>
                <div className={`${card.color} p-4 rounded-lg`}>
                  <card.icon className="text-2xl text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Encounter Types</h2>
            <div className="space-y-3">
              {stats.encounters.typeDistribution.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 capitalize">{item.type}</span>
                  <span className="badge badge-info">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Avg Length of Stay</span>
                <span className="font-semibold">
                  {stats.encounters.avgLengthOfStayDays} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Avg Lab Turnaround</span>
                <span className="font-semibold">
                  {stats.orders.avgTurnaroundHours} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Notes Created Today</span>
                <span className="font-semibold">
                  {stats.clinicalNotes.notesToday}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(DashboardPage);
