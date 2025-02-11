
const http = require( "node:http" ),
    fs   = require( "node:fs" ),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require( "mime" ),
    { MongoClient } = require("mongodb"),
    dir  = "public/",
    port = 3000

const express = require('express');
const app = express();
const session = require("express-session");

app.use(express.static("public"));
app.use(express.json())

const url = "mongodb+srv://khulburt12:chipps12@webwareproject.8cs64.mongodb.net/";
const dbconnect = new MongoClient(url);

async function connectDB() {
    try {
        await dbconnect.connect();
        const db = dbconnect.db("restaurantLogs");
        collection = db.collection("formInputs");
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}
connectDB();


// let fullURL = ""
const server = http.createServer( function( request,response ) {
    if( request.method === "GET" ) {
        handleGet( request, response )
    }else if( request.method === "POST" && request.url === "/submit" ){
        handlePost( request, response )
    }else if (request.method === "POST" && request.url === "/clear") {
        handleClear(request, response);
    }

})

async function handleGet( request, response ) {
    const filename = dir + request.url.slice( 1 )

    if( request.url === "/" ) {
        sendFile( response, "public/loginPage.html" )
    }else if(request.url === "/getData"){
        const urlParams = new URLSearchParams(request.url.slice(8)); // Extract query parameters
        const username = urlParams.get("username");

        if (!username) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Username is required" }));
            return;
        }

        const userData = await collection.find({ username }).toArray();
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(userData));
    }else{
        sendFile(response, dir + request.url.slice(1));
    }
}

async function handlePost( request, response ) {
    console.log("Received POST request for /submit");
    let dataString = ""

    request.on( "data", function( data ) {
        dataString += data
    })

    request.on( "end", async function() {
        console.log("Received data:", JSON.parse(dataString))

        const newEntry = JSON.parse(dataString);

        await collection.insertOne(newEntry);
        console.log("New entry added to MongoDB:", newEntry);

        const allData = await collection.find({username: newEntry.username}).toArray();
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(allData));

    })
}

const handleClear = async function(request, response) {
    console.log("Received POST request for /clear");

    let dataString = "";
    request.on("data", function(data) {
        dataString += data;
    });

    request.on("end", async function() {
        const { username } = JSON.parse(dataString);  // Get username from the request body

        if (!username) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Username not provided" }));
            return;
        }

        try {
            // Delete all entries for the specific user
            const result = await collection.deleteMany({ username: username });

            console.log(`Deleted ${result.deletedCount} entries for user: ${username}`);

            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify([]));  // Return empty data after clearing
        } catch (error) {
            console.error("Error deleting data:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Failed to delete data" }));
        }
    });
};

const sendFile = function( response, filename ) {
    const type = mime.getType( filename )

    fs.readFile( filename, function( err, content ) {

        // if the error = null, then we've loaded the file successfully
        if( err === null ) {

            // status code: https://httpstatuses.com
            response.writeHeader( 200, { "Content-Type": type })
            response.end( content )

        } else {

            // file not found, error code 404
            response.writeHeader( 404 )
            response.end( "404 Error: File Not Found" )

        }
    })
}

server.listen( process.env.PORT || port )