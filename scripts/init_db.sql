-- Enable UUID extension if we want to use UUIDs (optional, but good practice)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Teachers, Parents, Admins)
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(255) PRIMARY KEY, -- Firebase UID
    email VARCHAR(255),
    role VARCHAR(50), -- 'teacher', 'parent', 'admin'
    phone_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers Extra Details (linked to users)
CREATE TABLE IF NOT EXISTS teachers (
    user_uid VARCHAR(255) PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
    name VARCHAR(255),
    ticket_code VARCHAR(50) UNIQUE,
    school_name VARCHAR(255),
    neet_upload_enabled BOOLEAN DEFAULT FALSE
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    parent_uid VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE, -- Link to parent
    child_id VARCHAR(100), -- Internal ID from Firebase 'children' map (e.g., 'child1')
    name VARCHAR(255),
    grade VARCHAR(50),
    school_name VARCHAR(255),
    legacy_grade VARCHAR(50), -- To store original grade string if needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teacher Assignments (Grades assigned to a teacher)
CREATE TABLE IF NOT EXISTS teacher_grade_assignments (
    id SERIAL PRIMARY KEY,
    teacher_uid VARCHAR(255) REFERENCES teachers(user_uid) ON DELETE CASCADE,
    grade VARCHAR(50),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Specific Teacher-Student Assignments (if students are assigned individually)
CREATE TABLE IF NOT EXISTS teacher_student_assignments (
    id SERIAL PRIMARY KEY,
    teacher_uid VARCHAR(255) REFERENCES teachers(user_uid) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports (Storing complex JSON data for now)
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    report_type VARCHAR(100), -- e.g., 'quiz_result', 'assignment'
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_uid);
CREATE INDEX IF NOT EXISTS idx_reports_student ON reports(student_id);
