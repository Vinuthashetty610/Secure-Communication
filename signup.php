<?php
require 'db_connect.php'; // include DB connection

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST["username"]);
    $email = trim($_POST["email"]);
    $password = trim($_POST["password"]);

    // Validate input
    if (empty($username) || empty($email) || empty($password)) {
        die("❌ Please fill in all fields.");
    }

    // Hash password before storing
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Prepare SQL statement
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");

    if (!$stmt) {
        die("❌ SQL Error: " . $conn->error); // helpful debug message
    }

    $stmt->bind_param("sss", $username, $email, $hashedPassword);

    if ($stmt->execute()) {
        echo "<script>
                alert('✅ Signup successful! You can now log in.');
                window.location.href = 'login.html';
              </script>";
    } else {
        if (strpos($stmt->error, 'Duplicate') !== false) {
            echo "<script>alert('⚠️ Username or email already exists.'); window.history.back();</script>";
        } else {
            echo "Error: " . $stmt->error;
        }
    }

    $stmt->close();
    $conn->close();
}
?>
