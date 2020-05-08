var express = require("express");
var app = express();
var port = 3000;
app.set('port',(process.env.port || port));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var bcrypt=require('bcryptjs');

var cookieParser=require('cookie-parser');
app.use(cookieParser());

var loginId;

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://shubha:shubham1994@ds155582.mlab.com:55582/cubereum");
var userSchema = new mongoose.Schema({
    name: String,
    DOB: String,
    email: String,
    password:String,
    phone: String
});

var User = mongoose.model("User", userSchema);

var contentSchema = new mongoose.Schema({
    title: String,
    cont: String,
    id: String
});
var content = mongoose.model("Content", contentSchema);

var exphbs = require('express-handlebars');
 
app.engine('handlebars', exphbs({defaultLayout: 'base'}));
app.set('view engine', 'handlebars');

app.get("/", (req, res) => {
    content.find({
    }, function(err, con) {
        if(con)
        {
    res.render('home', {
        //content: polls 
        content: con
    });
}
});
    // res.sendFile(__dirname + "/views/home.html");
});

app.get("/signup", (req, res) => {
    
    res.sendFile(__dirname + "/views/signup.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});

app.post("/",(req,res)=>{
    var ids=req.body.id;
    content.find({
        '_id': ids

     }, function(err, con) {
         if(con)
         {
            content.updateOne({_id : ids},
                {title : req.body.title,
                    cont: req.body.content,
                    id : loginId
            }).then(item=>{
                console.log("Content Updated");
                res.redirect('/?lo='+loginId);
            })
            .catch(function(error,affected,resp){
                console.log(error);
            });             
         }
         else
         {
            var myData = new content({
                title:req.body.title,
                cont:req.body.content,
                id:loginId
            });
            myData.save()
        .then(item=>{
            console.log("Content Added");
            res.redirect('/?lo='+loginId);
        });
         }
    });
    
});

app.post("/signup", (req, res) => {
    var myData = new User({
        name:req.body.name,
        DOB:req.body.DOB,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password,10),
        phone:req.body.phone
    });
    myData.save()
        .then(item => {
            console.log("Data Inserted");
            res.send("You've successfully signed up. <a href="+"/"+">Click Here</a>");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.post("/login", (req, res) => {
        var email=req.body.email;
        // console.log(email+"=email password="+password);
        User.find({
            'email': email

         }, function(err, user) {
             if(user)
             {
                 try{
                //  console.log(user[0].password)
                 if(bcrypt.compareSync(req.body.password,user[0].password))
                 {
                     loginId=user[0]._id;
                        console.log("Success");
                        res.redirect('/?lo='+loginId);
                 }
                 else{
                    console.log("wrong data");
                    res.send("Something went wrong <a href="+"/"+">Click Here</a>");
                 }
                }
                catch(err)
                {
                    console.log("wrong data");
                    res.send("Something went wrong <a href="+"/"+">Click Here</a>");
                }
                //console.log(user);
             }
        });
    });

app.listen(port, () => {
    console.log("Server listening on port " + port);
});