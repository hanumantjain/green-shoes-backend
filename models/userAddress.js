const UserAddressSchema = async (client) =>{
    const query = `
    CREATE TABLE IF NOT EXISTS userAddress (
        addressId SERIAL PRIMARY KEY,
        userId INT NOT NULL,
        userStreet1 VARCHAR(255) NOT NULL,
        userStreet2 VARCHAR(255),
        userCity VARCHAR(100) NOT NULL,
        userState VARCHAR(100) NOT NULL,
        userCountry VARCHAR(100) NOT NULL,
        userZipCode VARCHAR(20) NOT NULL,
        userPhoneNumber VARCHAR(20) NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
    );
    `
    await client.query(query, (err, result)=> {
        if (err) throw err
    })
}

module.exports = UserAddressSchema