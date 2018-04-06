var motogpchampsApi = {};
var BASE_API_PATH = "/api/v1";

module.exports = motogpchampsApi;

motogpchampsApi.register = function(app, db, initialMotoGPChamps) {
    console.log("Registering routes for motogpchampsApi. ");


    app.get(BASE_API_PATH + "/motogpchamps/loadInitialData", (req, res) => {
        db.find({}).toArray((err, motogpchamps) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }
            if (motogpchamps.length == 0) {
                console.log("Empty DB (InitialData)");
                db.insert(initialMotoGPChamps);
                console.log("DB initialized with " + motogpchamps.length + " champs.");
                res.sendStatus(201);
            }
            else {
                console.log("DB has " + motogpchamps.length + " Moto GP Champions.");
            }
            res.redirect(BASE_API_PATH + "/motogpchamps");
        });
    });
    /////////////////////////////////////////////             API REST:
    //GET a COLECCIÓN:
    app.get(BASE_API_PATH + "/motogpchamps", (req, res) => {
        console.log(Date() + " - GET /motogpchamps");

        db.find({}).toArray((err, motogpchamps) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }
            res.send(motogpchamps.map((c) => {
                delete c._id;
                return c;
            }));
        });
    });
    //POST a COLLECCIÓN:
    app.post(BASE_API_PATH + "/motogpchamps", (req, res) => {
        console.log(Date() + " - POST /motogpchamps");
        var champ= req.body;
        db.insert(champ);
        res.sendStatus(201); //Created
    });
    //PUT a COLLECCIÓN:
    app.put(BASE_API_PATH + "/motogpchamps", (req, res) => {
        console.log(Date() + " - PUT /motogpchamps");
        res.sendStatus(405);  //Method not allowed
    });
    //DELETE a COLLECCIÓN:
    app.delete(BASE_API_PATH + "/motogpchamps", (req, res) => {
        console.log(Date() + " - DELETE /motogpchamps");

        db.remove({}, { multi: true });
        res.sendStatus(200); //Ok
    });







    //GET a RECURSO CONCRETO:
    app.get(BASE_API_PATH + "/motogpchamps/:year", (req, res) => {
        var year = req.params.year;
        console.log(Date() + " - GET /motogpchamps/" + year);

        db.find({ "year": parseInt(year) }).toArray((err, motogpchamps) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }
            res.send(motogpchamps.map((c) => {
                delete c._id;
                return c;
            }));
        });
    });
    //GET a un RECURSO CONCRETO 2 PARÁMETROS:
    app.get(BASE_API_PATH + "/motogpchamps/:rider/:constructor", (req, res) => {
        var rider = req.params.rider;
        var constructor = req.params.constructor;
        console.log(Date() + " - GET /motogpchamps/" + rider + "/" + constructor);

        db.find({ "rider": rider, "constructor": constructor }).toArray((err, motogpchamps) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }
            if (motogpchamps.length == 0) {
                res.sendStatus(404);
                return;
            }
            else {
                res.send(motogpchamps.filter((c) => {
                    delete c._id;
                    return c;
                }));
            }
        });
    });


    //DELETE a RECURSO CONCRETO:
    app.delete(BASE_API_PATH + "/motogpchamps/:year", (req, res) => {
        var year = req.params.year;
        console.log(Date() + " - DELETE /motogpchamps/" + year);
        
        db.remove({"year" : parseInt(year)});
        res.sendStatus(200);
    });
    //Hacer un POST a RECURSO CONCRETO
    app.post(BASE_API_PATH + "/motogpchamps/:year", (req, res) => {
        var year = req.params.year;
        console.log(Date() + " - POST /motogpchamps/" + year);
        res.sendStatus(405);
    });
    //Hacer un PUT a RECURSO CONCRETO
    app.put(BASE_API_PATH + "/motogpchamps/:year", (req, res) => {
        var year = req.params.year;
        var champion = req.body;

        console.log(Date() + " - PUT /motogpchamps/" + year);

        if (year != champion.year) {
            res.sendStatus(409);
            console.warn(Date() + " - Hacking attempt!");
            return;
        }
        db.update({ "year": parseInt(champion.year,10)}, champion, (err, numUpdated) => {
            console.log("Update: " + numUpdated);
        });
        /*initialMotoGPChamps = initialMotoGPChamps.map((c) => {
            if (c.year == champion.year)
                return champion;
            else
                return c;
        });*/
        res.sendStatus(200);
    });

}
