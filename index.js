var express = require("express");
var path = require("path"); 
var bodyParser = require("body-parser");
var DataStore = require("nedb");


var app = express();
app.use(bodyParser.json());
var port = (process.env.PORT || 1607);

var BASE_API_PATH = "/api/v1";
var dbAgr = __dirname+"/f-one-drivers.db";

//app.use("/",express.static(path.join(__dirname+"/public")));
app.get("/hello",(req,res)=>{
    res.send("Hello World");
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

//find{name: "loquesea"} o {} para todos
dbF_One.find({},(err,f_one_drivers)=>{
    if(err){
        console.error("Error acceso DB");
        process.exit(1);//Cierra el servidor
    }
    
    if(f_one_drivers.length==0){
        console.log("Empty DB");
        dbF_One.insert(initialF_one_drivers);
    }else{
        console.log("DB initialized with " + f_one_drivers.length + " drivers" );
    }
    
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
    
    dbF_One.update({year : parseInt(driver.year)},driver,(err,numUpdate)=>{console.log("Updated: " + numUpdate)});
    

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

////////////////////////////////////////////////////////////////////////////////////////////




app.listen(port,()=>{
    console.log("Server ready on port "+port+ "!");
}).on("error",(e)=>{
     console.log("Server NOT ready: "+e+"!");   
});
