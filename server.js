require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API endpoint to provide Supabase configuration securely
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_KEY
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Quiz Game Server Running`);
    console.log(`📡 Server URL: http://localhost:${PORT}`);
    console.log(`🔐 Supabase Config: Loaded from .env`);
    console.log(`\n⚠️  IMPORTANT: .env file is in .gitignore and won't be committed to git\n`);
});
