import React, { useState, useEffect } from "react";
import {
  getStudents,
  getEligibleSections,
  enrollStudent,
} from "../services/api";

const EnhancedEnrollment = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch all students on mount
  useEffect(() => {
    getStudents()
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, []);

  // When student selected, fetch eligible sections
  useEffect(() => {
    if (!selectedStudentId) {
      setSections([]);
      setSelectedSections([]);
      return;
    }

    setLoading(true);
    getEligibleSections(selectedStudentId)
      .then((res) => {
        setSections(res.data);
        setSelectedSections([]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load sections" });
        setLoading(false);
      });
  }, [selectedStudentId]);

  // Toggle section selection
  const toggleSection = (sectionId) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  // Enroll in all selected sections
  const handleEnroll = async () => {
    if (selectedSections.length === 0) {
      setMessage({ type: "error", text: "No sections selected" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const results = [];
    for (const sectionId of selectedSections) {
      try {
        const res = await enrollStudent(selectedStudentId, sectionId);
        results.push({ sectionId, success: true, data: res.data });
      } catch (err) {
        results.push({
          sectionId,
          success: false,
          error: err.response?.data?.error || "Enrollment failed",
        });
      }
    }

    // Show summary message
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    if (failed === 0) {
      setMessage({
        type: "success",
        text: `Successfully enrolled in ${succeeded} section(s)`,
      });
    } else {
      setMessage({
        type: "error",
        text: `Enrolled ${succeeded}, failed ${failed}. See console for details.`,
      });
      console.error(
        "Failed enrollments:",
        results.filter((r) => !r.success),
      );
    }

    // Refresh eligible sections
    const refreshed = await getEligibleSections(selectedStudentId);
    setSections(refreshed.data);
    setSelectedSections([]);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Course Enrollment
      </h2>

      {/* Student selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Student
        </label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Choose a student --</option>
          {students.map((s) => (
            <option key={s.StudentID} value={s.StudentID}>
              {s.FirstName} {s.LastName} (ID: {s.StudentID})
            </option>
          ))}
        </select>
      </div>

      {/* Eligible sections table */}
      {selectedStudentId && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">
              Eligible Sections
              {sections.length > 0 && ` (${sections.length} available)`}
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : sections.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No eligible sections found.
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={selectedSections.length === sections.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSections(
                              sections.map((s) => s.SectionID),
                            );
                          } else {
                            setSelectedSections([]);
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Seats
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sections.map((sec) => (
                    <tr key={sec.SectionID} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(sec.SectionID)}
                          onChange={() => toggleSection(sec.SectionID)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {sec.CourseCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sec.CourseName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {sec.SectionNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {sec.InstructorName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {sec.Schedule}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            sec.AvailableSeats > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sec.AvailableSeats} / {sec.Capacity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Enroll button */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleEnroll}
                  disabled={selectedSections.length === 0 || loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enroll in {selectedSections.length} Selected Section(s)
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Message display */}
      {message.text && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default EnhancedEnrollment;
