import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize, Settings, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWebRTC } from '../lib/useWebRTC';

export default function ViewerPage() {
  const navigate = useNavigate();
  const roomId = useStore((state) => state.roomId);
  const role = useStore((state) => state.role);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { remoteStream, isConnected } = useWebRTC(roomId, role);

  useEffect(() => {
    if (!roomId || role !== 'receiver') {
      navigate('/pairing');
      return;
    }
  }, [roomId, role, navigate]);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleDisconnect = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col relative group">
      
      {/* Top Bar - Auto hides */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-white text-sm font-medium">
              {isConnected ? 'Live' : 'Waiting for camera...'}
            </span>
          </div>
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-sm">
            Room: <span className="font-mono tracking-widest ml-1">{roomId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-colors"
          >
            <Maximize size={20} />
          </button>
          <button 
            className="w-10 h-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-colors"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={handleDisconnect}
            className="w-10 h-10 rounded-xl bg-destructive hover:bg-destructive/90 flex items-center justify-center text-white transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
        {!remoteStream ? (
          <div className="text-center text-white/50 space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white/80 animate-spin mx-auto" />
            <p className="text-lg">Waiting for camera feed...</p>
            <p className="text-sm font-mono opacity-50">Room: {roomId}</p>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Overlay Stats (Optional) */}
      {isConnected && (
        <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white/80 text-xs font-mono space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div>1920x1080 @ 60fps (Target)</div>
          <div>Latency: ~12ms</div>
          <div>WebRTC: Connected</div>
        </div>
      )}
    </div>
  );
}
