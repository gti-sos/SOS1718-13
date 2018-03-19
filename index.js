var express = require("express");
var path = require("path"); 
var bodyParser = require("body-parser");
var DataStore = require("nedb");


var app = express();
app.use(bodyParser.json());
var port = (process.env.PORT || 1607);


var BASE_API_PATH = "/api/v1";

var dbAgr = __dirname+"/f-one-drivers.db";
var dbMotoGPChampions = __dirname+"/motogpchampions.db";
var dbGpiStats = __dirname+"/gpi-stats.db";


app.use("/",express.static(path.join(__dirname+"/public")));
app.get("/hello",(req,res)=>{
    res.send("Hello World");
});

//////////////////////////////////////PRL (GPI-STATS)///////////////////////////////////////
app.get(BASE_API_PATH+"/gpi-stats/help", (req,res)=>{
    res.redirect("https://documenter.getpostman.com/view/395479/sos1718-gpi-stats/RVnZhdpa");
});

var gpi_stats;
var ini_gpi_stats = [
                 { "country": "iceland",
                   "year": 2013,
                   "score": 1162,
                   "rank": 1,
                   "population" : 323764
                  },
                  { "country": "portugal",
                   "year": 2016,
                   "score": 1356,
                   "rank": 5,
                   "population" : 10371627
                  },{ "country": "spain",
                   "year": 2017,
                   "score": 1568,
                   "rank": 25,
                   "population" : 46354321
                  },{ "country": "syria",
                   "year": 2015,
                   "score": 3645,
                   "rank": 162,
                   "population" : 18734987
                  },{ "country": "japan",
                   "year": 2017,
                   "score": 1408,
                   "rank": 10,
                   "population" : 127484450
                  }]
//Data Store//                  
var dbGpi = new DataStore({
    
    filename: dbGpiStats,
    autoload: true
    
});

//Fill the DB//
app.get(BASE_API_PATH+"/gpi-stats/loadInitialData",(req,res)=>{
    console.log(Date()+" - Trying to load Stats");
    
    dbGpi.find({},(err,stats)=>{
        console.log(Date()+" - Looking into the data");
    if(err){
        console.error("error accesing db");
        process.exit(1);
    }
    if(stats.length == 0){
        console.log("empty db");
        dbGpi.insert(ini_gpi_stats);
        res.sendStatus(201);
    }else{
        console.log("DB initiallited with "+stats.length+"stats");
    }
});
    
});

//Methods//

//GET base path//
app.get(BASE_API_PATH+"/gpi-stats",(req,res)=>{
    console.log(Date() + " - GET / gpi-stats");
    
    dbGpi.find({},(err,stats)=>{
    if(err){
        console.error("Error accesing DB");
        res.sendStatus(500);
        return;
    }
        
    res.send(stats);
    });

});

//GET to a resource//

app.get(BASE_API_PATH+"/gpi-stats/:year",(req,res)=>{
    var year = req.params.year;
    
    console.log(Date() + " - GET / gpi-stats/" + year);
    dbGpi.find({year : parseInt(year)},(err,stat)=>{
    if(err){
        console.error("Error acceso DB");
        res.sendStatus(500);
        return;
    }
    res.send(stat);
    });
    
});

//GET to a resource using 2 parameters//

app.get(BASE_API_PATH+"/gpi-stats/:country/:year/",(req,res)=>{
    var country = req.params.country;
    var year = req.params.year;
    
    console.log(Date() + " - GET / gpi-stats/" +country + "/"+year);
    dbGpi.find({country: country, year : parseInt(year)},(err,stat)=>{
        if(err){
           console.error("Error acceso DB");
            res.sendStatus(500);
         return;  
        }
        res.send(stat);
    });
});

//POST to base path//

app.post(BASE_API_PATH+"/gpi-stats",(req,res)=>{
    console.log(Date() + " - POST / gpi-stats");
    var stat = req.body;
    dbGpi.insert(stat);
    //f_one_drivers.push(driver);
    res.sendStatus(201); //Created
});

//POST to a resource//

