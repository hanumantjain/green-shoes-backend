const UserSchema = (db) =>{
    const query = `
    CREATE TABLE IF NOT EXISTS user (
        userId SERIAL PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        userName VARCHAR(255) UNIQUE NOT NULL,
        userStreet1 VARCHAR(255) NOT NULL,
        userStreet2 VARCHAR(255),
        userCity VARCHAR(100) NOT NULL,
        userState VARCHAR(100) NOT NULL,
        userZipCode VARCHAR(20) NOT NULL,
        userCountry VARCHAR(100) NOT NULL,
        userPhoneNumber INT NOT NULL,
        userPassword VARCHAR(255) NOT NULL
        createdAt TIMESTAMP DEFAULT NOW() 
    )
    `
    db.query(query, (err, result)=> {
        if (err) throw err
    })
}