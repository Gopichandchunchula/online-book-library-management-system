-- =====================================================================
-- National Harold Campus Library (LibraManage)
-- Persistent Ledger & Schema Database Export/Backup
-- Compatible with SQLite, PostgreSQL, and MySQL
-- Generated: 2026-05-22
-- Includes complete seeding dataset for Student, Librarian, and Admins
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. BOOK CATALOG TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS books_catalog (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    published_date DATE,
    copies_total INT DEFAULT 5,
    copies_available INT DEFAULT 5,
    location VARCHAR(100),
    description TEXT,
    cover_image VARCHAR(1000),
    rating DECIMAL(3, 2) DEFAULT 5.0
);

-- ---------------------------------------------------------------------
-- 2. USER AUTH & PROFILE TABLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'LIBRARIAN', 'ADMIN')),
    member_id VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50),
    department VARCHAR(255),
    join_date VARCHAR(100),
    avatar_seed VARCHAR(10)
);

-- ---------------------------------------------------------------------
-- 3. CIRCULATION & BORROWINGS LEDGER
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS postings_borrowings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    book_id VARCHAR(50) NOT NULL REFERENCES books_catalog(id),
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'BORROWED' CHECK (status IN ('BORROWED', 'RETURNED', 'OVERDUE', 'PENDING_RETURN')),
    current_fine DECIMAL(10, 2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE
);

-- ---------------------------------------------------------------------
-- 4. RESERVATIONS QUEUES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings_reservations (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    book_id VARCHAR(50) NOT NULL REFERENCES books_catalog(id),
    reserve_date DATE NOT NULL,
    queue_position INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'READY', 'CANCELLED', 'COMPLETED'))
);


-- =====================================================================
-- SEED DATASET DUMP
-- =====================================================================

-- 1. SOWING SEEDS: THE USER DIRECTORY
INSERT INTO users (id, username, email, password_hash, first_name, last_name) VALUES
('user_1', 'gopichand', 'gopichand@nhclindia.com', 'password', 'Gopichand', 'NHCL'),
('user_2', 'student', 'gopichand@nhclindia.com', 'password', 'Gopichand', 'Student'),
('user_3', 'sarah', 's.jenkins@libramanage.com', 'password', 'Sarah', 'Jenkins'),
('user_4', 'librarian', 's.jenkins@libramanage.com', 'password', 'Sarah', 'Librarian'),
('user_5', 'admin', 'a.vance@libramanage.com', 'password', 'Dr. Alistair', 'Vance');

-- 2. SOWING SEEDS: PROFILES
INSERT INTO user_profiles (id, user_id, role, member_id, phone, department, join_date, avatar_seed) VALUES
('prof_1', 'user_1', 'STUDENT', 'LM-2026-8902', '+91 98765 43210', 'Computer Science & Engineering', 'Sept 12, 2024', 'Gc'),
('prof_2', 'user_2', 'STUDENT', 'LM-2026-8903', '+91 98765 43210', 'Computer Science & Engineering', 'Sept 12, 2024', 'Gc'),
('prof_3', 'user_3', 'LIBRARIAN', 'LM-STAFF-023', '+1 (555) 732-8910', 'Cataloging & Preservation', 'Jan 05, 2021', 'Sj'),
('prof_4', 'user_4', 'LIBRARIAN', 'LM-STAFF-024', '+1 (555) 732-8910', 'Cataloging & Preservation', 'Jan 05, 2021', 'Sj'),
('prof_5', 'user_5', 'ADMIN', 'LM-ADMIN-001', '+1 (555) 100-2000', 'Library Operations & IT Director', 'July 15, 2018', 'Av');

-- 3. SOWING SEEDS: COMPREHENSIVE BOOKS INVENTORY
INSERT INTO books_catalog (id, title, author, genre, isbn, published_date, copies_total, copies_available, location, description, cover_image, rating) VALUES
('201', 'Introduction to Algorithms', 'Thomas H. Cormen', 'Technology', '978-0262033848', '2009-07-31', 5, 3, 'Rack A-3, Shelf 2', 'A comprehensive textbook on computer algorithms.', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80', 4.80),
('202', 'Dune', 'Frank Herbert', 'Sci-Fi', '978-0441172719', '1965-06-01', 8, 7, 'Rack D-1, Shelf 4', 'Set in the far future amidst a sprawling feudal interstellar empire.', 'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=400&q=80', 4.90),
('203', 'Clean Code: Handbook of Agile Craft', 'Robert C. Martin', 'Technology', '978-0132350884', '2008-08-11', 10, 8, 'Rack A-3, Shelf 5', 'Uncle Bob presents a revolutionary software craftsmanship paradigm.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80', 4.70),
('204', 'The Critique of Pure Reason', 'Immanuel Kant', 'Philosophy', '978-0521657471', '1781-05-01', 3, 2, 'Rack P-2, Shelf 1', 'transcendental idealism exploring human knowledge limits.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80', 4.50),
('205', 'Brief History of Time', 'Stephen Hawking', 'Science', '978-0553380163', '1988-03-01', 6, 4, 'Rack S-1, Shelf 3', 'cosmological framework explaining black holes.', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80', 4.80),
('208', 'Deep Work: Rules for Focused Success', 'Cal Newport', 'Technology', '978-1455586691', '2016-01-05', 6, 6, 'Rack A-2, Shelf 1', 'Focus without distraction on cognitively demanding tasks.', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80', 4.70);

-- 4. SOWING SEEDS: ACTIVE CIRCULATION BORROW READINGS
INSERT INTO postings_borrowings (id, user_id, book_id, borrow_date, due_date, return_date, status, current_fine, fine_paid) VALUES
('borrow_1', 'user_1', '201', '2026-05-10', '2026-05-24', NULL, 'BORROWED', 0.00, FALSE),
('borrow_2', 'user_1', '203', '2026-05-01', '2026-05-15', NULL, 'OVERDUE', 14.00, FALSE),
('borrow_3', 'user_2', '202', '2026-05-05', '2026-05-19', '2026-05-18', 'RETURNED', 0.00, TRUE);

-- 5. SOWING SEEDS: RESERVATION QUEUE HOLDERS
INSERT INTO bookings_reservations (id, user_id, book_id, reserve_date, queue_position, status) VALUES
('res_1', 'user_1', '205', '2026-05-20', 1, 'PENDING');