app.post(BASE_API_PATH+"/gpi-stats/:year",(req,res)=>{
    var year = req.params.year;
    
    console.log(Date() + " - POST / f-one-drivers/" + year +" - Hacking attempt detected");
    res.sendStatus(405); //Method Not Allowed
});

//PUT base path//

app.put(BASE_API_PATH+"/gpi-stats",(req,res)=>{
    console.log(Date() + " - PUT / gpi-stats - Hacking attempt detected");
    res.sendStatus(405);//Method Not Allowed
});

//PUT a un recurso
app.put(BASE_API_PATH+"/gpi-stats/:year",(req,res)=>{
    var year = req.params.year;
    var stat = req.body;
    
    console.log(Date() + " - PUT / gpi-stats/" + year);
        if(year != stat.year){
        res.sendStatus(409);//Conflict
        console.warn(Date() + " - Hacking attempt!");
        return;
    }
    
    dbGpi.update({year : parseInt(stat.year)},stat,(err,numUpdate)=>{console.log("Updated: " + numUpdate);});
    res.sendStatus(200);//OK
});

//DELETE base path//
app.delete(BASE_API_PATH+"/gpi-stats",(req,res)=>{
    console.log(Date() + " - DELETE / gpi-stats");
    gpi_stats = [];
    
    dbGpi.remove({},{multi:true});
    
    res.sendStatus(200);//OK
});

//DELETE resource//
app.delete(BASE_API_PATH+"/gpi-stats/:year",(req,res)=>{
    var year = req.params.year;
    
    console.log(Date() + " - DELETE / gpi-stats/" + year);
    dbGpi.remove({year : parseInt(year)});
    res.sendStatus(200);//OK
});


////////////////AGR/////////////////////////////////////////////////////////////////////////

var f_one_drivers;
var initialF_one_drivers = [
                    { 
                      "year" : 1950, 
                      "driver" : "Giuseppe Farina",
                      "age" : 44,
                      "team" : "Alfa Romeo",
                      "engine" : "Alfa Romeo",
                      "win" : 3,
                      "point" : 30,
                      "race" : "Italian Grand Prix",
                      "country" : "Italy"
                    },
                    {
                      "year" : 1951, 
                      "driver" : "Juan Manuel Fangio",
                      "age" : 40,
                      "team" : "Alfa Romeo",
                      "engine" : "Alfa Romeo",
                      "win" : 3,
                      "point" : 31,
                      "race" : "Spanish Grand Prix",
                      "country" : "Argentina"
                    }
                    ];

var dbF_One = new DataStore({

    filename: dbAgr,
    autoload: true
    
});
app.get(BASE_API_PATH+"/f-one-drivers/loadInitialData",(req,res)=>{
    console.log(Date() + " - Trying to load 2 drivers");
    
    //find{name: "loquesea"} o {} para todos
dbF_One.find({},(err,f_one_drivers)=>{
    if(err){
        console.error("Error acceso DB");
        process.exit(1);//Cierra el servidor
    }
    
    if(f_one_drivers.length==0){
        console.log("Empty DB");
        dbF_One.insert(initialF_one_drivers);
        console.log("DB initialized with " + f_one_drivers.length + " drivers" );
        res.sendStatus(201);
    }else{
        console.log("DB already have " + f_one_drivers.length + " drivers" );
    }
    
});

});
//GET a ruta base
app.get(BASE_API_PATH+"/f-one-drivers",(req,res)=>{
    console.log(Date() + " - GET / f-one-drivers");
    
    dbF_One.find({},(err,f_one_drivers)=>{
    if(err){
        console.error("Error acceso DB");
        res.sendStatus(500);
        return;
    }
        
    res.send(f_one_drivers);
    });

});

//GET a un recurso
app.get(BASE_API_PATH+"/f-one-drivers/:year",(req,res)=>{
    var year = req.params.year;
    
    console.log(Date() + " - GET / f-one-drivers/" + year);
    dbF_One.find({year : parseInt(year)},(err,driver)=>{
    if(err){
        console.error("Error acceso DB");
        res.sendStatus(500);
        return;
    }
    res.send(driver);
    });
    
    /*res.send(f_one_drivers.filter((c)=>{
        return (c.year==year);
        
    })[0]);*/
});

