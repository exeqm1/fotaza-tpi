CREATE DATABASE IF NOT EXISTS fotaza_db;
USE fotaza_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'VALIDATOR', 'ADMIN') DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',
    avatar_path VARCHAR(255),
    bio_description VARCHAR(255),
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    strikes TINYINT DEFAULT 0,
);

CREATE TABLE IF NOT EXISTS posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    description_text VARCHAR(255),
    allow_comments BOOLEAN DEFAULT TRUE,
    post_status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    for_sale BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);