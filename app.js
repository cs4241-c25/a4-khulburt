const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const session = require("express-session");

app.use(express.static("public"));
app.use(express.json())

const url = "mongodb+srv://khulburt12:chipps12@webwareproject.8cs64.mongodb.net/";
const dbconnect = new MongoClient(url);

async function run(){
    await dbconnect.connect().then(()=> console.log("Connected!"));
}

const appRun = run();
app.listen(3000);