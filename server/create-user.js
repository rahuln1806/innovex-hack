require("dotenv").config();
const pool = require("./utils/db");

async function createUser() {
  const username = process.argv[2] || "testuser";
  const password = process.argv[3] || "password123";

  try {
    console.log(`Creating user: ${username}`);

    // Insert user into database (plain text password)
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password = $2 RETURNING id, username",
      [username, password]
    );

    console.log("✅ User created/updated successfully!");
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Password: ${password} (plain text)`);
    console.log("\nYou can now login with:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    if (error.code === "42P01") {
      console.error("\n⚠️  The 'users' table doesn't exist!");
      console.error("   Please run the SQL script: setup-database.sql");
    } else if (error.code === "28P01" || error.code === "3D000") {
      console.error("\n⚠️  Database connection error!");
      console.error("   Please check your database credentials in .env file");
    }
    process.exit(1);
  }
}

createUser();
