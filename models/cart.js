const CartSchema = async (client) => {
    const query = `
        CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(userid) ON DELETE CASCADE,
        product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
        size INT NOT NULL,
        quantity INT DEFAULT 1 CHECK (quantity > 0),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `
    await client.query(query, (err, result)=> {
        if (err) throw err
    })
}

module.exports = CartSchema