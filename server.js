const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

const db = mysql.createPool({
    host: 'mysql-image',
    user: 'root',
    password: 'abcdefgh'
})

db.getConnection((err,connection)=>{
    if (err){
        console.log("Error connecting to mysql: ",err);
        process.exit(1);
    }
    else{
        console.log("Connected Successfully to MYSQL");
    }

    connection.query(`CREATE DATABASE IF NOT EXISTS postForum`, error=>{
        if(error){
            console.log("Error while creating database postForum: ", error);
        }
        else{
            console.log("Successfully created postForum database");
        }
    });

    connection.query(`USE postForum`, error=>{
        if(error){
            console.log("Error while using database postForum: ", error);
        }
        else{
            console.log("Successfully accessed postForum database");
        }
    });

    connection.query(`CREATE TABLE IF NOT EXISTS posts
                     ( id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                       topic VARCHAR(200) NOT NULL,
                       data VARCHAR(1000) NOT NULL,
                       datetime DATETIME NOT NULL )`, error =>{
                            connection.release();
                            if(error){
                                console.log("Error while creating posts table : ", error);
                            }
                            else{
                                console.log("Successfully created posts table");
                            }
    });

    connection.query(`CREATE TABLE IF NOT EXISTS responses
                     ( id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                       postId INT NOT NULL,
                       data VARCHAR(1000) NOT NULL,
                       datetime DATETIME NOT NULL )`, error =>{
                            connection.release();
                            if(error){
                                console.log("Error while creating responses table : ", error);
                            }
                            else{
                                console.log("Successfully created responses table");
                            }
    });

});