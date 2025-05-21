import express from "express";
import ffmpeg from "fluent-ffmpeg"; 
import path from "path";
import { setupDirectories } from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post('/process-video', (req, res) => {
   
});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});