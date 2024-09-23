const mysql = require('mysql')

const AdminSchema = (db) => {
    const query = `
        CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
    db.query(query, (err, result)=> {
        if (err) throw err
    })
}

module.exports = AdminSchema