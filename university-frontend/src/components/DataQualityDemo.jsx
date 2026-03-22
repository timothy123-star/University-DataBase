import React, { useState, useEffect } from "react";
import {
  getStudents,
  getStudentEnrollments,
  updateGrade,
} from "../services/api";

const DataQualityDemo = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [newGrade, setNewGrade] = useState("");

  useEffect(() => {
    getStudents().then((res) => setStudents(res.data));
  }, []);

  const loadEnrollments = async (studentId) => {
    setLoading(true);
    try {
      const res = await getStudentEnrollments(studentId);
      setEnrollments(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load enrollments" });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    const student = students.find((s) => s.StudentID == studentId);
    setSelectedStudent(student);
    if (studentId) {
      loadEnrollments(studentId);
    } else {
      setEnrollments([]);
    }
    setSelectedEnrollment(null);
    setNewGrade("");
    setMessage({ type: "", text: "" });
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment || !newGrade) return;
    setLoading(true);
    try {
      await updateGrade(selectedEnrollment.EnrollmentID, newGrade);
      setMessage({
        type: "success",
        text: "Grade updated! GPA will recalculate automatically.",
      });
      // Refresh enrollments to show updated grade and also refetch student to see new GPA
      await loadEnrollments(selectedStudent.StudentID);
      const updatedStudent = await getStudents(); // simpler: refetch student list to get updated GPA
      setSelectedStudent(
        updatedStudent.data.find(
          (s) => s.StudentID === selectedStudent.StudentID,
        ),
      );
      setSelectedEnrollment(null);
      setNewGrade("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Data Quality – Automatic GPA Update
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">The Problem</h2>
        <p className="mb-4">
          In many universities, GPA is calculated manually using spreadsheets or
          periodic scripts. This leads to errors, outdated information, and
          extra workload.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="italic text-gray-600">
            “Data quality issues, such as inconsistent GPA calculations, are a
            major challenge for university administrators.” – (ScienceDirect,
            2024)
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          Our Solution: Database Trigger
        </h2>
        <p className="mb-4">
          We use a <strong>MySQL trigger</strong> that automatically
          recalculates a student's GPA whenever a grade is inserted or updated.
          This ensures the GPA is always accurate and up‑to‑date, without manual
          intervention.
        </p>

        <div className="bg-white border rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium mb-2">Live Demonstration</h3>
          <p className="text-gray-600 mb-4">
            Select a student, then choose an enrollment and enter a new grade.
            The GPA will update instantly after submission.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              onChange={handleStudentChange}
              value={selectedStudent?.StudentID || ""}
              className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select a student --</option>
              {students.map((s) => (
                <option key={s.StudentID} value={s.StudentID}>
                  {s.FirstName} {s.LastName} (GPA: {s.GPA})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="mb-4">
              <p className="text-sm font-medium">
                Current GPA:{" "}
                <span className="text-lg font-bold">{selectedStudent.GPA}</span>
              </p>
            </div>
          )}

          {enrollments.length > 0 && (
            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Enrollment (Course, Term)
                </label>
                <select
                  onChange={(e) =>
                    setSelectedEnrollment(
                      enrollments.find(
                        (en) => en.EnrollmentID == e.target.value,
                      ),
                    )
                  }
                  value={selectedEnrollment?.EnrollmentID || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Choose a course --</option>
                  {enrollments.map((en) => (
                    <option key={en.EnrollmentID} value={en.EnrollmentID}>
                      {en.CourseCode} – {en.CourseName} ({en.TermName}) –
                      Current Grade: {en.Grade || "Not graded"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEnrollment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Grade
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select grade</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>
              )}

              {message.text && (
                <div
                  className={`p-3 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedEnrollment || !newGrade || loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Grade"}
              </button>
            </form>
          )}

          {selectedStudent && enrollments.length === 0 && !loading && (
            <p className="text-gray-500">
              No enrollments found for this student.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">
          How It Works (Under the Hood)
        </h2>
        <p className="mb-2">
          The following trigger is attached to the <code>Enrollment</code>{" "}
          table. It fires after any grade change and recalculates the student's
          GPA by averaging all their grades (converted to points).
        </p>
        <pre className="bg-gray-800 text-white p-3 rounded overflow-auto text-sm">
          {`CREATE TRIGGER update_gpa_after_grade
AFTER UPDATE ON Enrollment
FOR EACH ROW
BEGIN
    IF NEW.Grade IS NOT NULL AND (OLD.Grade IS NULL OR NEW.Grade != OLD.Grade) THEN
        UPDATE Student SET GPA = (
            SELECT AVG(CASE Grade
                WHEN 'A' THEN 5.0
                WHEN 'B' THEN 4.0
                WHEN 'C' THEN 3.0
                WHEN 'D' THEN 2.0
                WHEN 'E' THEN 1.0
                WHEN 'E' THEN 0.0
                ELSE 0.0
            END)
            FROM Enrollment e
            WHERE e.StudentID = NEW.StudentID AND e.Grade IS NOT NULL
        )
        WHERE StudentID = NEW.StudentID;
    END IF;
END;`}
        </pre>
        <p className="mt-4">
          This eliminates manual work and ensures that the GPA always reflects
          the most recent grades – solving the data quality problem highlighted
          in our research.
        </p>
      </section>
    </div>
  );
};

export default DataQualityDemo;
