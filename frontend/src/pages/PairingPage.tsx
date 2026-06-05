import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Camera, Monitor, ArrowRight, Scan } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function PairingPage() {
  const navigate = useNavigate();
  const setRoomId = useStore((state) => state.setRoomId);
  const setRole = useStore((state) => state.setRole);
  
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Generate a random 6-character room code for the viewer
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(code);
  }, []);

  const handleStartViewer = () => {
    setRoomId(generatedCode);
    setRole('receiver');
    navigate('/viewer');
  };

  const handleStartCamera = (codeToJoin: string) => {
    if (!codeToJoin) return;
    setRoomId(codeToJoin.toUpperCase());
    setRole('sender');
    navigate('/camera');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        
        {/* Receiver/Viewer Side */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
            <Monitor size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Receive Video</h2>
          <p className="text-muted-foreground mb-8">Use this device as the monitor. Scan the QR code with your phone to connect.</p>
          
          <div className="bg-white p-4 rounded-2xl mb-6">
            <QRCodeSVG 
              value={`${window.location.origin}/pairing?code=${generatedCode}`} 
              size={200}
              level="H"
            />
          </div>
          
          <div className="text-sm font-medium text-muted-foreground mb-2">Or enter this code on your phone:</div>
          <div className="text-3xl font-mono font-bold tracking-widest mb-8">{generatedCode}</div>
          
          <button 
            onClick={handleStartViewer}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Start Viewer
          </button>
        </motion.div>

        {/* Sender/Camera Side */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-secondary text-foreground rounded-2xl flex items-center justify-center mb-6">
            <Camera size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Send Video</h2>
          <p className="text-muted-foreground mb-8">Use this device as the webcam. Enter the code shown on your monitor.</p>
          
          <div className="w-full space-y-4 mb-8 flex-1 flex flex-col justify-center">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter 6-digit code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={6}
                className="w-full bg-secondary border border-border rounded-xl px-6 py-4 text-center text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <button 
            onClick={() => handleStartCamera(joinCode)}
            disabled={joinCode.length < 6}
            className="w-full py-4 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Connect Camera <ArrowRight size={18} />
          </button>

          <button className="w-full mt-4 py-4 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2">
            <Scan size={18} /> Scan QR Instead
          </button>
        </motion.div>

      </div>
    </div>
  );
}
