const ProductsSchema = async (client) => {
    const query = `
    CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image_urls TEXT[], 
    color VARCHAR(255),
    environmental_message TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
    );
    `
    await client.query(query, (err, result) => {
        if (err) throw err
    })
}

module.exports = ProductsSchema
