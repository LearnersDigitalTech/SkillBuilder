-- Tutor Bookings
CREATE TABLE IF NOT EXISTS tutor_bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(100) UNIQUE, -- Firebase ID or generated UUID
    user_uid VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    tutor_name VARCHAR(255),
    subject VARCHAR(100),
    booking_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NEET Questions (for upload/management)
CREATE TABLE IF NOT EXISTS neet_questions (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(100),
    question_text TEXT,
    options JSONB, -- Array of options
    correct_answer VARCHAR(255),
    explanation TEXT,
    difficulty VARCHAR(50),
    image_url TEXT,
    created_by VARCHAR(255), -- Teacher UID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security Violations
CREATE TABLE IF NOT EXISTS security_violations (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(255) REFERENCES users(uid) ON DELETE SET NULL,
    violation_type VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lottery / Lucky Draw
CREATE TABLE IF NOT EXISTS lottery_entries (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    ticket_number INTEGER,
    contest_name VARCHAR(100) DEFAULT 'annual_day_2025',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_uid, contest_name)
);

CREATE TABLE IF NOT EXISTS lucky_draw_winners (
    id SERIAL PRIMARY KEY,
    user_uid VARCHAR(255),
    ticket_number INTEGER,
    prize VARCHAR(255),
    drawn_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user ON tutor_bookings(user_uid);
CREATE INDEX IF NOT EXISTS idx_neet_subject ON neet_questions(subject);
