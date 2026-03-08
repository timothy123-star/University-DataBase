import React, { useEffect, useState } from "react";
import { getStudents, getCourses, getSections } from "../services/api";
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline"; // optional icons

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, courses: 0, sections: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getCourses(), getSections()])
      .then(([studentsRes, coursesRes, sectionsRes]) => {
        setStats({
          students: studentsRes.data.length,
          courses: coursesRes.data.length,
          sections: sectionsRes.data.length,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <UsersIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 uppercase">
                Total Students
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.students}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <BookOpenIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 uppercase">
                Courses
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.courses}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AcademicCapIcon className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 uppercase">
                Active Sections
              </p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats.sections}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
