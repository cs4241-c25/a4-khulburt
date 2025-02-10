
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
        await client.connect();
        const db = client.db("restaurantLogs"); // Change this to your database name
        collection = db.collection("formInputs"); // Change this to your collection name
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
}
connectDB();

//const appdata = [
    //{ "name": "Via", "foodtype": "Italian", "date": "01/02/2025", "rating": 8, "review": "I loved it!"  },
    //{ "name": "Baba Sushi", "foodtype": "Japanese", "date": "01/03/2025", "rating": 10, "review": "Best Sushi!"  },
    //{ "name": "Chipotle", "foodtype": "Mexican", "date": "01/15/2025", "rating": 10, "review": "Really quick, great food."  }
//]

// let fullURL = ""
const server = http.createServer( function( request,response ) {
    if( request.method === "GET" ) {
        handleGet( request, response )
    }else if( request.method === "POST" && request.url === "/submit" ){
        handlePost( request, response )
    }else if (request.method === "POST" && request.url === "/clear") {
        handleClear(request, response);
    }

    // The following shows the requests being sent to the server
    // fullURL = `http://${request.headers.host}${request.url}`
    // console.log( fullURL );
})

async function handleGet( request, response ) {
    const filename = dir + request.url.slice( 1 )

    if( request.url === "/" ) {
        sendFile( response, "public/index.html" )
    }else if(request.url === "/getData"){
        const allData = await collection.find({}).toArray();
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(allData));
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

    request.on( "end", function() {
        console.log("Received data:", JSON.parse(dataString))

        const newEntry = JSON.parse(dataString);

        collection.insertOne(newEntry);
        console.log("New entry added to MongoDB:", newEntry);

        const allData = collection.find({}).toArray();
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(allData));

    })
}
const handleClear = function(request, response) {
    console.log("Received POST request for /clear");

    // Clear the appdata array
    collection.deleteMany({});
    console.log("MongoDB collection cleared.");

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify([]));
}

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

// process.env.PORT references the port that Glitch uses
// the following line will either use the Glitch port or one that we provided
server.listen( process.env.PORT || port )