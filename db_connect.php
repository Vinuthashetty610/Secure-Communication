<?php
$servername = "localhost";
$username = "root";
$password = ""; // leave empty for XAMPP default
$dbname = "secure_image";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
