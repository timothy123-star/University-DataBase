
CREATE TABLE School (
    SchoolID INT PRIMARY KEY AUTO_INCREMENT,
    SchoolName VARCHAR(100) NOT NULL,
    SchoolCode VARCHAR(10) UNIQUE NOT NULL
);

-- Departments (with School reference)
CREATE TABLE Department (
    DepartmentID INT PRIMARY KEY AUTO_INCREMENT,
    DepartmentName VARCHAR(100) NOT NULL,
    DepartmentCode VARCHAR(10) UNIQUE NOT NULL,
    SchoolID INT NOT NULL,
    FOREIGN KEY (SchoolID) REFERENCES School(SchoolID)
);

-- Programs (B.Tech, B.Eng, B.Sc, etc.)
CREATE TABLE Program (
    ProgramID INT PRIMARY KEY AUTO_INCREMENT,
    ProgramName VARCHAR(100) NOT NULL,
    ProgramCode VARCHAR(10) UNIQUE NOT NULL,
    DepartmentID INT NOT NULL,
    DegreeType ENUM('Bachelor', 'Master', 'Doctoral') NOT NULL,
    RequiredCredits INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- Faculty (lecturers)
CREATE TABLE Faculty (
    FacultyID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    DepartmentID INT NOT NULL,
    FacultyRank VARCHAR(50) NOT NULL, -- Professor, Senior Lecturer, etc.
    HireDate DATE NOT NULL,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- Student (with MatricNo)
CREATE TABLE Student (
    StudentID INT PRIMARY KEY AUTO_INCREMENT,
    MatricNo VARCHAR(20) UNIQUE NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    EnrollmentDate DATE NOT NULL,
    ProgramID INT NOT NULL,
    AdvisorID INT,
    GPA DECIMAL(3,2) DEFAULT 0.00,
    FOREIGN KEY (ProgramID) REFERENCES Program(ProgramID),
    FOREIGN KEY (AdvisorID) REFERENCES Faculty(FacultyID)
);

-- Course
CREATE TABLE Course (
    CourseID INT PRIMARY KEY AUTO_INCREMENT,
    CourseCode VARCHAR(20) UNIQUE NOT NULL,
    CourseName VARCHAR(100) NOT NULL,
    CreditHours INT NOT NULL,
    DepartmentID INT NOT NULL,
    CourseLevel ENUM('Undergraduate', 'Graduate') NOT NULL,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- Semester (First/Second)
CREATE TABLE Semester (
    SemesterID INT PRIMARY KEY AUTO_INCREMENT,
    SemesterName VARCHAR(50) NOT NULL, -- e.g., 'First Semester 2024'
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL
);

-- Room
CREATE TABLE Room (
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    RoomNumber VARCHAR(20) NOT NULL,
    Building VARCHAR(50),
    Capacity INT NOT NULL
);

-- Section
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

-- Enrollment
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

-- Prerequisite
CREATE TABLE Prerequisite (
    CourseID INT,
    PrerequisiteCourseID INT,
    PRIMARY KEY (CourseID, PrerequisiteCourseID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (PrerequisiteCourseID) REFERENCES Course(CourseID)
);

-- Insert prerequisites (map CourseID from first set to second set)
-- First, get the IDs from the first set (assuming they have CourseID 60001-60009)
INSERT INTO Prerequisite (CourseID, PrerequisiteCourseID) VALUES
-- GST 121 requires GST 110
(90001, 60001),

-- MAT 121 requires MAT 111 and MAT 112
(90002, 60006),
(90002, 60008),

-- PHY 126 requires PHY 113
(90003, 60007),

-- CSS 121 has no obvious prerequisite from first set – skip

-- CHM 191 requires CHM 111
(90005, 60004),

-- PHY 100 requires PHY 113
(90006, 60007),

-- STA 127 requires STA 117 and MAT 111
(90007, 60002),
(90007, 60006),

-- PHY 123 requires PHY 113
(90008, 60007),

-- CPT 121 requires CPT 111 (if needed)
(90009, 60003);

-- Prerequisites
INSERT INTO Prerequisite (CourseID, PrerequisiteCourseID) VALUES
-- CSS211 requires CSS121
(90010, 90004),

-- CSS212 requires CSS121
(90011, 90004),

-- CSS213 requires CSS121
(90012, 90004),

-- CPT211 requires CPT121
(90013, 90009),

-- CSS214 requires CPT211 (programming)
(90014, 90013),

-- MAT212 requires MAT121
(90015, 90002),

-- MAT216 requires MAT121 and STA127
(90016, 90002),
(90016, 90007);

-- GST208 and GST211 have no prerequisites – skip.

INSERT INTO Section (CourseID, SemesterID, InstructorID, SectionNumber, Schedule, RoomID, Capacity, EnrolledCount) VALUES
-- CSS413 (Cloud Computing) – Monday 9-11am, SLR1, Andrew Uduimoh
(120003, 5, 30002, '001', 'Monday 9:00-11:00', 30002, 150, 0),

-- CSS416 (Research Methodology) – Wednesday 11am-1pm, SLR3, S.O. Subairu
(120006, 5, 30009, '001', 'Wednesday 11:00-13:00', 30004, 150, 0),

-- CSS414 (Information Disaster Recovery) – Thursday 9-11am, NLR3, AbdulAzeez Hassan
(120004, 5, 30011, '001', 'Thursday 9:00-11:00', 30007, 150, 0),

-- CSS415 (VoIP & Multimedia Security) – Thursday 2-4pm, SICTLT2, AbdulAzeez Hassan
(120005, 5, 30011, '001', 'Thursday 14:00-16:00', 30001, 150, 0),

-- CSS417 (Security Strategies for Web Apps & Social Networks) – Wednesday 9-11am, SLR4, AbdulAzeez Hassan
(120001, 5, 30011, '001', 'Wednesday 9:00-11:00', 30005, 150, 0),

-- CSS418 (Application Security) – Monday 2-4pm, SLR5, M.D Noel (section 001)
(120007, 5, 30003, '001', 'Monday 14:00-16:00', 30006, 150, 0),

-- CSS418 (Application Security) – Friday 9-11am, SLR1, M.D Noel (section 002)
(120007, 5, 30003, '002', 'Friday 9:00-11:00', 30002, 150, 0);