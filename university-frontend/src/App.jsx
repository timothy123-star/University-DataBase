import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import EnhancedEnrollment from "./components/EnhancedEnrollment";
import StudentProfile from "./components/StudentProfile";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import StudentRegistration from "./components/StudentRegistration";
import DataSilosDemo from "./components/DataSilosDemo";
import PerformanceDemo from "./components/PerformanceDemo";
import LackOfAnalyticsDemo from "./components/LackOfAnalyticsDemo";
import DataQualityDemo from "./components/DataQualityDemo";
import Tutorials from "./components/Tutorials";
import SchemaExplorer from "./components/SchemaExplorer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="enroll-enhanced" element={<EnhancedEnrollment />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="tutorials" element={<Tutorials />} />
          <Route path="explorer" element={<SchemaExplorer />} />
          <Route path="register" element={<StudentRegistration />} />
          <Route path="/demo/silos" element={<DataSilosDemo />} />
          <Route path="/demo/performance" element={<PerformanceDemo />} />
          <Route path="/demo/analytics" element={<LackOfAnalyticsDemo />} />
          <Route path="/demo/data-quality" element={<DataQualityDemo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
