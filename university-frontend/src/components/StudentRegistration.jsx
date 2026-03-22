import React, { useState, useEffect } from "react";
import { getPrograms, getFaculty, registerStudent } from "../services/api";

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    ProgramID: "",
    advisorId: "",
  });

  const [programs, setPrograms] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]); // all faculty from API
  const [filteredFaculty, setFilteredFaculty] = useState([]); // filtered by program's department
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});

  // Fetch programs and faculty on mount
  useEffect(() => {
    Promise.all([getPrograms(), getFaculty()])
      .then(([programsRes, facultyRes]) => {
        setPrograms(programsRes.data);
        setAllFaculty(facultyRes.data);
        setFilteredFaculty(facultyRes.data); // initially show all (no program selected)
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage({
          type: "error",
          text: "Failed to load data. Please refresh the page.",
        });
        setLoading(false);
      });
  }, []);

  // When program changes, filter advisors to those in the same department
  useEffect(() => {
    if (!formData.ProgramID) {
      setFilteredFaculty(allFaculty);
      // Also clear advisor selection if no program
      setFormData((prev) => ({ ...prev, advisorId: "" }));
      return;
    }

    // Find selected program to get its DepartmentID
    const selectedProgram = programs.find(
      (p) => p.ProgramID === parseInt(formData.ProgramID),
    );
    if (selectedProgram && selectedProgram.DepartmentID) {
      const filtered = allFaculty.filter(
        (f) => f.DepartmentID === selectedProgram.DepartmentID,
      );
      setFilteredFaculty(filtered);
    } else {
      setFilteredFaculty(allFaculty);
    }
    // Reset advisor selection when program changes
    setFormData((prev) => ({ ...prev, advisorId: "" }));
  }, [formData.ProgramID, programs, allFaculty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.enrollmentDate)
      newErrors.enrollmentDate = "Enrollment date is required";
    if (!formData.ProgramID) newErrors.ProgramID = "Please select a major";
    // Advisor is optional, no validation
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await registerStudent({
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        EnrollmentDate: formData.enrollmentDate,
        ProgramID: formData.ProgramID,
        AdvisorID: formData.advisorId || null,
      });

      setMessage({
        type: "success",
        text: `Student registered successfully! ID: ${response.data.StudentID}`,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        enrollmentDate: new Date().toISOString().split("T")[0],
        ProgramID: "",
        advisorId: "",
      });
      // Reset filtered faculty to all (since program cleared)
      setFilteredFaculty(allFaculty);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Student Registration
        </h2>
        <p className="text-gray-600 mb-6">
          Fill in the details to create a new student record.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name & Last Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="student@university.edu"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Enrollment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enrollment Date *
            </label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.enrollmentDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.enrollmentDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.enrollmentDate}
              </p>
            )}
          </div>

          {/* Program (Major) Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Major *
            </label>
            <select
              name="ProgramID"
              value={formData.ProgramID}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.ProgramID ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Select a major --</option>
              {programs.map((prog) => (
                <option key={prog.ProgramID} value={prog.ProgramID}>
                  {prog.ProgramName} ({prog.DepartmentName})
                </option>
              ))}
            </select>
            {errors.ProgramID && (
              <p className="text-red-500 text-xs mt-1">{errors.ProgramID}</p>
            )}
          </div>

          {/* Advisor Dropdown – Filtered by program's department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Advisor (optional)
            </label>
            <select
              name="advisorId"
              value={formData.advisorId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!formData.ProgramID}
            >
              <option value="">-- Select an advisor --</option>
              {filteredFaculty.map((f) => (
                <option key={f.FacultyID} value={f.FacultyID}>
                  {f.FirstName} {f.LastName} ({f.DepartmentName})
                </option>
              ))}
            </select>
            {!formData.ProgramID && (
              <p className="text-gray-500 text-xs mt-1">
                Select a major first to see advisors.
              </p>
            )}
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-3 rounded-md ${
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
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Registering..." : "Register Student"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">* Required fields</p>
      </div>
    </div>
  );
};

export default StudentRegistration;
