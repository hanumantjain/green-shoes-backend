const UserAddressSchema = async (client) =>{
    const query = `
    CREATE TABLE IF NOT EXISTS userAddress (
<<<<<<< HEAD
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
    ALTER TABLE userAddress
    DROP COLUMN if exists userStreet1,
    DROP COLUMN if exists userStreet2,
    DROP COLUMN if exists userCity,
    DROP COLUMN if exists userState,
    DROP COLUMN if exists userCountry,
    DROP COLUMN if exists userZipCode,
    DROP COLUMN if exists userPhoneNumber,
    DROP COLUMN if exists street,
    ADD COLUMN if not exists address_type VARCHAR(20) NOT NULL,
    ADD COLUMN if not exists street1 VARCHAR(255) NOT NULL,
    ADD COLUMN if not exists street2 VARCHAR(255) NOT NULL,
    ADD COLUMN if not exists city VARCHAR(100) NOT NULL,
    ADD COLUMN if not exists state VARCHAR(100) NOT NULL,
    ADD COLUMN if not exists zip VARCHAR(20) NOT NULL,
    ADD COLUMN if not exists country VARCHAR(100) NOT NULL;
=======
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        address_type VARCHAR(50) NOT NULL,
        street1 VARCHAR(255) NOT NULL,
        street2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        zip VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
);
>>>>>>> c135671d989545f1f2535e06d606cfd53d49e463
    `


    await client.query(query, (err, result)=> {
        if (err) throw err
    })
}

module.exports = UserAddressSchema