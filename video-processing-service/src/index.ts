import express from "express";
import { downloadRawVideo, setupDirectories, convertVideo, uploadProcessedVideo, deleteRawVideo, deleteProcessedVideo } from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post('/process-video', async (req, res) => {
   // get bucket and filename from the Cloud Pub/Sub message
   let data;
   try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8'); // https://cloud.google.com/run/docs/tutorials/pubsub#run_pubsub_server-nodejs
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error("Invalid message payload received.");
        }
   } catch (error) {
        console.error(error);
        return res.status(400).send("Bad Request: missing filename.")
   }

   const inputFileName = data.name;
   const outputFileName = `processed-${inputFileName}`;

   // Download the raw video from Cloud Storage
   await downloadRawVideo(inputFileName);

   // Convert the video 
   try {
    convertVideo(inputFileName, outputFileName, 360);
   } catch(err) {
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName) // in case of partial file creation
    ]);
    console.error(err);
    return res.status(500).send("Internal Server Error: video conversion failed.");
   }

   // Upload the processed video to Cloud Storage
   await uploadProcessedVideo(outputFileName);

   await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send("Processing finished successfully!");

});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});