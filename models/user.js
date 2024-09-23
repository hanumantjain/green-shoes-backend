const UserSchema = (db) =>{
    const query = `
    CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        userName VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(255) NOT NULL,
        phoneNumber INT NOT NULL,
        password VARCHAR(255) NOT NULL
    )
    `
    db.query(query, (err, result)=> {
        if (err) throw err
    })
}