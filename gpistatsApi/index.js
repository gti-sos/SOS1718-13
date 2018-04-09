var gpistatsApi = {};
module.exports = gpistatsApi;
var BASE_API_PATH = "/api/v1";
var MongoClient = require('mongodb').MongoClient;
var urlDb="mongodb://pasreqlam:gpi-stats@ds249025.mlab.com:49025/sos1718-13-gpistats";
//Variable APIkey:
var apikey = "sos1718-pasreqlam";


gpistatsApi.register = function(app, db, initialGpiStats) {
    console.log("Registering routes for gpistatsApi. ");
    app.get(BASE_API_PATH + "/gpi-stats/docs", (req, res) => {res.redirect("https://documenter.getpostman.com/view/395479/collection/RVnZhdpa")});
    ////////////////////////////////   LoadInitialData:  /////////////////////////
    app.get(BASE_API_PATH + "/gpi-stats/loadInitialData", (req, res) => {
        console.log(Date() + " - Trying to load 5 stats");
            db.find({}).toArray((err, stats) => {
                if (err) {
                    console.error("Error accesing DB");
                    res.sendStatus(500);
                    return;
                }
                else if (stats.length == 0) {
                    console.log("Empty DB ");
                    db.insert(initialGpiStats);
                    res.sendStatus(201);
                }
                else {
                    console.log("DB has " + stats.length + " stats.");
                    res.sendStatus(200);
                }
            });
    });
    
    //////////////////////////////////////      API REST:         //////////////////////
    
    ////GET TO ALL RESOURCES ////
    app.get(BASE_API_PATH + "/gpi-stats", (req, res) => {
        console.log(Date() + " - GET /gpi-stats");
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);

        ////SEARCH////
        var afrom = Number(req.query.from);
        var ato = Number(req.query.to);
        var country = req.query.country;
        var year = Number(req.query.year);
        var query = "";

        if (afrom && ato && country) {
            db.find({ "year": { "$gte": afrom, "$lte": ato }, "country": country }).skip(offset).limit(limit).toArray((err, results) => {
                if (err) {
                    console.error("Error accesing DB");
                    res.sendStatus(500);
                    return;
                }
                if (results.length == 0) {
                    console.log("Empty DB")
                    res.sendStatus(404);
                    return;
                }
                res.send(results.map((c) => {
                    delete c._id;
                    return c;
                }));
            });

        }
                else {

                    if (country) {
                        db.find({ "country": country}).skip(offset).limit(limit).toArray((err, results) => {
                            if (err) {
                                console.error("Error accesing DB");
                                res.sendStatus(500);
                                return;
                            }
                            if (results.length == 0) {
                                console.log("Empty DB")
                                res.sendStatus(404);
                                return;
                            }
                            res.send(results.map((c) => {
                                delete c._id;
                                return c;
                            }));
                        });

                    }
                    else {


                        if (afrom && ato) {

                            db.find({ "year": { "$gte": afrom, "$lte": ato } }).skip(offset).limit(limit).toArray((err, results) => {
                                if (err) {
                                    console.error("Error accesing DB");
                                    res.sendStatus(500);
                                    return;
                                }
                                if (results.length == 0) {
                                    console.log("Empty DB")
                                    res.sendStatus(404);
                                    return;
                                }
                                res.send(results.map((c) => {
                                    delete c._id;
                                    return c;
                                }));
                            });
                        }
                                else{
                                    if (year) {
                                    db.find({ "year": year }).skip(offset).limit(limit).toArray((err, results) => {
                                        if (err) {
                                            console.error("Error accesing DB");
                                            res.sendStatus(500);
                                            return;
                                        }
                                        if (results.length == 0) {
                                            console.log("Empty DB")
                                            res.sendStatus(404);
                                            return;
                                        }
                                        res.send(results.map((c) => {
                                            delete c._id;
                                            return c;
                                        }));
                                    });

                                }
                                else{
                    
                                    db.find({}).skip(offset).limit(limit).toArray((err, results) => {
                                        if (err) {
                                            console.error("Error accesing DB");
                                            res.sendStatus(500);
                                            return;
                                        }
                                        if (results.length == 0) {
                                            console.log("Empty DB")
                                            res.sendStatus(404);
                                            return;
                                        }
                                        res.send(results.map((c) => {
                                            delete c._id;
                                            return c;
                                        }));
                                    });
                                
                                    }
                                }
                                
                            }
                        }
                    });


    //GET TO SUBGROUP
    app.get(BASE_API_PATH + "/gpi-stats/:country", (req, res) => {
        var country = req.params.country;
        console.log(Date() + " - GET /gpi-stats/" + country);

        db.find({ "country": country }).toArray((err, stats) => {
            if (err) {
                console.log("Error al acceder a la base de datos mongo");
                res.sendStatus(500);
                return;
            }
            if (stats.length == 0){
                console.log("Not found");
                res.sendStatus(404);
                return;
            }
            
            res.send(stats.map((c) => {
                delete c._id;
                return c;
            }));
        });
    });

    //GET TO SUBGROUP
     app.get(BASE_API_PATH + "/gpi-stats/:country/:year", (req, res) => {
        var country = req.params.country;
        var year = Number(req.params.year);
        console.log(Date() + " - GET /gpi-stats/" + country + "/" + year);

        db.find({ "country": country, "year": year }).toArray((err, stats) => {
            if (err) {
                console.log("Error accessing mongoDB");
                res.sendStatus(500);
                return;
            }
             if (stats.length == 0){
                console.log("Not found");
                res.sendStatus(404);
                return;
            }
            
            res.send(stats.map((c) => {
                delete c._id;
                return c;
            }));
        });
    });
    
    
    
