-- ============================================
-- University Database Enhanced Schema
-- For CSS 411 Group Assignment
-- ============================================

-- Drop database if exists (careful! only if you want to start fresh)
-- DROP DATABASE IF EXISTS university_db;
-- CREATE DATABASE university_db;
-- USE university_db;

-- 1. Department
CREATE TABLE Department (
    DepartmentID INT PRIMARY KEY AUTO_INCREMENT,
    DepartmentName VARCHAR(100) NOT NULL,
    DepartmentCode VARCHAR(10) UNIQUE NOT NULL
);

-- 2. Program
CREATE TABLE Program (
    ProgramID INT PRIMARY KEY AUTO_INCREMENT,
    ProgramName VARCHAR(100) NOT NULL,
    ProgramCode VARCHAR(10) UNIQUE NOT NULL,
    DepartmentID INT,
    DegreeType ENUM('Bachelor', 'Master', 'Doctoral') NOT NULL,
    RequiredCredits INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- 3. Faculty
CREATE TABLE Faculty (
    FacultyID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    DepartmentID INT NOT NULL,
    FacultyRank ENUM('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer') NOT NULL,
    HireDate DATE NOT NULL,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- 4. Student
CREATE TABLE Student (
    StudentID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    EnrollmentDate DATE NOT NULL,
    MajorID INT,
    AdvisorID INT,
    GPA DECIMAL(3,2) DEFAULT 0.00,
    FOREIGN KEY (MajorID) REFERENCES Program(ProgramID),
    FOREIGN KEY (AdvisorID) REFERENCES Faculty(FacultyID)
);

-- 5. Course
CREATE TABLE Course (
    CourseID INT PRIMARY KEY AUTO_INCREMENT,
    CourseCode VARCHAR(20) UNIQUE NOT NULL,
    CourseName VARCHAR(100) NOT NULL,
    CreditHours INT NOT NULL,
    DepartmentID INT NOT NULL,
    CourseLevel ENUM('Undergraduate', 'Graduate') NOT NULL,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- 6. Semester
CREATE TABLE Semester (
    SemesterID INT PRIMARY KEY AUTO_INCREMENT,
    SemesterName VARCHAR(50) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL
);

-- 7. Room
CREATE TABLE Room (
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    RoomNumber VARCHAR(20) NOT NULL,
    Building VARCHAR(50),
    Capacity INT NOT NULL
);

-- 8. Section
CREATE TABLE Section (
    SectionID INT PRIMARY KEY AUTO_INCREMENT,
    CourseID INT NOT NULL,
    SemesterID INT NOT NULL,
    InstructorID INT NOT NULL,
    SectionNumber VARCHAR(10) NOT NULL,
    Schedule VARCHAR(100),
    RoomID INT,
    Capacity INT NOT NULL,
    EnrolledCount INT DEFAULT 0,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (SemesterID) REFERENCES Semester(SemesterID),
    FOREIGN KEY (InstructorID) REFERENCES Faculty(FacultyID),
    FOREIGN KEY (RoomID) REFERENCES Room(RoomID),
    UNIQUE KEY unique_section (CourseID, SemesterID, SectionNumber)
);

-- 9. Enrollment
CREATE TABLE Enrollment (
    EnrollmentID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT NOT NULL,
    SectionID INT NOT NULL,
    EnrollmentDate DATE NOT NULL,
    Grade CHAR(2),
    EnrollmentStatus ENUM('Enrolled', 'Withdrawn', 'Completed') DEFAULT 'Enrolled',
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (SectionID) REFERENCES Section(SectionID) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (StudentID, SectionID)
);

-- 10. Prerequisite
CREATE TABLE Prerequisite (
    CourseID INT,
    PrerequisiteCourseID INT,
    PRIMARY KEY (CourseID, PrerequisiteCourseID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (PrerequisiteCourseID) REFERENCES Course(CourseID)
);

-- Optional: Indexes for performance
CREATE INDEX idx_student_email ON Student(Email);
CREATE INDEX idx_enrollment_student ON Enrollment(StudentID);
CREATE INDEX idx_enrollment_section ON Enrollment(SectionID);
CREATE INDEX idx_section_semester ON Section(SemesterID);

-- Optional: Trigger for GPA update (simplified example)
DELIMITER //
CREATE TRIGGER update_gpa_after_grade
AFTER UPDATE ON Enrollment
FOR EACH ROW
BEGIN
    IF NEW.Grade IS NOT NULL AND (OLD.Grade IS NULL OR NEW.Grade != OLD.Grade) THEN
        UPDATE Student SET GPA = (
            SELECT AVG(CASE Grade
                WHEN 'A' THEN 4.0
                WHEN 'A-' THEN 3.7
                WHEN 'B+' THEN 3.3
                WHEN 'B' THEN 3.0
                WHEN 'B-' THEN 2.7
                WHEN 'C+' THEN 2.3
                WHEN 'C' THEN 2.0
                WHEN 'D' THEN 1.0
                ELSE 0.0
            END)
            FROM Enrollment e
            WHERE e.StudentID = NEW.StudentID AND e.Grade IS NOT NULL
        )
        WHERE StudentID = NEW.StudentID;
    END IF;
END;//
DELIMITER ;