import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import EnrollForm from "./components/EnrollForm";
import StudentProfile from "./components/StudentProfile";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="enroll" element={<EnrollForm />} />
        </Route>
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
