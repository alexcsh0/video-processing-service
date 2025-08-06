import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = process.env.RAW_VIDEOS_BUCKET || "alexcsh-yt-raw-videos";
const processedVideoBucketName = process.env.PROCESSED_VIDEOS_BUCKET || "alexcsh-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
   ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
    
        const scaleFilter = `scale=trunc(oh*a/2)*2:360`; // convert to 360p for now
        const inputPath = `${localRawVideoPath}/${rawVideoName}`;
        const outputPath = `${localProcessedVideoPath}/${processedVideoName}`

        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", scaleFilter) // convert to 360p
        .on("start", (commandLine: string) => {
            console.log(`FFmpeg process started with command: ${commandLine}`);
        })
        .on("end", function() { 
            console.log("Processing finished successfully.");
            resolve();
        })
        .on("error", function(err: any) {
            console.log(`An error occurred: ${err.message}`);
            reject(err);
        })
        .save(outputPath); // not adding a return because of this
    });
}

/**
 * @param fileName - The name of the file to download from the {@link rawVideoBucketName} bucket
 * into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}`});

    const rawFilePath = `${localRawVideoPath}/${fileName}`;
    const rawFileSize = fs.statSync(rawFilePath).size;
    console.log(`Raw video size for ${fileName}: ${rawFileSize} bytes`);

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
    );
}

/**
 * @param fileName - The name of the file to upload from the {@link localProcessedVideoPath} folder
 * to the {@link processedVideoBucketName} bucket.
 * @returns A promise that resolves when the file has been uploaded.
 */

export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    const processedFilePath = `${localProcessedVideoPath}/${fileName}`;
    const processedFileSize = fs.statSync(processedFilePath).size;
    console.log(`Processed video size for ${fileName}: ${processedFileSize} bytes`);

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    // make file public to allow access
    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string) {
    return new Promise<void>((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        } else {
            console.log(`File not found at ${filePath}`);
            resolve();
        }
    });
}

/** 
 * Ensures a directory exists, creating it if it doesn't.
 * @param {string} dirPath - The path to check
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    } else {
        console.log(`Directory already exists at ${dirPath}`);
    }
}