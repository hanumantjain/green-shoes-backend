const { Client } = require('pg'); 
const client = new Client({
  user: 'shivam',
  host: 'localhost',
  database: 'prak',
  password: 'greenshoes',
  port: 5432,
});

client.connect().then(() => console.log("Database is running")).catch(err => console.error("Database is not running", err)).finally(() => client.end());