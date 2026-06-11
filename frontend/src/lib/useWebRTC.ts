import { useEffect, useRef, useState } from 'react';
import { socket, connectSocket } from './socket';

export function useWebRTC(roomId: string | null, role: 'sender' | 'receiver' | null) {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const iceQueues = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const createPeerConnection = (targetSocketId: string) => {
    // Clean up existing connection to target if any
    if (peerConnections.current.has(targetSocketId)) {
      peerConnections.current.get(targetSocketId)?.close();
      peerConnections.current.delete(targetSocketId);
      iceQueues.current.delete(targetSocketId);
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnections.current.set(targetSocketId, pc);
    iceQueues.current.set(targetSocketId, []);

    pc.onicecandidate = (event) => {
      if (event.candidate && targetSocketId) {
        socket.emit('ice-candidate', {
          target: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (role === 'receiver') {
        setRemoteStream(event.streams[0]);
      }
    };

    const updateConnectionState = () => {
      console.log(`Connection state for ${targetSocketId}:`, pc.connectionState);
      let anyConnected = false;
      peerConnections.current.forEach((conn) => {
        if (conn.connectionState === 'connected') {
          anyConnected = true;
        }
      });
      setIsConnected(anyConnected);
    };

    pc.onconnectionstatechange = updateConnectionState;
    pc.oniceconnectionstatechange = updateConnectionState;

    pc.onnegotiationneeded = async () => {
      try {
        if (role === 'sender') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: targetSocketId, offer });
        }
      } catch (err) {
        console.error('Error during negotiation:', err);
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });
    }

    return pc;
  };

  useEffect(() => {
    if (!roomId || !role) return;

    connectSocket();

    socket.emit('join-room', roomId, role);

    socket.on('receiver-joined', (receiverId: string) => {
      if (role === 'sender') {
        console.log('Receiver joined:', receiverId);
        createPeerConnection(receiverId);
      }
    });

    socket.on('sender-joined', (senderId: string) => {
      if (role === 'receiver') {
        console.log('Sender joined:', senderId);
      }
    });

    socket.on('offer', async (payload: { caller: string; offer: RTCSessionDescriptionInit }) => {
      if (role === 'receiver') {
        console.log('Received offer from:', payload.caller);
        let pc = peerConnections.current.get(payload.caller);
        if (!pc) {
          pc = createPeerConnection(payload.caller);
        }
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        
        // Process queued ICE candidates for this caller
        const queue = iceQueues.current.get(payload.caller) || [];
        while (queue.length > 0) {
          const candidate = queue.shift();
          if (candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding queued ICE candidate', e);
            }
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: payload.caller, answer });
      }
    });

    socket.on('answer', async (payload: { caller: string; answer: RTCSessionDescriptionInit }) => {
      if (role === 'sender') {
        console.log('Received answer from:', payload.caller);
        const pc = peerConnections.current.get(payload.caller);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          
          // Process queued ICE candidates for this receiver
          const queue = iceQueues.current.get(payload.caller) || [];
          while (queue.length > 0) {
            const candidate = queue.shift();
            if (candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error('Error adding queued ICE candidate', e);
              }
            }
          }
        }
      }
    });

    socket.on('ice-candidate', async (payload: { caller: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(payload.caller);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      } else {
        let queue = iceQueues.current.get(payload.caller);
        if (!queue) {
          queue = [];
          iceQueues.current.set(payload.caller, queue);
        }
        queue.push(payload.candidate);
      }
    });

    socket.on('receiver-left', (receiverId: string) => {
      console.log('Receiver left:', receiverId);
      const pc = peerConnections.current.get(receiverId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(receiverId);
        iceQueues.current.delete(receiverId);
      }
      let anyConnected = false;
      peerConnections.current.forEach((conn) => {
        if (conn.connectionState === 'connected') {
          anyConnected = true;
        }
      });
      setIsConnected(anyConnected);
    });

    socket.on('sender-left', (senderId: string) => {
      console.log('Sender left:', senderId);
      const pc = peerConnections.current.get(senderId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(senderId);
        iceQueues.current.delete(senderId);
      }
      setRemoteStream(null);
      setIsConnected(false);
    });

    return () => {
      socket.off('receiver-joined');
      socket.off('sender-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('receiver-left');
      socket.off('sender-left');
      
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      iceQueues.current.clear();
      
      socket.emit('leave-room', roomId, role);
    };
  }, [roomId, role]);

  const startLocalStream = async (constraints?: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints || { video: true, audio: false });
      localStream.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      // Replace tracks for existing peer connections if we are switching cameras
      peerConnections.current.forEach((pc) => {
        pc.getSenders().forEach((sender) => {
          if (sender.track?.kind === 'video' && videoTrack) {
            sender.replaceTrack(videoTrack).catch((err) => console.error('Error replacing video track:', err));
          } else if (sender.track?.kind === 'audio' && audioTrack) {
            sender.replaceTrack(audioTrack).catch((err) => console.error('Error replacing audio track:', err));
          }
        });
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      throw error;
    }
  };

  const stopLocalStream = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
  };

  return {
    startLocalStream,
    stopLocalStream,
    remoteStream,
    isConnected,
  };
}