////// ENABLED POST //////
    app.post(BASE_API_PATH + "/gpi-stats", (req, res) => {
         console.log(Date() + " - POST / gpi-stats");
         var stat = req.body;
         if (stat.country == null || stat.year == null) {
             console.error("Fields not allowed");
             res.sendStatus(400);
             return;
         }
     
         db.find({ "country": stat.country, "year": stat.year}).toArray((err, stats) => {
             if (err) {
                 console.error("Error accesing mongoDB");
                 process.exit(1);
             }
     
             if (stats.length == 0) {
                 db.insert(stat);
                 console.log("inserted item");
                 res.sendStatus(201);
             }
             else {
                 console.log("the item already exist");
                 res.sendStatus(409);
             }
     
         });
     });
     
    ////// DISABLED PUT /////
    app.put(BASE_API_PATH + "/gpi-stats", (req, res) => {
        console.log(Date() + " - PUT /gpi-stats");
        res.sendStatus(405);
    });
    
    ////// ENABLED DELETE //////

    app.delete(BASE_API_PATH + "/gpi-stats", (req, res) => {
        console.log(Date() + " - DELETE /gpi-stats");

        db.remove({});

        res.sendStatus(200);
    });


    
    app.get(BASE_API_PATH + "/gpi-stats/:country?", (req, res) => {
        var country = req.params.country;
        var query = req.query;
        console.log(Date() + " - GET /gpi-stats/" + country);
            if (req.query.year) {
                query.year = Number(req.query.year);
            }
            if (req.query.score) {
                query.score = Number(req.query.score);
            }
            if (req.query.rank) {
                query.rank = Number(req.query.rank);
            }
            if (req.query.population) {
                query.population = Number(req.query.population);
            }
            
            if(query.year==null){
        db.find({ "country": country}).toArray((err, results) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }

            res.send(results.map((c) => {
                
                            delete c._id;
                            return c;
                
                        }));

        });
            }else{
                db.find({ "country": country,"year":query.year}).toArray((err, results) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }

            res.send(results.map((c) => {
                
                            delete c._id;
                            return c;
                
                        }));
                });
            }
    });
    
    
    //////////// SEARCH GET /////////////
     app.get(BASE_API_PATH + "/country?", (req, res) => {
        MongoClient.connect(urlDb, function(err, db) {
            if (err) throw err;
            var dbo = db.db("sos1718-13-gpistats");
            var query = req.query;
            if (req.query.year) {
                query.year = Number(req.query.year);
            }
            if (req.query.score) {
                query.score = Number(req.query.score);
            }
            if (req.query.rank) {
                query.rank = Number(req.query.rank);
            }
            if (req.query.population) {
                query.population = Number(req.query.population);
            }
            dbo.collection("gpi-stats").find(query).toArray(function(err, result) {
                if (!err && !result.length) {
                    console.log("Not found");
                    res.sendStatus(404);
                }
                else {
                    res.send(result.map((c) => {
                        delete c._id;
                        return c;
                    }));
                }
                db.close();
            });
        });
    });
    
    ///////// METHODS ///////

   app.get(BASE_API_PATH + "/gpi-stats/:country/:year", (req, res) => {
        var country = req.params.country;
        var year = Number(req.params.year);
        console.log(Date() + " - GET /gpi-stats/" + country + "/" + year);

        db.find({ "country": country, "year": year }).toArray((err, stats) => {
            if (err) {
                console.log("Error accesing mongoDB");
                res.sendStatus(500);
                return;
            }
             if (stats.length == 0){
                console.log("Not found");
                res.sendStatus(404);
                return;
            }
            
            res.send(stats.map((c) => {
                delete c._id;
                return c;
            }));
        });
    });

    

    app.delete(BASE_API_PATH + "/gpi-stats/:country", (req, res) => {
        var country = req.params.country;
        console.log(Date() + " - DELETE /gpi-stats/" + country);

        db.remove({ "country": country });

        res.sendStatus(200);
    });

    app.delete(BASE_API_PATH + "/gpi-stats/:country/:year", (req, res) => {
        var country = req.params.country;
        var year = req.params.year;
        console.log(Date() + " - DELETE /gpi-stats/" + country + "/" + year)

        db.remove({ "country": country, "year": year });

        res.sendStatus(200);
    });


    ////////// POST NOT ALLOWED ////////////
    app.post(BASE_API_PATH + "/gpi-stats/:country", (req, res) => {
        var country = req.params.country;
        console.log(Date() + " - POST /gpi-stats/" + country);
        res.sendStatus(405);
    });

    ////////// POST NOT ALLOWED ////////////
    app.post(BASE_API_PATH + "/gpi-stats/:country/:year", (req, res) => {
        var country = req.params.country;
        var year = req.params.year;
        console.log(Date() + " - POST /gpi-stats/" + country + "/" + year);
        res.sendStatus(405);
    });

    //////// PUT NOT ALLOWED ////////////
    app.put(BASE_API_PATH + "/gpi-stats/:country", (req, res) => {
        var country = req.params.country;
        var stat = req.body;
        console.log(Date() + " - PUT /gpi-stats/" + country);

        res.sendStatus(405);
    });

    ////////// PUT NOT ALLOWED /////////
    
     app.put(BASE_API_PATH + "/gpi-stats/:country/:year/", (req, res) => {
        var country = req.params.country;
        var year = req.params.year;
        var stat = req.body;
        var id = stat._id;
        
        console.log(Date() + " - PUT /gpi-stats/" + country + "/" + year);

        if (country != stat.country || year != stat.year) {
            res.sendStatus(400);
            console.warn(Date() + "Invalid fields");
            return;
        }
        db.find({ "country": stat.country, "year": stat.year}).toArray((err, results) => {
            if (err) {
                console.error("Error accesing DB");
                res.sendStatus(500);
                return;
            }

            if (results[0]._id != id) {
                console.error("The ID does not match")
                res.sendStatus(400);
                return;
            }
            else {
                delete stat._id;
                db.update({ "country": stat.country, "year": stat.year}, stat, function(err, numUpdate) {
                    if (err) throw err;
                    console.log("Updated: " + numUpdate);
                });
                res.sendStatus(200);
            }

        });
    });
    
    

    
    app.get(BASE_API_PATH + "/secure/gpi-stats", (req, res) => {
        
        var sourceapikey= req.headers.apikey;
        if (sourceapikey == apikey) {
            MongoClient.connect(urlDb, function(err, db) {
                if (err) throw err;
                var dbo = db.db("sos1718-13-gpistats");
                dbo.collection("gpi-stats").find().toArray(function(err, result) {
                    if (!err && !result.length) {
                        console.log("Not found");
                        res.sendStatus(404);
                    }
                    else {
                        res.send(result.map((c) => {
                            delete c._id;
                            return c;
                        }));
                    }
                    db.close();
                });
            });
        }
        else {
            console.log("Unauthorized");
            res.sendStatus(401);
        }
    });


}
