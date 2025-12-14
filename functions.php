<?php
// ===============================
// functions.php
// Common site helper functions
// ===============================

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Check if a user is logged in.
 * @return bool
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Require login — redirect or stop if not logged in.
 */
function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized access']);
        exit;
    }
}

/**
 * Simple JSON response helper.
 */
function jsonResponse($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Example dummy login (you can later connect to your database)
 */
function login($username, $password) {
    // Replace this with database check later
    if ($username === 'admin' && $password === 'password') {
        $_SESSION['user_id'] = 1;
        $_SESSION['username'] = $username;
        return true;
    }
    return false;
}

/**
 * Logout
 */
function logout() {
    session_destroy();
}
