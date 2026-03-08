import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
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
// Add more as needed
