import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import StudentList from "./components/StudentList";
import EnrollForm from "./components/EnrollForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="enroll" element={<EnrollForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
