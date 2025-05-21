import express from "express";
import ffmpeg from "fluent-ffmpeg"; 

const app = express();
app.use(express.json());

app.post('/process-video', (req, res) => {
    // get path of input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    console.log(`Input file path: ${inputFilePath}`);
    if (!inputFilePath) {
        return res.status(400).send("Bad Request: Missing input file path");
    }
    if (!outputFilePath) {
        return res.status(400).send("Bad Request: Missing output file path");
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=trunc(oh*a/2)*2:360") // convert to 360p
        .on("start", (commandLine: string) => {
            console.log(`FFmpeg process started with command: ${commandLine}`);
        })
        .on("end", function() { 
            console.log("Processing finished successfully.");
            res.status(200).send("Processing finished successfully.");
        })
        .on("error", function(err: any) {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        .save(outputFilePath); // not adding a return because of this
    
    return;
});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});