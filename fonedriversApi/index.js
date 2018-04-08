var fonedriversApi = {};
var BASE_API_PATH = "/api/v1";

module.exports = fonedriversApi;

fonedriversApi.register = function(app, db, initialF_one_drivers) {
    console.log("Registering routes for fonedriversApi. ");


    app.get(BASE_API_PATH + "/f-one-drivers/loadInitialData", (req, res) => {
        console.log(Date() + " - Trying to load 5 drivers");

        //find{name: "loquesea"} o {} para todos
        db.find({}).toArray((err, f_one_drivers) => {
            if (err) {
                console.error("Error acceso DB");
                res.sendStatus(500);
                return;
                //process.exit(1);//Cierra el servidor
            }
            if (f_one_drivers.length == 0) {
                console.log("Empty DB");
                db.insert(initialF_one_drivers);
                console.log("DB initialized with " + f_one_drivers.length + " drivers");
                res.sendStatus(201);

            }
            else {
                console.log("DB already have " + f_one_drivers.length + " drivers");
                            res.redirect(BASE_API_PATH + "/f-one-drivers");
            }
        });

    });
   /* //GET a ruta base SIN BUSQUEDA
    app.get(BASE_API_PATH + "/f-one-drivers", (req, res) => {
        console.log(Date() + " - GET / f-one-drivers");

        db.find({}).toArray((err, f_one_drivers) => {
            if (err) {
                console.error("Error acceso DB");
                res.sendStatus(500);
                return;
            }

            res.send(f_one_drivers.map((c) => { delete c._id; return c; }));
        });

    });*/


 //GET a ruta base (paginacion y busqueda)
    app.get(BASE_API_PATH + "/f-one-drivers", (req, res) => {
        //var year = req.params.year;
        var driver=req.query.driver;
        var age=Number(req.query.age);
        var team=req.query.team;
        var engine=req.query.engine;
        var win=Number(req.query.win);
        var point=Number(req.query.point);
        var race=req.query.race;
        var country=req.query.country;
        
        var limit = Number(req.query.limit);
        var offset = Number(req.query.offset);
        var yearfrom = req.query.from;
        var yearto = req.query.to;
        var mdbQuery={};
        
        
        if (yearfrom == undefined) {yearfrom = 0;}
        if (yearto == undefined) {yearto = Number.POSITIVE_INFINITY;}
        
         mdbQuery.$and=[{"year": {"$gte": Number(yearfrom)}}, 
         {"year": {"$lte": Number(yearto)}}];
        console.log(Date() + " - GET / f-one-drivers from " + yearfrom + " to " + yearto);
        
        if (driver != undefined) {mdbQuery.$and= mdbQuery.$and.concat([{"driver": driver}]);}
        if (age != undefined && !isNaN(age)) {mdbQuery.$and= mdbQuery.$and.concat([{"age": age}]);}
        if (team != undefined) {mdbQuery.$and= mdbQuery.$and.concat([{"team": team}]);}
        if (engine != undefined) {mdbQuery.$and= mdbQuery.$and.concat([{"engine": engine}]);}
        if (win != undefined && !isNaN(win)) {mdbQuery.$and= mdbQuery.$and.concat([{"win": win}]);}
        if (point != undefined && !isNaN(point)) {mdbQuery.$and= mdbQuery.$and.concat([{"point": point}]);}
        if (race != undefined) {mdbQuery.$and= mdbQuery.$and.concat([{"race": race}]);}
        if (country != undefined) {mdbQuery.$and= mdbQuery.$and.concat([{"country": country}]);}
        
        
        console.log("Query => " + mdbQuery);
        
        db.find(mdbQuery).skip(offset).limit(limit).toArray((err, driver) => {
            console.log("Resultado => " + driver);
            if (err) {
                console.error("Error acceso DB");
                res.sendStatus(500);
                return;
            }
            if(driver.length==0){
            res.sendStatus(404);}
            else{
            res.send(driver.map((c) => { delete c._id; return c; }));}
        });
    });
    
    //GET a un recurso
    app.get(BASE_API_PATH + "/f-one-drivers/:year", (req, res) => {
        var year = req.params.year;

        console.log(Date() + " - GET / f-one-drivers/" + year);
        db.find({ "year": parseInt(year) }).toArray((err, driver) => {
            if (err) {
                console.error("Error acceso DB");
                res.sendStatus(500);
                return;
            }
            if(driver.length==0){
            res.sendStatus(404);}
            else{
            res.send(driver.map((c) => { delete c._id; return c; }));}
        });

        /*res.send(f_one_drivers.filter((c)=>{
            return (c.year==year);
            
        })[0]);*/
    });

    /*//GET a un recurso con 2 parametros ////NO TIENE SENTIDO
    app.get(BASE_API_PATH + "/f-one-drivers/:driver/:year/", (req, res) => {
        var year = req.params.year;
        var driver = req.params.driver;

        console.log(Date() + " - GET / f-one-drivers/" + driver + "/" + year);
        res.send(year);
    });*/

    //POST a ruta base
    var existe = false;
    app.post(BASE_API_PATH + "/f-one-drivers", (req, res) => {
        console.log(Date() + " - POST / f-one-drivers");
        var driver = req.body;

        db.find({ "year": parseInt(driver.year) }).toArray((err, result) => {
            if (err) {
                console.error("Error acceso DB");
                res.sendStatus(500);
                return;
            }
            console.log("EL TAMAÑO ES => " + result.length );
            if(result.length>0)
            {res.sendStatus(409);}
        else{
            console.log("VALOR DE EXISTE EN ELSE => " + existe);
        db.insert(driver);
        //f_one_drivers.push(driver);
        res.sendStatus(201); //Created
        }
        })
    });

    //POST a un recurso
    app.post(BASE_API_PATH + "/f-one-drivers/:year", (req, res) => {
        var year = req.params.year;

        console.log(Date() + " - POST / f-one-drivers/" + year);
        res.sendStatus(405); //Method Not Allowed
    });


    //PUT a ruta base
    app.put(BASE_API_PATH + "/f-one-drivers", (req, res) => {
        console.log(Date() + " - PUT / f-one-drivers");
        res.sendStatus(405); //Method Not Allowed
    });

    //PUT a un recurso
    app.put(BASE_API_PATH + "/f-one-drivers/:year", (req, res) => {
        var year = req.params.year;
        var driver = req.body;

        console.log(Date() + " - PUT / f-one-drivers/" + year);
        if (year != driver.year) {
            res.sendStatus(400); //Bad Request
            console.warn(Date() + " - Hacking attempt!");
            return;
        }
        db.update({ "year": parseInt(driver.year, 10) }, driver, (err, numUpdate) => { console.log("Updated: " + numUpdate); });

        /*f_one_drivers = f_one_drivers.map((c)=>{
            if(c.year==driver.year)
                return driver;
                else
                return c;
            
        });*/

        res.sendStatus(200); //OK
    });

    //DELETE a ruta base
    app.delete(BASE_API_PATH + "/f-one-drivers", (req, res) => {
        console.log(Date() + " - DELETE / f-one-drivers");
        //f_one_drivers = [];

        db.remove({}, { multi: true });

        res.sendStatus(200); //OK
    });

    //DELETE a un recurso
    app.delete(BASE_API_PATH + "/f-one-drivers/:year", (req, res) => {
        var year = req.params.year;

        console.log(Date() + " - DELETE / f-one-drivers/" + year);
        db.remove({ year: parseInt(year) });
        /*f_one_drivers = f_one_drivers.filter((c)=>{
            return (c.year!=year);
            
        });*/
        res.sendStatus(200); //OK
    });


}
