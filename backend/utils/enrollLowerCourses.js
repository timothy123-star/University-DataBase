const db = require("../config/db");

async function enrollLowerCourses(studentId) {
  // 1. Ensure past semester exists (Second Semester 2025, ID = 4)
  await db.query(`
    INSERT IGNORE INTO Semester (SemesterID, SemesterName, StartDate, EndDate)
    VALUES (4, 'Second Semester 2025', '2025-06-01', '2025-10-15')
  `);

  // 2. Get a default instructor and room (any from the department)
  const [[{ FacultyID: instructorId }]] = await db.query(
    "SELECT FacultyID FROM Faculty WHERE DepartmentID = 20 LIMIT 1",
  );
  const [[{ RoomID: roomId }]] = await db.query(
    "SELECT RoomID FROM Room LIMIT 1",
  );

  // 3. Create sections for all lower‑level courses in that semester (if missing)
  await db.query(
    `
    INSERT IGNORE INTO Section (CourseID, SemesterID, InstructorID, SectionNumber, Schedule, RoomID, Capacity, EnrolledCount)
    SELECT CourseID, 4, ?, '001', 'Past Semester', ?, 30, 0
    FROM Course
    WHERE DepartmentID = 20 AND CourseID < 120001
  `,
    [instructorId, roomId],
  );

  // 4. Enroll the student in those sections with grade 'A' and status 'Completed'
  await db.query(
    `
    INSERT IGNORE INTO Enrollment (StudentID, SectionID, EnrollmentDate, Grade, EnrollmentStatus)
    SELECT ?, s.SectionID, '2025-10-01', 'A', 'Completed'
    FROM Section s
    WHERE s.SemesterID = 4
      AND s.CourseID IN (SELECT CourseID FROM Course WHERE DepartmentID = 20 AND CourseID < 120001)
  `,
    [studentId],
  );
}

module.exports = enrollLowerCourses;
