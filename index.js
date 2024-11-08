const express = require('express')
const cors = require('cors')
const routes = require('./routes/route')
const authRoutes = require('./routes/authRoutes');
const userProductRoutes = require('./routes/userProductRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');

const app = express()

app.use(express.json())
app.use(cors())
app.use('/', routes)
app.use('/api/auth', authRoutes);
app.use('/api/products', userProductRoutes);
app.use('/api/admin/products', adminProductRoutes);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});