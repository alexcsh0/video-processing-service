import express from "express";
import { downloadRawVideo, setupDirectories, convertVideo, uploadProcessedVideo, deleteRawVideo, deleteProcessedVideo } from "./storage";
import { isVideoNew, setVideo } from "./firestore";
import * as admin from 'firebase-admin';

setupDirectories();

const app = express();
app.use(express.json());

const firestore = admin.firestore();

app.post('/process-video', async (req, res) => {
   const startTime = Date.now(); // Start time for processing

   // get bucket and filename from the Cloud Pub/Sub message
  try {
    const rawMessage = req.body?.message?.data;
    if (!rawMessage) {
      console.warn("Message data is missing in the request body.");
      return res.status(400).send("Bad Request: missing message data.");
    }

    const message = Buffer.from(rawMessage, 'base64').toString('utf-8');
    const data = JSON.parse(message);

    if (!data.name) {
      console.warn("File name is missing in the message payload.");
      return res.status(400).send("Bad Request: missing filename.");
    }

    const inputFileName = data.name.split('/').pop(); // get the file name from the full path
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0]; 

    if (!isVideoNew(videoId)) {
      return res.status(400).send("Bad Request: video is already being processed.");
    } else {
      await setVideo(videoId, {
        id: videoId,
        uid: videoId.split('-')[0], 
        status: 'processing'
      })
    }
    
    // Download the raw video from Cloud Storage
    try {
      await downloadRawVideo(inputFileName);
    } catch (err: any) {
      const isFileMissing = err.code === 404 || err.message.includes("No such object");
      if (isFileMissing) {
        console.warn(`File not found: ${inputFileName}. Skipping.`);
        return res.status(200).send("File not found. Skipping.");
      }
      console.error("Unexpected error while downloading file:", err);
      return res.status(500).send("Error downloading video.");
    }

    // Convert the video 
    let rawFileSize, processedFileSize;
    try {
      await convertVideo(inputFileName, outputFileName);
      // Implement getFileSize if needed to retrieve file sizes
      rawFileSize = 0; // Placeholder for raw file size
      processedFileSize = 0; // Placeholder for processed file size
    } catch(err) {
      console.error(err);
      await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName) // in case of partial file creation
      ]);
      return res.status(500).send("Internal Server Error: video conversion failed.");
    }

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    await setVideo(videoId, {
      status: 'processed',
      filename: outputFileName,
    })

    const endTime = Date.now(); // End time
    const processingTime = endTime - startTime;
    console.log(`Processing time for video ${videoId}: ${processingTime}ms`);
    console.log(`Video processed successfully: ${videoId}`);

    await firestore.collection('metrics').add({
      videoId,
      rawFileSize,
      processedFileSize,
      processingTime,
      status: 'success',
      timestamp: new Date(),
    });

    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send("Processing finished successfully!");
  } catch (err) {
    console.error("Error processing video:", err);
    return res.status(500).send("Uexpected server error!");
  }
});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
});