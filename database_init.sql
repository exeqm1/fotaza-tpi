SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Notifications, User_Follows, Collections_Post, Collections, Post_Tags, Tags, Reports, Purchases, Ratings, Comments, Image, Posts, Users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'VALIDATOR', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    avatar_path VARCHAR(255),
    cover_path VARCHAR(255),
    bio_description VARCHAR(100),
    wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    strikes INT NOT NULL DEFAULT 0
);

CREATE TABLE Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    description_text VARCHAR(255),
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    post_status ENUM('ACTIVE', 'INACTIVE') NOT NULL,
    for_sale BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    price DECIMAL(10, 2),
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Image (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    license_type ENUM('COPYRIGHT', 'PUBLIC_DOMAIN') NOT NULL,
    average_rating FLOAT DEFAULT 0,
    watermark_text VARCHAR(50),
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

CREATE TABLE Ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    value INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

CREATE TABLE Purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

CREATE TABLE Reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment_id INT,
    post_id INT,
    reason VARCHAR(100) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    content_type ENUM('POST', 'COMMENT') NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

CREATE TABLE Tags (
    tag_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Post_Tags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE Collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    public BOOLEAN NOT NULL DEFAULT TRUE,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Collections_Post (
    collection_id INT NOT NULL,
    post_id INT NOT NULL,
    PRIMARY KEY (collection_id, post_id),
    FOREIGN KEY (collection_id) REFERENCES Collections(collection_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

CREATE TABLE User_Follows (
    follows_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_target_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user_target_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('COMMENT', 'RATE', 'LIKE', 'FOLLOW', 'PURCHASE') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

INSERT INTO Users (username, email, password, role, status, wallet_balance, strikes) VALUES 
('admin', 'admin@fotaza.com', '$2b$10$x7yo8TddTd5zm9N4.L2.MOuq9rySdkbIehIZp.w8FSsP2TM3dVAGi', 'ADMIN', 'ACTIVE', 0.00, 0),
('fotografo', 'fotografo@fotaza.com', '$2b$10$x7yo8TddTd5zm9N4.L2.MOuq9rySdkbIehIZp.w8FSsP2TM3dVAGi', 'USER', 'ACTIVE', 5000.00, 0);

INSERT INTO Posts (user_id, title, description_text, post_status, for_sale, price) VALUES 
(2, 'Atardecer en la montaña', 'Captura del atardecer con colores cálidos.', 'ACTIVE', FALSE, 0.00),
(2, 'Ciudad Nocturna', 'Las luces de la ciudad desde las alturas.', 'ACTIVE', TRUE, 2500.50);

INSERT INTO Image (post_id, title, file_path, license_type) VALUES 
(1, 'Atardecer en la montaña', 'https://picsum.photos/id/1015/600/600', 'COPYRIGHT'),
(2, 'Ciudad Nocturna', 'https://picsum.photos/id/1016/600/600', 'COPYRIGHT');