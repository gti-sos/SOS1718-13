var motogpchampsApi = {};
var BASE_API_PATH = "/api/v1";

//Variable APIkey:
var apikey = "sos1718-alesuafer";

module.exports = motogpchampsApi;

motogpchampsApi.register = function(app, db, initialMotoGPChamps) {
    console.log("Registering routes for motogpchampsApi. ");

    //Pruebas APIkey:
    //Comprueba si la apikey pasada es validad o indefinidad(imprime error)
    /*function CheckKey(key, response) {
        var valid = false;
        if (key == undefined) {
            console.log("Error: APIkey doesn't provided");
            response.sendStatus(401);
        }
        else if (key != apikey) {
            console.log("Error: Incorrect APIkey");
            response.sendStatus(403);
        }
        else {
            valid = true;
        }
        return valid;
    }*/
    app.get(BASE_API_PATH + "/motogpchamps/docs", (req, res) => {res.redirect("https://documenter.getpostman.com/view/3897424/sos1718-13-motogpchampions/RVu5i8YA")});
    ////////////////////////////////   LoadInitialData:  /////////////////////////
    app.get(BASE_API_PATH + "/motogpchamps/loadInitialData", (req, res) => {
        console.log(Date() + " - Trying to load 5 champs");
        /*var keyprovided = req.query.apikey;
        if (CheckKey(keyprovided, res)) {*/
            db.find({}).toArray((err, motogpchamps) => {
                if (err) {
                    console.error("Error accesing DB");
                    res.sendStatus(500);
                    return;
                }
                else if (motogpchamps.length == 0) {
                    console.log("Empty DB ");
                    db.insert(initialMotoGPChamps);
                    //console.log("DB initialized with " + motogpchamps.length + " champs.");
                    res.sendStatus(201);
                }
                else {
                    console.log("DB has " + motogpchamps.length + " Moto GP Champions.");
                }
                //res.redirect(BASE_API_PATH + "/motogpchamps");
            });
        /*}*/
    });
    //////////////////////////////////////      API REST:         //////////////////////
    //GET a COLECCIÓN:
    app.get(BASE_API_PATH + "/motogpchamps", (req, res) => {
        //var year = req.params.year;
        var rider = req.query.rider;
        var year = Number(req.query.year);
        var constructor = req.query.constructor;
        var win = Number(req.query.win);
        var country = req.query.country;

        var limit = Number(req.query.limit);
        var offset = Number(req.query.offset);
        var yearfrom = req.query.from;
        var yearto = req.query.to;
        var mdbQuery = {};


        if (yearfrom == undefined) { yearfrom = 0; }
        if (yearto == undefined) { yearto = Number.POSITIVE_INFINITY; }

        mdbQuery.$and = [{ "year": { "$gte": Number(yearfrom) } },
            { "year": { "$lte": Number(yearto) } }
        ];
        console.log(Date() + " - GET /motogpchamps from " + yearfrom + " to " + yearto);

        if (rider != undefined) { mdbQuery.$and = mdbQuery.$and.concat([{ "rider": rider }]); }
        if (year != undefined && !isNaN(year)) { mdbQuery.$and = mdbQuery.$and.concat([{ "year": year}]); }
        if (constructor != undefined) { mdbQuery.$and = mdbQuery.$and.concat([{ "constructor": constructor}]); }
        if (win != undefined && !isNaN(win)) { mdbQuery.$and = mdbQuery.$and.concat([{ "win": win }]); }
        if (country != undefined) { mdbQuery.$and = mdbQuery.$and.concat([{ "country": country }]); }


        console.log("Query => " + mdbQuery);

        db.find(mdbQuery).skip(offset).limit(limit).toArray((err, rider) => {
            console.log("Resultado => " + rider);
            if (err) {
                console.error("Error acceso DB");
                res.sendStatus(500);
                return;
            }
            if (rider.length == 0) {
                res.sendStatus(404);
            }
            else {
                res.send(rider.map((c) => { delete c._id; return c; }));
            }
        });
    });
    //POST a COLLECCIÓN:
    app.post(BASE_API_PATH + "/motogpchamps", (req, res) => {
        console.log(Date() + " - POST /motogpchamps");
        var champ = req.body;
       // var keyprovided = req.query.keyprovided;
        /*if (CheckKey(keyprovided, res)) {*/
            if (!champ) {
                console.log("WARNING: New request to /motogpchamps/ without name");
                res.sendStatus(400); //Bad request
            }
            else {
                if (!champ.year || !champ.rider || !champ.country || !champ.constructor || !champ.win) {
                    console.log("WARNING: Request not well-formed");
                    res.sendStatus(400); //Unprocessable entity
                }
                else {
                    db.find({
                        "year": champ.year
                    }).toArray((err, motogpchampsBefore) => {
                        if (err) {
                            console.error("ERROR: ");
                            res.sendStatus(500); //Internal server error
                        }
                        else {
                            if (motogpchampsBefore.length > 0) {
                                console.log("WARNING: The champ already exists");
                                res.sendStatus(409); // Conflict
                            }
                            else {
                                console.log("INFO: Adding champ");
                                db.insert(champ);
                                res.sendStatus(201); //Created
                            }
                        }
                    });
                }
            }
        /*}*/
    });
    //PUT a COLLECCIÓN:
    app.put(BASE_API_PATH + "/motogpchamps", (req, res) => {
        var keyprovided = req.query.apikey;
        /*if (CheckKey(keyprovided, res)) {*/
            console.log(Date() + " - PUT /motogpchamps");
            res.sendStatus(405); //Method not allowed
        /*}*/
    });
    //DELETE a COLLECCIÓN:
    app.delete(BASE_API_PATH + "/motogpchamps", (req, res) => {
        console.log(Date() + " - DELETE /motogpchamps");
        /*var keyprovided = req.query.apikey;
        if (CheckKey(keyprovided, res)) {*/
            db.remove({}, { multi: true }, (err, result) => {
                var numRemoved = JSON.parse(result);
                if (err) {
                    console.error("ERROR: Internal server error");
                    res.sendStatus(500); //Internal server error
                }
                else {
                    if (numRemoved.n > 0) {
                        console.log("INFO: All champs have been removed");
                        res.sendStatus(204); //No content
                    }
                    else {
                        console.log("WARNING: Ther are no champs to be deleted");
                        res.sendStatus(404); //Not found
                    }
                }
            });
        /*}*/
    });







    //GET a RECURSO CONCRETO:
    app.get(BASE_API_PATH + "/motogpchamps/:parameter", (req, res) => {
        var parameter = req.params.parameter;
        var year;
        var country;
        var limit = Number(req.query.limit);
        var offset = Number(req.query.offset);
        //var keyprovided = req.query.apikey;
        var yearfrom = req.query.from;
        var yearto = req.query.to;
        var mongoquery = {}
        console.log(Date() + " - GET /motogpchamps/" + parameter + "/" + constructor);

        if (parameter == undefined) {
            console.log("WARNING: Bad request");
            res.sendStatus(400); // Bad request
        }
        if (isNaN(parameter)) {
            mongoquery = {
                "country": parameter
            };
        }
        else {
            mongoquery = {
                "year": Number(parameter)
            };
        }
        if (yearfrom == undefined) {
            yearfrom = 0;
        }
        if (yearto == undefined) {
            yearto = Number.POSITIVE_INFINITY;
        }
        mongoquery.$and = [{
            "year": {
                "$gte": Number(yearfrom)
            }
        }, {
            "year": {
                "$lte": Number(yearto)
            }
        }];
        /*if (CheckKey(keyprovided, res)) {*/
            db.find(
                mongoquery
            ).skip(offset).limit(limit).toArray((err, filteredChamps) => {
                if (err) {
                    console.error('WARNING: Internal server error');
                    res.sendStatus(500); // Internal server error
                }
                else {
                    if (filteredChamps.length > 0) {
                        res.send(filteredChamps.map((c) => { delete c._id; return c; })[0]);
                    }
                    else {
                        console.log("WARNING: There are not any champ with " + year);
                        res.sendStatus(404); // Not found
                    }
                }
            });
        /*}*/
    });
    //GET a un RECURSO CONCRETO 2 PARÁMETROS:
    app.get(BASE_API_PATH + "/motogpchamps/:year/:country", (req, res) => {
        /*var keyprovided = req.query.apikey;
        if (CheckKey(keyprovided, res)) {*/
            var year = parseInt(req.params.year);
            var country = req.params.country;
            var limit = Number(req.query.limit);
            var offset = Number(req.query.offset);
            var yearfrom = req.query.from;
            var yearto = req.query.to;
            console.log(Date() + " - GET /motogpchamps/" + year + "/" + country);

            if (!year && !country) {
                console.log("WARNING: Bad request");
                res.sendStatus(400); // Bad request
            }
            else{
                db.find({
                    "year": year,
                    "country": country
                }).toArray((err,champs) => {
                    if(err){
                         console.error('WARNING: Internal server error');
                        res.sendStatus(500); // Internal server error
                    }
                    else{
                       if (champs.length > 0) {
                            res.send(champs.map((c) => { delete c._id; return c; })[0]);
                        }
                        else {
                            console.log("WARNING: There are not any champs with year" + year);
                            res.sendStatus(404); // Not found
                        } 
                    }
                });
            }
        /*}*/
    });



    //DELETE a RECURSO CONCRETO:
    app.delete(BASE_API_PATH + "/motogpchamps/:year", (req, res) => {
        var year = parseInt(req.params.year);
        //var keyprovided = req.query.apikey;
        console.log(Date() + " - DELETE /motogpchamps/" + year);

        /*if (CheckKey(keyprovided, res)) {*/
            if (!year) {
                console.log("WARNING: Bad request");
                res.sendStatus(400); //Bad request
            }
            else {
                db.remove({
                    "year": year
                }, {}, (err, result) => {
                    var numRemoved = JSON.parse(result);
                    if (err) {
                        console.error('WARNING: Internal server error');
                        res.sendStatus(500); // internal server error
                    }
                    else {
                        console.log("INFO: Champs removed: " + numRemoved.n);
                        if (numRemoved.n === 1) {
                            console.log("INFO: Champ deleted");
                            res.sendStatus(204); // no content
                        }
                        else {
                            console.log("WARNING: There are no champs to delete");
                            res.sendStatus(404); // not found
                        }
                    }
                })
            }
        /*}*/
    });
    //Hacer un POST a RECURSO CONCRETO
    app.post(BASE_API_PATH + "/motogpchamps/:year", (req, res) => {
        /*var keyprovided = req.query.apikey;
        if (CheckKey(keyprovided, res)) {*/
            var year = parseInt(req.params.year);
            console.log(Date() + " - POST /motogpchamps/" + year);
            res.sendStatus(405); //Method not allowed
        //}
    });
    //Hacer un PUT a RECURSO CONCRETO
    app.put(BASE_API_PATH + "/motogpchamps/:year/:country", (req, res) => {
        var year = parseInt(req.params.year);
        var country = req.params.country;
        var updatedChamp = req.body;
        //var keyprovided = req.query.apikey;

        console.log(Date() + " - PUT /motogpchamps/" + year);

        /*if (CheckKey(keyprovided, res)) {*/
            if (!updatedChamp) {
                console.log("WARNING: Bad request");
                res.sendStatus(400);
            }
            else if (year != updatedChamp.year) {
                console.log("INFO: year changed");
                console.warn(Date() + " - Hacking attempt!");
                res.sendStatus(409);
            }
            else if (country != updatedChamp.country) {
                console.log("INFO: country changed");
                console.warn(Date() + " - Hacking attempt!");
                res.sendStatus(409);
            }
            else {
                if (!updatedChamp.year || !updatedChamp.rider || !updatedChamp.country || !updatedChamp.constructor || !updatedChamp.win) {
                    console.log("WARNING: Request not well-formed");
                    res.sendStatus(422); //Unprocessable entity
                }
                else {
                    db.find({
                        "year": year,
                        "country": country
                    }).toArray((err, champsBeforeInsertion) => {
                        if (err) {
                            console.error("ERROR: Internal server error")
                            res.sendStatus(500); //Internal Server Error
                        }
                        else {
                            if (champsBeforeInsertion.length > 0) {
                                db.update({
                                    "country": country,
                                    "year": year
                                }, updatedChamp);
                                res.sendStatus(200); //OK
                            }
                            else {
                                console.log("WARNING: Theres is not any champ with year: " + year);
                                res.sendStatus(404); //Not found
                            }
                        }
                    });
                }
            }
        /*}*/
    });

}
