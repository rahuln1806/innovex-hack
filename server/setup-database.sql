-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Example: Insert a test user (password is 'password123' hashed with bcrypt)
-- You can generate your own bcrypt hash using Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('yourpassword', 10);
-- console.log(hash);

-- Example test user (replace with your own bcrypt hash):
-- INSERT INTO users (username, password) 
-- VALUES ('testuser', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq')
-- ON CONFLICT (username) DO NOTHING;
