const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());
// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tictactoe'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

// Signup route
app.post('/signup', async (req, res) => {
    const { playerID, name, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("PLAYERID:" + playerID + "\nNAME:" + name + "\nPASSWORD" + password);

    // Prepare SQL query
    const query = `INSERT INTO player (playerID, name, createdDate, lastUpdatedDate, password) 
                   VALUES (?, ?, NOW(), NOW(), ?)`;

    db.query(query, [playerID, name, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Player ID or name already exists');
            }
            return res.status(500).send('Error registering player');
        }
        res.status(201).send('Player registered successfully');
    });
});

// Login route
app.post('/login', (req, res) => {
    const { playerID, password } = req.body;

    const query = 'SELECT * FROM player WHERE playerID = ?';

    db.query(query, [playerID], async (err, results) => {
        if (err) return res.status(500).send('Error logging in');
        if (results.length === 0) return res.status(400).send('Player not found');

        const player = results[0];

        // Compare the password
        const isMatch = await bcrypt.compare(password, player.password);
        if (!isMatch) return res.status(400).send('Invalid password');

        res.status(200).send('Login successful');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
