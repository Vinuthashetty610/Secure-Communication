<?php
require 'db_connect.php';
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $username = trim($_POST['username']);
  $password = $_POST['password'];

  if (empty($username) || empty($password)) {
    echo "<script>alert('⚠️ Please fill in all fields!'); window.history.back();</script>";
    exit;
  }

  // Search by username or email
  $stmt = $conn->prepare("SELECT * FROM users WHERE username=? OR email=?");
  if (!$stmt) {
    die("❌ SQL Error: " . $conn->error);
  }

  $stmt->bind_param("ss", $username, $username);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // ✅ Fix: column name is 'password', not 'password_hash'
    if (password_verify($password, $user['password'])) {
      // Start session
      $_SESSION['username'] = $user['username'];

      echo "<script>
              alert('✅ Login successful! Redirecting...');
              window.location.href = 'dashboard.html';
            </script>";
    } else {
      echo "<script>
              alert('❌ Incorrect password!');
              window.location.href = 'login.html';
            </script>";
    }
  } else {
    echo "<script>
            alert('⚠️ User not found!');
            window.location.href = 'login.html';
          </script>";
  }

  $stmt->close();
  $conn->close();
}
?>
