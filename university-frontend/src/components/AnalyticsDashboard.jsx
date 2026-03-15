import React, { useState, useEffect } from "react";
import { getDepartmentGPA, getProgramEnrollment } from "../services/api";

const AnalyticsDashboard = () => {
  const [deptData, setDeptData] = useState([]);
  const [progData, setProgData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDepartmentGPA(), getProgramEnrollment()])
      .then(([deptRes, progRes]) => {
        setDeptData(deptRes.data);
        setProgData(progRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="text-center py-10">Loading analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Analytics Dashboard
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Average GPA per Department */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">
            Average GPA by Department
          </h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Department</th>
                <th className="text-left py-2">Avg GPA</th>
                <th className="text-left py-2">Students</th>
              </tr>
            </thead>
            <tbody>
              {deptData.map((dept, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{dept.DepartmentName}</td>
                  <td className="py-2">{parseFloat(dept.AvgGPA).toFixed(2)}</td>
                  <td className="py-2">{dept.StudentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Students per Program */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Enrollment by Program</h3>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Program</th>
                <th className="text-left py-2">Students</th>
              </tr>
            </thead>
            <tbody>
              {progData.map((prog, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{prog.ProgramName}</td>
                  <td className="py-2">{prog.StudentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          Data is live from the database – updated automatically as grades and
          enrollments change.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
