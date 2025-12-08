import { useRouter } from "next/router";
import Link from "next/link";
import { withAuth } from "../../../lib/auth";
import Layout from "../../../components/layout/Layout";
import useSWR from "swr";
import api from "../../../lib/api";
import {
  FaEdit,
  FaPlus,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaStethoscope,
  FaCalendar,
  FaIdCard,
  FaUserFriends,
  FaMale,
  FaFemale,
} from "react-icons/fa";
import { format } from "date-fns";

function PatientDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR(id ? `/patients/${id}` : null, () =>
    api.getPatientById(id)
  );

  const { data: vitalsData } = useSWR(
    id ? `/clinical-notes/patient/${id}/latest-vitals` : null,
    () => api.getLatestVitals(id)
  );

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load patient details</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient...</p>
        </div>
      </Layout>
    );
  }

  const patient = data.data;
  const latestVitals = vitalsData?.data;

  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : patient.ageEstimate;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Patient Photo */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Patient Photo */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-4 border-white shadow-lg">
              {patient.profileImage ? (
                <img
                  src={patient.profileImage}
                  alt={`${patient.firstName} ${patient.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                  <FaUser className="text-4xl text-white" />
                </div>
              )}
            </div>

            {/* Patient Info */}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </h1>
                {patient.sex === "male" ? (
                  <FaMale className="text-2xl text-blue-500" />
                ) : (
                  <FaFemale className="text-2xl text-pink-500" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center">
                  <FaIdCard className="mr-2" />
                  MRN:{" "}
                  <span className="font-mono font-semibold text-primary-600 ml-1">
                    {patient.mrn}
                  </span>
                </span>
                {age && (
                  <span className="flex items-center">
                    <FaCalendar className="mr-2" />
                    {age} years old
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              href={`/encounters/new?patientId=${patient.id}`}
              className="btn btn-success"
            >
              <FaPlus className="inline mr-2" />
              New Encounter
            </Link>
            <Link
              href={`/patients/${patient.id}/edit`}
              className="btn btn-secondary"
            >
              <FaEdit className="inline mr-2" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demographics */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Demographics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sex</p>
                  <p className="font-medium capitalize">{patient.sex}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium">
                    {age ? `${age} years` : "Unknown"}
                  </p>
                </div>
                {patient.dateOfBirth && (
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {format(new Date(patient.dateOfBirth), "MMMM d, yyyy")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Registered</p>
                  <p className="font-medium">
                    {format(new Date(patient.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaPhone className="mr-2 text-primary-600" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">
                    {patient.phoneNumber || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {patient.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information - UPDATED */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary-600" />
                Location Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-medium">{patient.city || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Town/Village</p>
                  <p className="font-medium">{patient.town || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">District</p>
                  <p className="font-medium">{patient.district || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Province</p>
                  <p className="font-medium">{patient.province || "-"}</p>
                </div>
              </div>
            </div>

            {/* Next of Kin */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FaUserFriends className="mr-2 text-primary-600" />
                Next of Kin
              </h2>
              {patient.nextOfKinName ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{patient.nextOfKinName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">
                        {patient.nextOfKinPhone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Relationship</p>
                      <p className="font-medium capitalize">
                        {patient.nextOfKinRelation || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  No next of kin information provided
                </p>
              )}
            </div>

            {/* Recent Encounters */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaStethoscope className="mr-2 text-primary-600" />
                  Recent Encounters
                </h2>
                <Link
                  href={`/encounters?patientId=${patient.id}`}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  View All
                </Link>
              </div>

              {patient.encounters && patient.encounters.length > 0 ? (
                <div className="space-y-3">
                  {patient.encounters.map((encounter) => (
                    <Link
                      key={encounter.id}
                      href={`/encounters/${encounter.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`badge ${
                                encounter.status === "open"
                                  ? "badge-success"
                                  : "badge-info"
                              }`}
                            >
                              {encounter.status}
                            </span>
                            <span className="badge badge-warning capitalize">
                              {encounter.encounterType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {encounter.department?.name}
                          </p>
                          {encounter.chiefComplaint && (
                            <p className="text-sm text-gray-700 mt-1">
                              {encounter.chiefComplaint}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>
                            {format(
                              new Date(encounter.admissionDate),
                              "MMM d, yyyy"
                            )}
                          </p>
                          {encounter.attendingClinician && (
                            <p className="mt-1">
                              Dr. {encounter.attendingClinician.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>No encounters recorded</p>
                  <Link
                    href={`/encounters/new?patientId=${patient.id}`}
                    className="text-primary-600 hover:text-primary-800 text-sm mt-2 inline-block"
                  >
                    Create first encounter →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Vitals */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Latest Vitals</h2>
              {latestVitals ? (
                <div className="space-y-3">
                  {latestVitals.vitals.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature</span>
                      <span className="font-semibold">
                        {latestVitals.vitals.temperature}°C
                      </span>
                    </div>
                  )}
                  {latestVitals.vitals.bloodPressureSystolic && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Pressure</span>
                      <span className="font-semibold">
                        {latestVitals.vitals.bloodPressureSystolic}/
                        {latestVitals.vitals.bloodPressureDiastolic}
                      </span>
                    </div>
                  )}
                  {latestVitals.vitals.pulse && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pulse</span>
                      <span className="font-semibold">
                        {latestVitals.vitals.pulse} bpm
                      </span>
                    </div>
                  )}
                  {latestVitals.vitals.oxygenSaturation && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SpO2</span>
                      <span className="font-semibold">
                        {latestVitals.vitals.oxygenSaturation}%
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t mt-3">
                    <p className="text-xs text-gray-500">
                      Recorded{" "}
                      {format(new Date(latestVitals.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {latestVitals.clinician.firstName}{" "}
                      {latestVitals.clinician.lastName}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No vitals recorded yet</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/encounters/new?patientId=${patient.id}`}
                  className="block w-full btn btn-primary text-left"
                >
                  New Encounter
                </Link>
                <Link
                  href={`/orders/new?patientId=${patient.id}`}
                  className="block w-full btn btn-secondary text-left"
                >
                  Order Lab Test
                </Link>
                <Link
                  href={`/records?patientId=${patient.id}`}
                  className="block w-full btn btn-secondary text-left"
                >
                  View Records
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(PatientDetailsPage);
