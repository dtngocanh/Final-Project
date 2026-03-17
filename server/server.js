import express from "express";
import connectDB from "./config/db.js";
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 4000;

await connectDB();


app.get('/', (req, res) =>res.send("API is working") );

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);   
})

