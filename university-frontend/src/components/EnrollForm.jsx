import React, { useState, useEffect } from "react";
import {
  getStudents,
  getSections,
  enrollStudent,
  checkPrerequisites,
} from "../services/api";

const EnrollForm = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [prereqStatus, setPrereqStatus] = useState(null);

  useEffect(() => {
    Promise.all([getStudents(), getSections()])
      .then(([studentsRes, sectionsRes]) => {
        setStudents(studentsRes.data);
        setSections(sectionsRes.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // When both student and section are selected, check prerequisites
  useEffect(() => {
    const check = async () => {
      if (!selectedStudent || !selectedSection) return;
      const section = sections.find(
        (s) => s.SectionID === parseInt(selectedSection),
      );
      if (!section) return;
      try {
        const res = await checkPrerequisites(selectedStudent, section.CourseID);
        setPrereqStatus(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    check();
  }, [selectedStudent, selectedSection, sections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSection) {
      setMessage({
        type: "error",
        text: "Please select both a student and a section.",
      });
      return;
    }
    if (prereqStatus && !prereqStatus.eligible) {
      setMessage({ type: "error", text: "Prerequisites not satisfied." });
      return;
    }

    setLoading(true);
    try {
      const res = await enrollStudent(selectedStudent, selectedSection);
      setMessage({
        type: "success",
        text: `Enrollment successful! ID: ${res.data.enrollmentId}`,
      });
      // Reset form
      setSelectedStudent("");
      setSelectedSection("");
      setPrereqStatus(null);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Enrollment failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Enroll Student in Section
      </h2>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          {/* Student Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.StudentID} value={s.StudentID}>
                  {s.FirstName} {s.LastName} (GPA: {s.GPA})
                </option>
              ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a section</option>
              {sections.map((s) => (
                <option key={s.SectionID} value={s.SectionID}>
                  {s.CourseCode} - {s.CourseName} ({s.TermName}) -{" "}
                  {s.InstructorName} (Seats: {s.EnrolledCount}/{s.Capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Prerequisite Status */}
          {prereqStatus && !prereqStatus.eligible && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{prereqStatus.message}</p>
              {prereqStatus.missing && prereqStatus.missing.length > 0 && (
                <ul className="list-disc list-inside text-sm text-red-500 mt-1">
                  {prereqStatus.missing.map((c) => (
                    <li key={c.CourseID}>
                      {c.CourseCode}: {c.CourseName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Enroll"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnrollForm;
