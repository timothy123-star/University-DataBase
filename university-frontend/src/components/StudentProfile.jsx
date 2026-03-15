import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // if using react-router
import { getStudentProfile } from "../services/api"; // we'll add this function

const StudentProfile = () => {
  const { id } = useParams(); // gets student ID from URL, e.g., /students/1
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getStudentProfile(id)
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to load profile");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!profile) return null;

  const { student, enrollments } = profile;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Student Profile
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">
              {student.FirstName} {student.LastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{student.Email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GPA</p>
            <p className="font-medium">{student.GPA}</p>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Enrollments
        </h3>
        {enrollments.length === 0 ? (
          <p className="text-gray-500">No enrollments found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Section
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  SEMESTER
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Instructor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enrollments.map((e) => (
                <tr key={e.EnrollmentID}>
                  <td className="px-4 py-2">
                    {e.CourseCode}: {e.CourseName}
                  </td>
                  <td className="px-4 py-2">{e.SectionNumber}</td>
                  <td className="px-4 py-2">{e.TermName}</td>
                  <td className="px-4 py-2">{e.InstructorName}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        e.Grade
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {e.Grade || "In Progress"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
