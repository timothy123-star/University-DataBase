import React from "react";
import AnalyticsDashboard from "./AnalyticsDashboard";

const LackOfAnalyticsDemo = () => {
  // Mock data for the "old way" (static)
  const mockOldData = [
    {
      department: "Computer Science",
      avgGPA: "3.4",
      students: 45,
      lastUpdated: "March 2025",
    },
    {
      department: "Mathematics",
      avgGPA: "3.1",
      students: 32,
      lastUpdated: "March 2025",
    },
    {
      department: "Physics",
      avgGPA: "3.2",
      students: 28,
      lastUpdated: "March 2025",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lack of Real‑Time Analytics</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">The Problem</h2>
        <p className="mb-4">
          Universities collect massive amounts of data – student records,
          grades, enrollments – but often fail to turn it into actionable
          insights. Reports are typically generated manually, using spreadsheets
          or outdated exports, and are available only after delays.
        </p>
        <p className="mb-4">
          As noted in our literature review, this lack of real‑time analytics
          limits decision‑making and responsiveness (IEEE, 2024).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          The Traditional Way: Manual Reports
        </h2>
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="italic text-gray-600 mb-2">
            “In many universities, administrators compile reports by manually
            querying different systems and merging results in spreadsheets – a
            process that can take days.”
          </p>
          <p className="text-sm text-gray-500">– (ScienceDirect, 2024)</p>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden shadow mb-6">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <strong>Mock Manual Report</strong> – Updated weekly
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Average GPA
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Count
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockOldData.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{row.department}</td>
                  <td className="px-4 py-2">{row.avgGPA}</td>
                  <td className="px-4 py-2">{row.students}</td>
                  <td className="px-4 py-2">{row.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
            Note: This data may be outdated; new student records added after
            March 2025 are not reflected.
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          Our Solution: Real‑Time Analytics Dashboard
        </h2>
        <p className="mb-4">
          With our enhanced database, analytics are computed live using SQL
          aggregation functions (<code>AVG</code>, <code>COUNT</code>,{" "}
          <code>GROUP BY</code>). The dashboard always reflects the current
          state of the database – no manual intervention.
        </p>

        <div className="border rounded-lg shadow p-4">
          <AnalyticsDashboard />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
        <p className="mb-2">The backend runs these queries on demand:</p>
        <pre className="bg-gray-800 text-white p-3 rounded overflow-auto text-sm">
          {`-- Average GPA per department
SELECT d.DepartmentName, AVG(s.GPA) AS AvgGPA, COUNT(s.StudentID) AS StudentCount
FROM Department d
LEFT JOIN Program p ON d.DepartmentID = p.DepartmentID
LEFT JOIN Student s ON p.ProgramID = s.MajorID
GROUP BY d.DepartmentID;

-- Enrollment per program
SELECT p.ProgramName, COUNT(s.StudentID) AS StudentCount
FROM Program p
LEFT JOIN Student s ON p.ProgramID = s.MajorID
GROUP BY p.ProgramID;`}
        </pre>
        <p className="mt-4">
          These aggregations run in milliseconds, providing up‑to‑the‑minute
          insights for decision‑makers.
        </p>
      </section>
    </div>
  );
};

export default LackOfAnalyticsDemo;
