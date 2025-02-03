
const http = require( "node:http" ),
    fs   = require( "node:fs" ),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you're testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require( "mime" ),
    dir  = "public/",
    port = 3000

const appdata = [
    { "name": "Via", "foodtype": "Italian", "date": "01/02/2025", "rating": 8, "review": "I loved it!"  },
    { "name": "Baba Sushi", "foodtype": "Japanese", "date": "01/03/2025", "rating": 10, "review": "Best Sushi!"  },
    { "name": "Chipotle", "foodtype": "Mexican", "date": "01/15/2025", "rating": 10, "review": "Really quick, great food."  }
]

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

const handleGet = function( request, response ) {
    const filename = dir + request.url.slice( 1 )

    if( request.url === "/" ) {
        sendFile( response, "public/index.html" )
    }else{
        sendFile( response, filename )
    }
}

const handlePost = function( request, response ) {
    console.log("Received POST request for /submit");
    let dataString = ""

    request.on( "data", function( data ) {
        dataString += data
    })

    request.on( "end", function() {
        console.log("Received data:", JSON.parse(dataString))

        const newEntry = JSON.parse(dataString);

        // Add the new entry to the appdata array
        appdata.push(newEntry);

        console.log("New entry added:", newEntry);

        response.writeHead( 200, "OK", {"Content-Type": "text/plain" })
        response.end(JSON.stringify(appdata))
    })
}
const handleClear = function(request, response) {
    console.log("Received POST request for /clear");

    // Clear the appdata array
    appdata.length = 0;
    appdata.push(
        { "name": "Via", "foodtype": "Italian", "date": "01/02/2025", "rating": 8, "review": "I loved it!" },
        { "name": "Baba Sushi", "foodtype": "Japanese", "date": "01/03/2025", "rating": 10, "review": "Best Sushi!" },
        { "name": "Chipotle", "foodtype": "Mexican", "date": "01/15/2025", "rating": 10, "review": "Really quick, great food." }
    );

    // Send back the empty array as the response
    response.writeHead(200, "OK", { "Content-Type": "application/json" });
    response.end(JSON.stringify(appdata));
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