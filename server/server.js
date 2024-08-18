const express=require('express');
const app=express();
const cors=require("cors");

require('dotenv').config({path:'./config.env'})
const PORT=process.env.PORT || 5000;

// Using middlewares
app.use(cors());
app.use(express.json());

// MongoDb
const con=require("./db/connection");
// using Routes
app.use(require('./routes/route'));



app.listen(PORT,()=>{
    console.log(`The server is running on PORT:${PORT}`);
})