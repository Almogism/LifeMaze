const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");
var path = require('path');

dotenv.config({path: './.env'});

const app = express();
//create conection to the data base (db)
const db = mysql.createConnection({
    host : process.env.host,
    user: process.env.user,
    password : process.env.password,
    database : process.env.database
});

const publicDirectory = path.join(__dirname,'./public');
console.log(publicDirectory);
app.use(express.static(publicDirectory));
app.set('view engine', 'hbs');

//connect 
db.connect((error)=>{
    if(error){
        console.log(error);
    }
    else{
        console.log("mysql connected :)");
    }
})


/*
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
*/
/*
app.use(express.static(__dirname + '/public'));
*/
//app.use(express.urlencoded({extended: false}));

//app.use(express.json());




app.get('/',(req,res)=>{
    res.render('firstpage');
})

app.get('/login',(req,res)=>{
    res.render('login');
})
//local host - 3000
app.listen(3000,()=>{
    console.log("server started on port 3000");
})