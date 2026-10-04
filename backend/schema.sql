-- Run: createdb campuscycle, then psql -d campuscycle -f schema.sql -f seed.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS requests, enquiries, listings, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE CHECK (email LIKE '%@rajagiri.edu.in'),
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  department VARCHAR(50),
  role VARCHAR(10) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT','ADMIN')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Free giveaway: there is intentionally NO price column
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('Books','Electronics','Lab Equipment','Stationery','Academic Materials','Others')),
  condition VARCHAR(20) NOT NULL CHECK (condition IN ('LIKE_NEW','GOOD','FAIR')),
  image_url TEXT,
  location VARCHAR(100) NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','RESERVED','COMPLETED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','REJECTED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (requester_id <> owner_id)
);
-- One active (non-rejected) request per student per item
CREATE UNIQUE INDEX one_active_request ON requests (listing_id, requester_id) WHERE status <> 'REJECTED';
