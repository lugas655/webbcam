import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, X, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWebRTC } from '../lib/useWebRTC';

export default function CameraPage() {
  const navigate = useNavigate();
  const roomId = useStore((state) => state.roomId);
  const role = useStore((state) => state.role);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState('');

  const { startLocalStream, stopLocalStream, isConnected } = useWebRTC(roomId, role);

  useEffect(() => {
    if (!roomId || role !== 'sender') {
      navigate('/pairing');
      return;
    }

    const initCamera = async () => {
      try {
        const stream = await startLocalStream({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Could not access camera. Please check permissions.');
      }
    };

    initCamera();

    return () => {
      stopLocalStream();
    };
  }, [facingMode, roomId, role, navigate]);

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleDisconnect = () => {
    stopLocalStream();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Video Preview */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-white text-sm font-medium">
            {isConnected ? 'Connected' : 'Waiting for connection...'}
          </span>
        </div>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <span className="text-white text-sm font-mono tracking-widest">{roomId}</span>
        </div>
      </div>

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground px-6 py-4 rounded-xl z-20 shadow-xl">
          {error}
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/80 to-transparent z-10">
        <button 
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all"
        >
          <Zap size={24} />
        </button>
        
        <button 
          onClick={handleDisconnect}
          className="w-20 h-20 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <X size={32} />
        </button>

        <button 
          onClick={handleSwitchCamera}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all"
        >
          <RefreshCw size={24} />
        </button>
      </div>
    </div>
  );
}
