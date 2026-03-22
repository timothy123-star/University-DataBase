import React, { useState } from "react";
import StudentProfile from "./StudentProfile";
import { getStudents } from "../services/api";

const DataSilosDemo = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  React.useEffect(() => {
    getStudents().then((res) => setStudents(res.data));
  }, []);

  const handleStudentChange = (e) => {
    setSelectedStudentId(e.target.value);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Data Silos in University Systems
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">The Problem</h2>
        <p className="mb-2">
          In traditional university setups, student information is scattered
          across multiple isolated systems:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>
            <strong>Student Information System (SIS)</strong> – personal
            details, enrollment status.
          </li>
          <li>
            <strong>Learning Management System (LMS)</strong> – courses, grades,
            assignments.
          </li>
          <li>
            <strong>Human Resources (HR)</strong> – faculty advisors.
          </li>
        </ul>
        <p className="mb-4">
          To get a complete picture of a student, staff must manually combine
          data from these silos – a time‑consuming and error‑prone process. As
          noted in our literature review, this fragmentation is a major
          limitation of current university database systems.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="italic text-gray-600">
            “Data silos prevent a unified view of students, leading to
            inefficient operations and poor decision‑making.”
          </p>
          <p className="text-sm text-gray-500">– (ScienceDirect, 2024)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          Our Solution: Integrated Database
        </h2>
        <p className="mb-4">
          Our enhanced data model combines all university data into a single
          relational database. By linking tables with foreign keys and using SQL{" "}
          <code>JOIN</code>s, we can retrieve a student’s complete record –
          personal info, courses, grades, and advisor – with one query.
        </p>
        <div className="bg-white border rounded-lg overflow-hidden shadow">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <strong>Live Demo:</strong> Select a student to see their integrated
            profile.
          </div>
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a student:
            </label>
            <select
              value={selectedStudentId}
              onChange={handleStudentChange}
              className="mb-6 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select a student --</option>
              {students.map((s) => (
                <option key={s.StudentID} value={s.StudentID}>
                  {s.FirstName} {s.LastName} (Matric: {s.MatricNo})
                </option>
              ))}
            </select>

            {selectedStudentId ? (
              <StudentProfile studentId={selectedStudentId} />
            ) : (
              <p className="text-gray-500">
                Please select a student to see the integrated view.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
        <p className="mb-2">
          The student profile page uses a single SQL query that joins five
          tables:
        </p>
        <pre className="bg-gray-800 text-white p-3 rounded overflow-auto text-sm">
          {`SELECT s.FirstName, s.LastName, s.Email, s.GPA,
                  p.ProgramName, CONCAT(f.FirstName, ' ', f.LastName) AS Advisor,
                  c.CourseCode, c.CourseName, e.Grade, t.TermName
          FROM Student s
          LEFT JOIN Program p ON s.MajorID = p.ProgramID
          LEFT JOIN Faculty f ON s.AdvisorID = f.FacultyID
          LEFT JOIN Enrollment e ON s.StudentID = e.StudentID
          LEFT JOIN Section sec ON e.SectionID = sec.SectionID
          LEFT JOIN Course c ON sec.CourseID = c.CourseID
          LEFT JOIN Term t ON sec.TermID = t.TermID
          WHERE s.StudentID = ?`}
        </pre>
        <p className="mt-2">
          This eliminates silos by pulling together data from the{" "}
          <strong>Student</strong>, <strong>Program</strong>,{" "}
          <strong>Faculty</strong>, <strong>Enrollment</strong>,{" "}
          <strong>Section</strong>, <strong>Course</strong>, and{" "}
          <strong>Semester</strong> tables – all in one go.
        </p>
      </section>
    </div>
  );
};

export default DataSilosDemo;
