# StreamLens - Smartphone as Webcam via Local Network

StreamLens is a modern, high-performance web application that allows you to use your smartphone (Android/iPhone) as a high-quality webcam for your PC or laptop over a local network.

Built with React 19, Vite, Tailwind CSS v4, WebRTC, and Socket.IO.

## Features

- **Real-time Video Streaming**: Ultra-low latency streaming using WebRTC peer-to-peer connections.
- **Local Network Only**: No internet connection required once the app is loaded, ensuring maximum privacy and speed.
- **QR Code Pairing**: Instantly connect your phone to your PC by scanning a QR code.
- **Modern UI**: Built with Tailwind CSS v4, Framer Motion, and shadcn/ui inspired design for a premium SaaS feel.
- **Camera Controls**: Switch between front and back cameras, full-screen viewing, and real-time connection status.

## Technology Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: Zustand
- **Routing**: React Router v7
- **Icons**: Lucide React
- **WebRTC**: Native `RTCPeerConnection` and `MediaDevices API`

### Backend
- **Runtime**: Node.js LTS, Express.js
- **Signaling**: Socket.IO for WebRTC offer/answer/ice-candidate exchange
- **Database**: PostgreSQL (with Prisma ORM)

### Deployment
- **Docker**: Containerized backend and database via `docker-compose`.

## Getting Started

### Prerequisites
- Node.js (v20 or higher recommended)
- Docker and Docker Compose (optional, for DB/Backend deployment)

### 1. Start the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `../.env.example` to `../.env` or create a `.env` file in the backend directory.
4. Generate Prisma Client (if database is running):
   ```bash
   npx prisma generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Start the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Note: Vite is configured to host on `0.0.0.0` so it can be accessed from other devices on your network.*

### 3. Usage

1. Open the frontend in your laptop's browser (e.g., `http://localhost:5173`).
2. Click **Start Streaming** to go to the pairing page.
3. On the laptop, click **Start Viewer**. A 6-digit room code will be generated.
4. On your smartphone, connect to the same WiFi network and open the app using your laptop's local IP address (e.g., `http://192.168.1.100:5173`).
5. On the phone, enter the 6-digit code and click **Connect Camera**.
6. Accept camera permissions. Video should start streaming instantly to your laptop!

## Architecture

- **Clean Architecture**: Separation of concerns between pages, lib (WebRTC, socket), and global state (Zustand).
- **WebRTC Signaling**: The Node.js backend solely acts as a signaling server. Once the connection is established, video data flows directly peer-to-peer between the phone and the PC without going through the server.

## Future Enhancements
- AI Features: Face Detection & Object Tracking (MediaPipe)
- Recording: Stream recording and MP4 download
- Authentication: Secure rooms with Better Auth
