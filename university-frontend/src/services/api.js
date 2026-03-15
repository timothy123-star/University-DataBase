import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // fallback for local dev only
});

export const getStudents = () => API.get("/students");
export const getStudent = (id) => API.get(`/students/${id}`);
export const getCourses = () => API.get("/courses");
export const getSections = () => API.get("/sections");
export const getEnrollments = (studentId) =>
  API.get(`/students/${studentId}/enrollments`);
export const enrollStudent = (studentId, sectionId) =>
  API.post("/enroll", { studentId, sectionId });
export const checkPrerequisites = (studentId, courseId) =>
  API.post("/enroll/check-prerequisites", { studentId, courseId });
export const getStudentProfile = (id) => API.get(`/students/${id}/profile`);
export const getDepartmentGPA = () => API.get("/analytics/department-gpa");
export const getProgramEnrollment = () =>
  API.get("/analytics/program-enrollment");

export const getEligibleSections = (studentId) =>
  API.get(`/students/${studentId}/eligible-sections`);
// Add more as needed

export const getPrograms = () => API.get("/programs");
export const getFaculty = () => API.get("/faculty");
export const registerStudent = (data) => API.post("/students", data);

export default API;
