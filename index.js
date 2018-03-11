var express = require("express");
var path = require("path"); 

var app = express();
var port = (process.env.PORT || 1607);

app.use("/",express.static(path.join(__dirname+"/public")));


app.get("/hello",(req,res)=>{
    res.send("Hello World");
});


app.listen(port,()=>{
    console.log("Server ready on port "+port+ "!");
}).on("error",(e)=>{
     console.log("Server NOT ready: "+e+"!");   
});