//GET a un recurso con 2 parametros
app.get(BASE_API_PATH+"/f-one-drivers/:driver/:year/",(req,res)=>{
    var year = req.params.year;
    var driver = req.params.driver;
    
    console.log(Date() + " - GET / f-one-drivers/" +driver + "/"+year);
    res.send(year);
});

//POST a ruta base
app.post(BASE_API_PATH+"/f-one-drivers",(req,res)=>{
    console.log(Date() + " - POST / f-one-drivers");
    var driver = req.body;
    dbF_One.insert(driver);
    //f_one_drivers.push(driver);
    res.sendStatus(201); //Created
});

//POST a un recurso
app.post(BASE_API_PATH+"/f-one-drivers/:year",(req,res)=>{
    var year = req.params.year;
    
    console.log(Date() + " - POST / f-one-drivers/" + year);
    res.sendStatus(405);//Method Not Allowed
});


//PUT a ruta base
app.put(BASE_API_PATH+"/f-one-drivers",(req,res)=>{
    console.log(Date() + " - PUT / f-one-drivers");
    res.sendStatus(405);//Method Not Allowed
});

//PUT a un recurso
app.put(BASE_API_PATH+"/f-one-drivers/:year",(req,res)=>{
    var year = req.params.year;
    var driver = req.body;
    
    console.log(Date() + " - PUT / f-one-drivers/" + year);
        if(year != driver.year){
        res.sendStatus(409);//Conflict
        console.warn(Date() + " - Hacking attempt!");
        return;
    }
    
    dbF_One.update({year : parseInt(driver.year)},driver,(err,numUpdate)=>{console.log("Updated: " + numUpdate);});
    

    /*f_one_drivers = f_one_drivers.map((c)=>{
        if(c.year==driver.year)
            return driver;
            else
            return c;
        
    });*/
    
    res.sendStatus(200);//OK
});

//DELETE a ruta base
app.delete(BASE_API_PATH+"/f-one-drivers",(req,res)=>{
    console.log(Date() + " - DELETE / f-one-drivers");
    f_one_drivers = [];
    
    dbF_One.remove({},{multi:true});
    
    res.sendStatus(200);//OK
});

//DELETE a un recurso
app.delete(BASE_API_PATH+"/f-one-drivers/:year",(req,res)=>{
    var year = req.params.year;
    
    console.log(Date() + " - DELETE / f-one-drivers/" + year);
    dbF_One.remove({year : parseInt(year)});
    /*f_one_drivers = f_one_drivers.filter((c)=>{
        return (c.year!=year);
        
    });*/
    res.sendStatus(200);//OK
});

//////////////////////////////////////////////////////////////////ALEJANDRO: MOTOGPCHAMPIONS
///////////////////////////////VARIABLES INICIALES:
var initialMotoGPChampions = [
        { "year" : 1949, "country" : "united_kingdom", "rider": "leslie_graham", "constructor": "ajs", "win": 2},
        { "year" : 1950, "country" : "italy", "rider": "umberto_masetti", "constructor": "gilera", "win": 2}
    ];
///////////////////////////////INICIALIZAR BASE DE DATOS:
var dbMotoGPChampions = new DataStore({
    filename: dbMotoGPChampions,
    autoload: true                
});
app.get(BASE_API_PATH+"/motogpchampions/loadInitialData",(req,res)=>{
    console.log(Date()+" - Trying to load Stats");
    
    dbGpi.find({},(err,stats)=>{
        console.log(Date()+" - Looking into the data");
    if(err){
        console.error("error accesing db");
        process.exit(1);
    }
    if(stats.length == 0){
        console.log("empty db");
        dbMotoGPChampions.insert(initialMotoGPChampions);
        res.sendStatus(201);
    }else{
        console.log("DB initiallited with "+stats.length+"stats");
    }
});
    
});

