const express = require('express')
const connectDB = require('./config/db')

const app = express();

connectDB();

app.use(express.json({extended: false}));

// Define route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profiles', require('./routes/api/profiles'));

app.get('/', (req, res) => res.send('API Running!'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server server started on port ${PORT}`));