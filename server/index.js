require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const novelRoutes = require('./routes/novel');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/novel', novelRoutes);

const PORT = process.env.PORT || 7385;
app.listen(PORT, () => console.log(Server running on port ${PORT}));