/////////////////////////////////////////////////////////////ACCIONES PARA LA DB MOTOGPCHAMPIONS DE ALEJANDRO:
// Hacer un  GET a COLLECTION:
app.get(BASE_API_PATH+"/motogpchampions",(req,res) => {
    console.log(Date() + " - GET /motogpchampions");
    
    dbMotoGPChampions.find({},(err,motogpchampions)=>{
        if(err){
            console.error("Error accesing DB");
            res.sendStatus(500);
            return;
        }
        res.send(motogpchampions);
    });    
});
//Hacer un GET a RECURSO CONCRETO
app.get(BASE_API_PATH+"/motogpchampions/:country",(req,res)=>{
    var country = req.params.country;
    console.log(Date() + " - GET /motogpchampions/"+country);
    
    dbMotoGPChampions.find({country : country},(err,motogpchampions)=>{
    if(err){
        console.error("Error acceso DB");
        res.sendStatus(500);
        return;
    }
    res.send(motogpchampions);
    });
    /*res.send(initialMotoGPChampions.filter((c)=>{
        return (c.country == country);
    })[0]);*/
});
//Hacer un GET a un RECURSO con 2 parametros
app.get(BASE_API_PATH+"/motogpchampions/:country/:year/",(req,res)=>{
    var year = req.params.year;
    var country = req.params.country;
    
    console.log(Date() + " - GET /motogpchampions/" +country + "/"+year);
    dbMotoGPChampions.find({ country: country }, { year: Number(year)},(err,motogpchampions)=>{
    if(err){
        console.error("Error acceso DB");
        res.sendStatus(500);
        return;
    }
    res.send(motogpchampions);
    });
});
// Hacer un  POST a COLLECTION
app.post(BASE_API_PATH+"/motogpchampions",(req,res)=>{
    console.log(Date() + " - POST /motogpchampions");
    var champion = req.body;
    dbMotoGPChampions.insert(champion);
    res.sendStatus(201);
});
//Hacer un POST a RECURSO CONCRETO
app.post(BASE_API_PATH+"/motogpchampions/:year",(req,res)=>{
    var year = req.params.year;
    console.log(Date() + " - POST /motogpchampions/"+year);
    res.sendStatus(405);
});
//Hacer un PUT a COLLECTION
app.put(BASE_API_PATH+"/motogpchampions",(req,res)=>{
    console.log(Date() + " - PUT /motogpchampions");
    res.sendStatus(405);  //Method not allowed
});
//Hacer un PUT a RECURSO CONCRETO
app.put(BASE_API_PATH+"/motogpchampions/:year",(req,res)=>{
    var year = req.params.year;
    var champion = req.body;
    
    console.log(Date() + " - PUT /motogpchampions/"+year);
    
    if(year != champion.year){
        res.sendStatus(409);
        console.warn(Date()+" - Hacking attempt!");
        return;
    }
    dbMotoGPChampions.update({"year": parseInt(champion.year)},champion,(err,numUpdated)=>{
        console.log("Update: "+numUpdated);
    });

    res.sendStatus(200);
});
//Hacer un DELETE a COLLECTION
app.delete(BASE_API_PATH+"/motogpchampions",(req,res)=>{
    console.log(Date() + " - DELETE /motogpchampions");
    initialMotoGPChampions = [];
    
    dbMotoGPChampions.remove({},{multi:true});
    
    res.sendStatus(200);
});
//Hacer un DELETE a RECURSO CONCRETO
app.delete(BASE_API_PATH+"/motogpchampions/:year",(req,res)=>{
    var year = req.params.year;
    console.log(Date() + " - DELETE /motogpchampions/"+year);
    dbMotoGPChampions.remove({year:parseInt(year)});
    /*initialMotoGPChampions = initialMotoGPChampions.filter((c)=>{
        return (c.year !=year);
    });*/
    
    res.sendStatus(200);
});
























//--------------------------------------------------------------------------------------------------------------------------------------------//
app.listen(port,()=>{
    console.log("Server ready on port "+port+ "!");
}).on("error",(e)=>{
     console.log("Server NOT ready: "+e+"!");   
});
