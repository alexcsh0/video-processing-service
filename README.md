# YouTube Clone

A full-stack YouTube clone built with Next.js, Firebase, and Google Cloud Platform.

## Project Structure

- `yt-web-client/` - Frontend Next.js application
- `yt-api-service/` - Firebase Functions for API endpoints
- `video-processing-service/` - Node.js service for video processing
- `utils/` - Utility files and configurations

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd youtube-clone
```

### 2. Frontend Setup (yt-web-client)
```bash
cd yt-web-client
npm install
```

Copy the environment template and fill in your values:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:
- Get your Firebase config from the Firebase Console
- Replace the placeholder values with your actual Firebase project details

### 3. API Service Setup (yt-api-service)
```bash
cd yt-api-service/functions
npm install
```

Configure Firebase CLI and deploy:
```bash
firebase login
firebase init
firebase deploy --only functions
```

### 4. Video Processing Service Setup
```bash
cd video-processing-service
npm install
```

Set environment variables for production deployment:
- `RAW_VIDEOS_BUCKET` - Your raw videos bucket name
- `PROCESSED_VIDEOS_BUCKET` - Your processed videos bucket name

### 5. Google Cloud Setup
- Create a Firebase project
- Enable Authentication (Google provider)
- Create Firestore database
- Create Google Cloud Storage buckets for raw and processed videos
- Set up appropriate IAM permissions

## Environment Variables

### Frontend (yt-web-client/.env.local)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_PROCESSED_VIDEOS_BUCKET`

### Backend Services
- `RAW_VIDEOS_BUCKET`
- `PROCESSED_VIDEOS_BUCKET`

## Features

- User authentication with Google
- Video upload and processing
- Video streaming and playback
- Responsive web interface
- Scalable microservices architecture

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Firebase Functions, Node.js, Express
- **Database**: Firestore
- **Storage**: Google Cloud Storage
- **Video Processing**: FFmpeg
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (frontend), Google Cloud Run (video processing)

## Security Notice

This project uses environment variables to store sensitive configuration. Never commit `.env.local` files to version control. Always use the provided `.env.example` as a template.