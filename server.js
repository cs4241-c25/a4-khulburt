require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { MongoClient } = require('mongodb');
const mime = require('mime');
const fs = require('fs');
const http = require('http');
const dotenv = require('dotenv').config();

const app = express();
const port = 3000;

// Database setup
const url = 'mongodb+srv://khulburt12:chipps12@webwareproject.8cs64.mongodb.net/';
const dbconnect = new MongoClient(url);

let collection;

async function connectDB() {
    try {
        await dbconnect.connect();
        const db = dbconnect.db('restaurantLogs');
        collection = db.collection('formInputs');
        console.log('Connected to MongoDB!');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
    }
}
connectDB();

const {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    EXPRESS_SESSION_SECRET
} = process.env;

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.static('public'));

// Passport GitHub Strategy setup
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/github/callback',
        },
        function (accessToken, refreshToken, profile, done) {
            return done(null, profile);
        }
    )
);

// Serialize user (store user info in session)
passport.serializeUser(function (user, done) {
    done(null, user);
});

// Deserialize user (retrieve user info from session)
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// Authentication routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get(
    '/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    function (req, res) {
        res.redirect('/');
    }
);

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { console.error(err); }
        res.redirect('/');
    });
});

app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Data routes
app.post('/submit', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const newEntry = { ...req.body, username: req.user.username };
        await collection.insertOne(newEntry);
        const allData = await collection.find({ username: req.user.username }).toArray();
        res.status(200).json(allData);
    } catch (error) {
        console.error('Submit Error:', error);
        res.status(500).json({ error: 'Failed to submit data' });
    }
});

app.post('/clear', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const result = await collection.deleteMany({ username: req.user.username });
        res.status(200).json([]);
    } catch (error) {
        console.error('Clear Error:', error);
        res.status(500).json({ error: 'Failed to clear data' });
    }
});

app.get('/getData', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const data = await collection.find({ username: req.user.username }).toArray();
        res.status(200).json(data);
    } catch (error) {
        console.error('GetData Error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Serve index.html on root (if using React)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// HTTP server
const server = http.createServer(app);
server.listen(process.env.PORT || port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
