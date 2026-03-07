import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/students")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>University Database</h1>
      <h2>Students</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>GPA</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.StudentID}>
                <td>{student.StudentID}</td>
                <td>{student.FirstName}</td>
                <td>{student.LastName}</td>
                <td>{student.Email}</td>
                <td>{student.GPA}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
