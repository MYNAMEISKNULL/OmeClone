import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { WSMessage, WSServerMessage } from '@shared/schema';

// Configuration
const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export type ChatState = 'idle' | 'waiting' | 'connected';

interface UseWebRTC {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  chatState: ChatState;
  messages: { id: string; text: string; isLocal: boolean; timestamp: Date }[];
  startChat: () => void;
  nextPartner: () => void;
  stopChat: () => void;
  sendMessage: (text: string) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  partnerMediaStatus: { audio: boolean; video: boolean };
  onlineCount: number;
  error: string | null;
}

export function useWebRTC(): UseWebRTC {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [messages, setMessages] = useState<{ id: string; text: string; isLocal: boolean; timestamp: Date }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [partnerMediaStatus, setPartnerMediaStatus] = useState({ audio: true, video: true });
  const [onlineCount, setOnlineCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const { toast } = useToast();

  // Initialize Local Media
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to access media devices:', err);
        setError('Could not access camera or microphone. Please check permissions.');
        toast({
          title: "Media Error",
          description: "Could not access camera/microphone. Please check permissions.",
          variant: "destructive"
        });
      }
    }
    initMedia();

    return () => {
      // Cleanup tracks on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WS Connected');
    };

    socket.onmessage = async (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);
        handleSignalingMessage(msg);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    socket.onclose = () => {
      console.log('WS Disconnected');
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [localStream]); // Re-bind if localStream changes (needed for addTrack)

  // WebRTC & Signaling Logic
  const createPeerConnection = () => {
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'candidate', candidate: event.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        toast({
          title: "Connection Lost",
          description: "Trying to reconnect...",
          variant: "destructive"
        });
        nextPartner();
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    return pc;
  };

  const sendWS = (msg: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  };

  const sendSignal = (data: any) => {
    sendWS({ type: 'signal', data });
  };

  const handleSignalingMessage = async (msg: WSServerMessage) => {
    switch (msg.type) {
      case 'waiting':
        setChatState('waiting');
        setRemoteStream(null);
        setMessages([]);
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        break;

      case 'matched':
        setChatState('connected');
        setMessages([]); // Clear chat for new partner
        const pc = createPeerConnection();
        if (msg.initiator) {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal({ type: 'offer', sdp: offer });
          } catch (err) {
            console.error('Error creating offer:', err);
          }
        }
        break;

      case 'partner_disconnected':
        toast({ title: "Partner disconnected", description: "Finding new partner..." });
        setChatState('waiting');
        setRemoteStream(null);
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        // Auto-search again
        sendWS({ type: 'next' });
        break;

      case 'online_count':
        setOnlineCount(msg.count);
        break;

      case 'signal':
        if (!pcRef.current) return;
        const data = msg.data;

        if (data.type === 'media_status') {
          setPartnerMediaStatus(data.status);
          return;
        }

        if (data.type === 'offer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          sendSignal({ type: 'answer', sdp: answer });
        } else if (data.type === 'answer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        } else if (data.type === 'candidate') {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;

      case 'message':
        setMessages(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          text: msg.content, 
          isLocal: false,
          timestamp: new Date()
        }]);
        break;
    }
  };

  // Actions
  const startChat = useCallback(() => {
    if (!localStream) {
      setError("Please allow camera/mic access to start.");
      return;
    }
    setChatState('waiting');
    sendWS({ type: 'join' });
  }, [localStream]);

  const nextPartner = useCallback(() => {
    setRemoteStream(null);
    setChatState('waiting');
    setMessages([]);
    if (pcRef.current) {
      pcRef.current.getSenders().forEach(sender => {
        if (pcRef.current) pcRef.current.removeTrack(sender);
      });
      pcRef.current.close();
      pcRef.current = null;
    }
    sendWS({ type: 'next' });
  }, []);

  const stopChat = useCallback(() => {
    setChatState('idle');
    setRemoteStream(null);
    setMessages([]);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    sendWS({ type: 'leave' });
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || chatState !== 'connected') return;
    sendWS({ type: 'message', content: text });
    setMessages(prev => [...prev, { 
      id: Math.random().toString(36).substr(2, 9), 
      text, 
      isLocal: true,
      timestamp: new Date()
    }]);
  }, [chatState]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        sendSignal({ 
          type: 'media_status', 
          status: { audio: audioTrack.enabled, video: isVideoEnabled } 
        });
      }
    }
  }, [localStream, isVideoEnabled]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        sendSignal({ 
          type: 'media_status', 
          status: { audio: isAudioEnabled, video: videoTrack.enabled } 
        });
      }
    }
  }, [localStream, isAudioEnabled]);

  return {
    localStream,
    remoteStream,
    chatState,
    messages,
    startChat,
    nextPartner,
    stopChat,
    sendMessage,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    partnerMediaStatus,
    onlineCount,
    error
  };
}
