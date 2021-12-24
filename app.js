const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");
var path = require('path');
const bp = require('body-parser');
const bcrypt = require("bcryptjs");


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

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

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

//--------- routes
app.get('/',(req,res)=>{
    res.render('firstpage');
})

app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/signUp',(req,res)=>{
    res.render('signUp');
})
app.get('/game',(req,res)=>{
    res.render('game');
})
app.get('/contactdev',(req,res)=>{
    res.render('contactdev');
})
app.get('/recoverPassword',(req,res)=>{
    res.render('recoverPassword');
})
app.get('/toAdd',(req,res)=>{
    res.render('toAdd');
})

//--------- routes ^

//----------postes V
app.post('/login',(req,res)=>{
    
    console.log(req.body);

    //getting the info from html
    const username = req.body.myusername;
    const name = req.body.name;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const service = req.body.service;
    const genders = req.body.gender;

    //is there already this username
    db.query('SELECT userName FROM users WHERE userName = ?',[username],async (error,results)=>{
        if(error){
            console.log(error);
        }
        if(results.length >0){
            
            console.log('that username is already in use');
            return;
            //help dosent work V
            /*return res.render('signup',{
                messege:'that username is already in use'
            })*/
        }
        //is the password confirm is right
        else if(password !== passwordConfirm)
        {
            console.log('password dosent match');
            return;
            //help dosent work V
            /*
            return res.render('signup',{
                message: 'Password do not match'
            })
            */
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password,8);
        console.log(hashedPassword);
        //insert into db
        /*
        db.query('INSERT INTO users SET ?',
        {userName : username , Name : name , password : hashedPassword , gender : genders ,service: service },(error,results)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log(results);
            }
        })
        */


    })

    res.render('login');

})

//-get into game
app.post('/game',(req,res)=>{
    
    const username = req.body.myusername;
    const password = req.body.password;
    console.log(username);
    console.log(password);
    db.query('SELECT userName FROM users WHERE userName = ?',[username],async(error,results)=>{
        if(error){
            console.log(error);
        }
        if(results.length >0){
            console.log('no username like this');
            return;
        }
    }
    )
    res.render('game');
})
//----------postes ^

//local host - 3000
app.listen(3000,()=>{
    console.log("server started on port 3000");
})