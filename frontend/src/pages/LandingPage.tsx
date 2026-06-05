import { motion } from 'framer-motion';
import { Camera, MonitorPlay, QrCode, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
      
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Camera size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">StreamLens</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
        </nav>
      </header>

      <main className="container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter"
          >
            Turn Your Phone Into A <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">
              Pro Webcam
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Stream high-quality video with ultra-low latency over your local network. No cables, no internet required. Just scan and stream.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button 
              onClick={() => navigate('/pairing')}
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
            >
              Start Streaming <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-32 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            {
              icon: <QrCode size={24} />,
              title: "Instant Connection",
              desc: "Scan a QR code to instantly pair your phone and PC. No accounts needed."
            },
            {
              icon: <MonitorPlay size={24} />,
              title: "Zero Latency",
              desc: "WebRTC peer-to-peer connection ensures real-time streaming without lag."
            },
            {
              icon: <Camera size={24} />,
              title: "High Quality",
              desc: "Utilize your smartphone's advanced camera sensors for crystal clear video."
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
