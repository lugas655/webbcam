import { useEffect, useRef, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from './socket';

export function useWebRTC(roomId: string | null, role: 'sender' | 'receiver' | null) {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomId || !role) return;

    connectSocket();

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (role === 'receiver') {
        setRemoteStream(event.streams[0]);
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      setIsConnected(peerConnection.current?.connectionState === 'connected');
    };

    socket.emit('join-room', roomId, role);

    socket.on('receiver-joined', async (receiverId: string) => {
      if (role === 'sender' && peerConnection.current) {
        // Create Offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('offer', { target: roomId, offer });
      }
    });

    socket.on('offer', async (payload: { caller: string; offer: RTCSessionDescriptionInit }) => {
      if (role === 'receiver' && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answer', { target: roomId, answer });
      }
    });

    socket.on('answer', async (payload: { caller: string; answer: RTCSessionDescriptionInit }) => {
      if (role === 'sender' && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
      }
    });

    socket.on('ice-candidate', async (payload: { caller: string; candidate: RTCIceCandidateInit }) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
          console.error('Error adding ice candidate', e);
        }
      }
    });

    return () => {
      socket.off('receiver-joined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      peerConnection.current?.close();
      disconnectSocket();
    };
  }, [roomId, role]);

  const startLocalStream = async (constraints?: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints || { video: true, audio: false });
      localStream.current = stream;
      if (peerConnection.current) {
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });
      }
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
