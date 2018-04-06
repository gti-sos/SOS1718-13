var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var DataStore = require("nedb");


var app = express();
app.use(bodyParser.json());
var port = (process.env.PORT || 1607);


var BASE_API_PATH = "/api/v1";

var MongoClient = require("mongodb").MongoClient;


/////////VARIABLES API:
var motogpchampsApi = require("./motogpchampsApi");
var fonedriversApi = require("./fonedriversApi");


/////////BASES DE DATOS:
var mdbMotoGPChamps = "mongodb://valentino:rossi@ds129939.mlab.com:29939/sos1718-13-motogpchamps";
var mdbFOneDrivers = "mongodb://alfgutrom:alfgutrom1.@ds231559.mlab.com:31559/sos1718-agr-sandbox";

var dbGpiStats = __dirname + "/gpi-stats.db";


app.use("/", express.static(path.join(__dirname + "/public")));
app.get("/hello", (req, res) => {
    res.send("Hello World");
});

//////////////////////////////////////PRL (GPI-STATS)///////////////////////////////////////
app.get(BASE_API_PATH + "/gpi-stats/help", (req, res) => {
    res.redirect("https://documenter.getpostman.com/view/395479/sos1718-gpi-stats/RVnZhdpa");
});

var gpi_stats;
var ini_gpi_stats = [{
        "country": "iceland",
        "year": 2013,
        "score": 1162,
        "rank": 1,
        "population": 323764
    },
    {
        "country": "portugal",
        "year": 2016,
        "score": 1356,
        "rank": 5,
        "population": 10371627
    }, {
        "country": "spain",
        "year": 2017,
        "score": 1568,
        "rank": 25,
        "population": 46354321
    }, {
        "country": "syria",
        "year": 2015,
        "score": 3645,
        "rank": 162,
        "population": 18734987
    }, {
        "country": "japan",
        "year": 2017,
        "score": 1408,
        "rank": 10,
        "population": 127484450
    }
]
//Data Store//                  
var dbGpi = new DataStore({

    filename: dbGpiStats,
    autoload: true

});

//Fill the DB//
app.get(BASE_API_PATH + "/gpi-stats/loadInitialData", (req, res) => {
    console.log(Date() + " - Trying to load Stats");

    dbGpi.find({}, (err, stats) => {
        console.log(Date() + " - Looking into the data");
        if (err) {
            console.error("error accesing db");
            process.exit(1);
        }
        if (stats.length == 0) {
            console.log("empty db");
            dbGpi.insert(ini_gpi_stats);
            res.sendStatus(201);
        }
        else {
            console.log("DB initiallited with " + stats.length + "stats");
        }
    });

});

//Methods//

//GET base path//
app.get(BASE_API_PATH + "/gpi-stats", (req, res) => {
    console.log(Date() + " - GET / gpi-stats");

    dbGpi.find({}, (err, stats) => {
        if (err) {
            console.error("Error accesing DB");
            res.sendStatus(500);
            return;
        }

        res.send(stats);
    });

});

//GET to a resource//

app.get(BASE_API_PATH + "/gpi-stats/:year", (req, res) => {
    var year = req.params.year;

    console.log(Date() + " - GET / gpi-stats/" + year);
    dbGpi.find({ year: parseInt(year) }, (err, stat) => {
        if (err) {
            console.error("Error acceso DB");
            res.sendStatus(500);
            return;
        }
        res.send(stat);
    });

});

//GET to a resource using 2 parameters//

app.get(BASE_API_PATH + "/gpi-stats/:country/:year/", (req, res) => {
    var country = req.params.country;
    var year = req.params.year;

    console.log(Date() + " - GET / gpi-stats/" + country + "/" + year);
    dbGpi.find({ country: country, year: parseInt(year) }, (err, stat) => {
        if (err) {
            console.error("Error acceso DB");
            res.sendStatus(500);
            return;
        }
        res.send(stat);
    });
});

//POST to base path//

app.post(BASE_API_PATH + "/gpi-stats", (req, res) => {
    console.log(Date() + " - POST / gpi-stats");
    var stat = req.body;
    dbGpi.insert(stat);
    //f_one_drivers.push(driver);
    res.sendStatus(201); //Created
});

//POST to a resource//

app.post(BASE_API_PATH + "/gpi-stats/:year", (req, res) => {
    var year = req.params.year;

    console.log(Date() + " - POST / f-one-drivers/" + year + " - Hacking attempt detected");
    res.sendStatus(405); //Method Not Allowed
});

//PUT base path//

app.put(BASE_API_PATH + "/gpi-stats", (req, res) => {
    console.log(Date() + " - PUT / gpi-stats - Hacking attempt detected");
    res.sendStatus(405); //Method Not Allowed
});

//PUT a un recurso
app.put(BASE_API_PATH + "/gpi-stats/:year", (req, res) => {
    var year = req.params.year;
    var stat = req.body;

    console.log(Date() + " - PUT / gpi-stats/" + year);
    if (year != stat.year) {
        res.sendStatus(409); //Conflict
        console.warn(Date() + " - Hacking attempt!");
        return;
    }

    dbGpi.update({ year: parseInt(stat.year) }, stat, (err, numUpdate) => { console.log("Updated: " + numUpdate); });
    res.sendStatus(200); //OK
});

//DELETE base path//
app.delete(BASE_API_PATH + "/gpi-stats", (req, res) => {
    console.log(Date() + " - DELETE / gpi-stats");
    gpi_stats = [];

    dbGpi.remove({}, { multi: true });

    res.sendStatus(200); //OK
});

//DELETE resource//
app.delete(BASE_API_PATH + "/gpi-stats/:year", (req, res) => {
    var year = req.params.year;

    console.log(Date() + " - DELETE / gpi-stats/" + year);
    dbGpi.remove({ year: parseInt(year) });
    res.sendStatus(200); //OK
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
            console.log("Empty DB Principal");
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
        if (champs.length == 0) {
            console.log("Empty DB Principal");
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
