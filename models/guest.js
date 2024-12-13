const GuestSchema = async (client) =>{
    const query = `
    CREATE TABLE IF NOT EXISTS guest_checkout (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(100),
        phone_number VARCHAR(20),
        shipping_street1 VARCHAR(255),
        shipping_street2 VARCHAR(255),
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        shipping_zip VARCHAR(20),
        shipping_country VARCHAR(100),
        billing_street1 VARCHAR(255),
        billing_street2 VARCHAR(255),
        billing_city VARCHAR(100),
        billing_state VARCHAR(100),
        billing_zip VARCHAR(20),
        billing_country VARCHAR(100),
        card_number VARCHAR(20),
        card_name VARCHAR(100),
        expiry VARCHAR(7),
        cvv VARCHAR(60),
        total_amount DECIMAL
    );
    `
    await client.query(query, (err, result)=> {
        if (err) throw err
    })
}

module.exports = GuestSchema