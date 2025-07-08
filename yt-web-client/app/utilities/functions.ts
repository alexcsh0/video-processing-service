import {getFunctions, httpsCallable} from 'firebase/functions';

const functions = getFunctions();

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl'); 

export async function uploadVideo(file: File) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await generateUploadUrl({
        fileExtension: file.name.split('.').pop()
    });

    //upload the file via the signed URL
    await fetch(response?.data?.url, {
        method: 'PUT', 
        body: file,
        headers: {
            'Content-Type': file.type
        }
    });

    return;
}