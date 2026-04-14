-- Seats
CREATE TABLE seats (
     id SERIAL PRIMARY KEY,
     seat_name VARCHAR(10),
     bookedby VARCHAR(255),
     isbooked INT DEFAULT 0
);

INSERT INTO seats (seat_name, isbooked)
SELECT 
  chr(64 + row_num) || col_num AS seat_name,
  0
FROM generate_series(1, 5) AS row_num,
     generate_series(1, 10) AS col_num;

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);