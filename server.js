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


app.post('/postmessage',(request,response)=>{
    var postTopic = request.body.Topic;
    var postData = request.body.Data;
    const time = new Date();
    var finalTime = time.toLocaleString('en-US',{
		timeZone: 'America/Regina',
    	hours12: false,
    	year: 'numeric',
    	month: '2-digit',
    	day: '2-digit',
    	hour: '2-digit',
    	minute: '2-digit',
    	second: '2-digit'});
    db.query(`INSERT INTO posts (topic,data,datetime) VALUES (?, ?, ?)`,
              [postTopic,postData,finalTime], (error, result)=>{
                if(error){
                    console.log("Error while adding post to posts table : ", error);
                }
                else{
                    response.status(200).json({ success: true, id: result.insertId });
                }
              });
});

app.post('/postresponse',(request,response)=>{
    var mainPost = request.body.postId;
    var responseData = request.body.Data;
    const time = new Date();
    var finalTime = time.toLocaleString('en-US',{
		timeZone: 'America/Regina',
    	hours12: false,
    	year: 'numeric',
    	month: '2-digit',
    	day: '2-digit',
    	hour: '2-digit',
    	minute: '2-digit',
    	second: '2-digit'});

    db.query(`SELECT * FROM posts WHERE id=?`,[mainPost],(error, postId_result)=>{
        if (error){
            console.log("Error during retrieving post id for uploading response");
            return;
        }
        else{
            if (postId_result.length===0){
                console.log("post id doesn't exists");
                return;
            }
            else{
                db.query(`INSERT INTO responses (postId,data,datetime) VALUES (?, ?, ?)`,
                [mainPost,responseData,finalTime], (error, result)=>{
                  if(error){
                      console.log("Error while adding response to responses table : ", error);
                  }
                  else{
                      response.status(200).json({ success: true, id: result.insertId });
                  }
                });
            }
           
        }
    });

});


app.get('/alldata',(request,response)=>{
    db.query(`SELECT * FROM posts`, (error, post_result)=>{
                if(error){
                    console.log("Error while fetching all posts from posts table : ", error);
                    return;
                }
                else{
                    db.query(`SELECT * FROM responses`, (error, response_result)=>{
                        if(error){
                            console.log("Error while fetching all responses from responses table : ", error);
                            return;
                        }
                        else{
                            const allPosts = [];
                            post_result.forEach(post=>{
                                curr_post = {
                                    post_id: post.id,
                                    post_topic: post.topic,
                                    post_data: post.data,
                                    post_time: post.datetime,
                                    post_response: [],
                                }
                                response_result.forEach(response=>{
                                    if(response.postId == post.id){
                                        curr_response = {
                                            res_data: response.data,
                                            res_time: response.datetime
                                        }
                                        curr_post.post_response.push(curr_response);
                                    }
                                })
                                allPosts.push(curr_post);
                            })
                            response.status(200).json(allPosts);
                        }
                    })
                }    
    });
});