const mongoose=require('mongoose');

const conn=mongoose.connect(process.env.MONGO_URI)
.then(db=>{
    console.log("Database is now Connected");
    return db;

}).catch(err=>{console.log("Connection with Db Failed")})   



module.exports=conn;