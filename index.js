var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");


var app = express();
app.use(bodyParser.json());
var port = (process.env.PORT || 1607);


var BASE_API_PATH = "/api/v1";

var MongoClient = require("mongodb").MongoClient;


/////////VARIABLES API:
var motogpchampsApi = require("./motogpchampsApi");
var fonedriversApi = require("./fonedriversApi");
var gpistatsApi = require("./gpistatsApi");

/////////BASES DE DATOS:
var mdbMotoGPChamps = "mongodb://valentino:rossi@ds129939.mlab.com:29939/sos1718-13-motogpchamps";
var mdbFOneDrivers = "mongodb://alfgutrom:alfgutrom1.@ds231559.mlab.com:31559/sos1718-agr-sandbox";
var mdbGpiStats = "mongodb://pasreqlam:gpi-stats@ds249025.mlab.com:49025/sos1718-13-gpistats";

app.use("/", express.static(path.join(__dirname + "/public")));
app.get("/hello", (req, res) => {
    res.send("Hello World");
});

//////////////////////////////////////PRL (GPI-STATS)///////////////////////////////////////
app.get(BASE_API_PATH + "/gpi-stats/help", (req, res) => {
    res.redirect("https://documenter.getpostman.com/view/395479/sos1718-gpi-stats/RVnZhdpa");
});

var initialGpiStats = [
    {"country": "iceland","year": 2013,"score": 1162,"rank": 1,"population": 323764},
    {"country": "portugal","year": 2016,"score": 1356,"rank": 5,"population": 10371627},
    {"country": "spain","year": 2017,"score": 1568,"rank": 25,"population": 46354321},
    {"country": "syria","year": 2015,"score": 3645,"rank": 162,"population": 18734987},
    {"country": "japan","year": 2017,"score": 1408,"rank": 10,"population": 127484450}
];

///////////////////////////GPI-DATABASE///////////////////////////////

MongoClient.connect(mdbGpiStats, { native_parser: true }, (err, mlabs) => {
    if (err) {
        console.error("Error accesing gpi-stats DB: " + err);
        process.exit(1);
    }
    console.log("Connected to gpi-stats DB.");
    var gpistatsdatabase = mlabs.db("sos1718-13-gpistats");
    var dbGpiStats = gpistatsdatabase.collection("gpi-stats");

    dbGpiStats.find({}).toArray((err, stats) => {
        if (err) {
            console.error("Error accesing DB");
            //process.exit(1);
        }
        if (stats.length == 0) {
            console.log("Empty DB ");
        }
        else {
            console.log("Gpi Stats DB has " + stats.length + " stats.");
        }
    });
    gpistatsApi.register(app, dbGpiStats, initialGpiStats);
});


////////////////AGR/////////////////////////////////////////////////////////////////////////

//var f_one_drivers;
var initialF_one_drivers = [{
        "year": 1950,
        "driver": "Giuseppe Farina",
        "age": 44,
        "team": "Alfa Romeo",
        "engine": "Alfa Romeo",
        "win": 3,
        "point": 30,
        "race": "Italian Grand Prix",
        "country": "Italy"
    },

    {
        "year": 1951,
        "driver": "Juan Manuel Fangio",
        "age": 40,
        "team": "Alfa Romeo",
        "engine": "Alfa Romeo",
        "win": 3,
        "point": 31,
        "race": "Spanish Grand Prix",
        "country": "Argentina"
    },

    {
        "year": 1952,
        "driver": "Alberto Ascari",
        "age": 34,
        "team": "Ferrari",
        "engine": "Ferrari",
        "win": 6,
        "point": 36,
        "race": "German Grand Prix",
        "country": "Italy"
    },

    {
        "year": 1953,
        "driver": "Alberto Ascari",
        "age": 35,
        "team": "Ferrari",
        "engine": "Ferrari",
        "win": 5,
        "point": 34,
        "race": "Swiss Grand Prix",
        "country": "Italy"
    },

    {
        "year": 1954,
        "driver": "Juan Manuel Fangio",
        "age": 43,
        "team": "Maserati",
        "engine": "Maserati",
        "win": 6,
        "point": 42,
        "race": "Swiss Grand Prix",
        "country": "Argentina"
    }
];
/*var dbF_One = new DataStore({

    filename: dbAgr,
    autoload: true
    
});*/
/////////////////////BASE DE DATOS F-ONE-DRIVERS:
MongoClient.connect(mdbFOneDrivers, { native_parser: true }, (err, mlabs) => {
    if (err) {
        console.error("Error accesing f-one-drivers DB: " + err);
        process.exit(1);
    }
    console.log("Connected to f-one-drivers DB.");
    var fonedriversdatabase = mlabs.db("sos1718-agr-sandbox");
    var dbFOneDrivers = fonedriversdatabase.collection("drivers");

    dbFOneDrivers.find({}).toArray((err, drivers) => {
        if (err) {
            console.error("Error accesing DB");
            //process.exit(1);
        }
        if (drivers.length == 0) {
            console.log("Empty DB ");
        }
        else {
            console.log("F-One-Drivers DB has " + drivers.length + " F-One-Drivers.");
        }
    });
    fonedriversApi.register(app, dbFOneDrivers, initialF_one_drivers);
});

//////////////////////////////////////////////////////////////////ALEJANDRO: MOTOGPCHAMPIONS
///////////////////////////////VARIABLES INICIALES:
var initialMotoGPChamps = [
    { "year": 1949, "country": "united_kingdom", "rider": "leslie_graham", "constructor": "ajs", "win": 2 },
    { "year": 1950, "country": "italy", "rider": "umberto_masetti", "constructor": "gilera", "win": 2 },
    { "year": 1951, "country": "united_kingdom", "rider": "geoff_duke", "constructor": "norton", "win": 4 },
    { "year": 1952, "country": "italy", "rider": "umberto_masetti", "constructor": "gilera", "win": 2 },
    { "year": 1953, "country": "united_kingdom", "rider": "geoff_duke", "constructor": "gilera", "win": 4 },
];

///////////////////////////////INICIALIZAR BASE DE DATOS:
/*var dbMotoGPChampions = new DataStore({
    filename: dbMotoGPChampions,
    autoload: true                
});*/
MongoClient.connect(mdbMotoGPChamps, { native_parser: true }, (err, mlabs) => {
    if (err) {
        console.error("Error accesing motogpchamps DB: " + err);
        process.exit(1);
    }
    /////////////////////BASE DE DATOS MOTOGPCHAMPS:
    console.log("Connected to motogpchamps DB.");
    var MotoGPChampsdatabase = mlabs.db("sos1718-13-motogpchamps");
    var dbMotoGPChamps = MotoGPChampsdatabase.collection("motogpchamps");

    dbMotoGPChamps.find({}).toArray((err, champs) => {
        if (err) {
            console.error("Error accesing DB");
            process.exit(1);
        }
        else if (champs.length == 0) {
            console.log("Empty DB Longitud =0. ");
            //dbMotoGPChamps.insert(initialMotoGPChamps);
        }
        else {
            console.log("MotoGPChampsDB has " + champs.length + " MotoGPChamps.");
        }
    });
    motogpchampsApi.register(app, dbMotoGPChamps, initialMotoGPChamps);
});
//--------------------------------------------------------------------------------------------------------------------------------------------//
app.listen(port, () => {
    console.log("Server ready on port " + port + "!");
}).on("error", (e) => {
    console.log("Server NOT ready: " + e + "!");
});
