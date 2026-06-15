<?php
// Database connection settings (XAMPP defaults)
$servername = "localhost";
$username = "root";
$password = ""; // Leave empty for XAMPP default
$dbname = "secure_image";

// Connect to MySQL server (no DB selected yet)
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// 1️⃣ Create the database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) === TRUE) {
    echo "✅ Database '$dbname' ready.<br>";
} else {
    die("❌ Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db($dbname);

// 2️⃣ Create the users table if it doesn't exist
$tableSql = "
CREATE TABLE IF NOT EXISTS users (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($tableSql) === TRUE) {
    echo "✅ Table 'users' is ready.<br>";
} else {
    die("❌ Error creating table: " . $conn->error);
}

// 3️⃣ Optional — Check if admin user exists
$checkAdmin = $conn->query("SELECT * FROM users WHERE username='admin'");
if ($checkAdmin->num_rows === 0) {
    $hashed = password_hash("secure123", PASSWORD_BCRYPT);
    $conn->query("INSERT INTO users (username, email, password) VALUES ('admin', 'admin@example.com', '$hashed')");
    echo "✅ Default admin account created (username: admin / password: secure123)<br>";
} else {
    echo "ℹ️ Admin user already exists.<br>";
}

echo "<br>🎉 Setup complete! You can now use signup and login pages.";

$conn->close();
?>
