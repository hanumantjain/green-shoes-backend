const ProductsSchema = async (client) =>{
    const query = `
    CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL
    );
    `
    const query1=`
    CREATE TYPE fix_type AS ENUM ('active', 'inactive');
    `

    const query2=`
    ALTER TABLE products
    ADD COLUMN status fix_type DEFAULT 'active',
    ADD COLUMN color VARCHAR(50);
    `
    const query3=`
    ALTER TABLE products
    ADD COLUMN category_id INT,
    ADD CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES Categories(category_id)
    ON DELETE SET NULL;
    `

    await client.query(query, (err, result)=> {
        if (err) throw err
    })

    // await client.query(query1, (err, result)=> {
    //     if (err) throw err
    // })
    // await client.query(query3, (err, result)=> {
    //     if (err) throw err
    // })

}

module.exports = ProductsSchema