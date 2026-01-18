import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { WSMessage, WSServerMessage } from '@shared/schema';

// Configuration
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: '64fe1e1cd3237abf0a475345',
      credential: '9lAiV9099iIYi9J5',
    },
    {
      urls: 'turn:global.relay.metered.ca:80?transport=tcp',
      username: '64fe1e1cd3237abf0a475345',
      credential: '9lAiV9099iIYi9J5',
    },
    {
      urls: 'turn:global.relay.metered.ca:443',
      username: '64fe1e1cd3237abf0a475345',
      credential: '9lAiV9099iIYi9J5',
    },
    {
      urls: 'turns:global.relay.metered.ca:443?transport=tcp',
      username: '64fe1e1cd3237abf0a475345',
      credential: '9lAiV9099iIYi9J5',
    },
  ],
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
  sendTyping: (isTyping: boolean) => void;
  isTyping: boolean;
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
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [partnerMediaStatus, setPartnerMediaStatus] = useState({ audio: true, video: true });
  const [onlineCount, setOnlineCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);
  const { toast } = useToast();

  // Initialize Local Media
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: "user"
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleSize: 24,
            sampleRate: 48000
          } 
        });
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

    // Set high-quality bandwidth constraints
    pc.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        const senders = pc.getSenders();
        senders.forEach(sender => {
          if (sender.track?.kind === 'video') {
            const parameters = sender.getParameters();
            if (!parameters.encodings) parameters.encodings = [{}];
            parameters.encodings[0].maxBitrate = 4000000; // 4Mbps for 1080p
            sender.setParameters(parameters).catch(e => console.error('Error setting parameters:', e));
          }
        });
      }
      
      if (pc.iceConnectionState === 'failed') {
        console.error('ICE Connection Failed - Moving to next stranger');
        toast({
          title: "Connection Failed",
          description: "Handshake failed. Finding new partner...",
          variant: "destructive"
        });
        nextPartner();
      }
      
      if (pc.iceConnectionState === 'disconnected') {
        console.log('ICE Disconnected - attempting automatic recovery');
        // Wait a bit for potential auto-reconnect, otherwise next
        setTimeout(() => {
          if (pcRef.current && (pcRef.current.iceConnectionState === 'disconnected' || pcRef.current.iceConnectionState === 'failed')) {
            console.log('ICE still disconnected after timeout, moving to next partner');
            nextPartner();
          }
        }, 5000);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'candidate', candidate: event.candidate });
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
        iceCandidatesQueue.current = [];
        if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
        }
        break;

      case 'matched':
        setChatState('connected');
        setMessages([]); // Clear chat for new partner
        iceCandidatesQueue.current = [];
        const pc = createPeerConnection();
        if (msg.initiator) {
          try {
            console.log('Initiating offer as initiator');
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await pc.setLocalDescription(offer);
            sendSignal({ type: 'offer', sdp: offer });
          } catch (err) {
            console.error('Error creating offer:', err);
            setError('Failed to establish connection. Trying next stranger...');
            nextPartner();
          }
        }
        break;

      case 'partner_disconnected':
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
          console.log('Received offer from partner');
          if (!pcRef.current) return;
          
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            
            // Process queued candidates
            console.log(`Processing ${iceCandidatesQueue.current.length} queued candidates`);
            while (iceCandidatesQueue.current.length > 0) {
              const candidate = iceCandidatesQueue.current.shift();
              if (candidate && pcRef.current) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.warn('Queued candidate error:', e));
              }
            }

            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            sendSignal({ type: 'answer', sdp: answer });
            console.log('Sent answer to partner');
          } catch (err) {
            console.error('Error handling offer:', err);
            nextPartner();
          }
        } else if (data.type === 'answer') {
          console.log('Received answer from partner');
          if (!pcRef.current) return;
          
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            
            // Process queued candidates
            console.log(`Processing ${iceCandidatesQueue.current.length} queued candidates`);
            while (iceCandidatesQueue.current.length > 0) {
              const candidate = iceCandidatesQueue.current.shift();
              if (candidate && pcRef.current) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.warn('Queued candidate error:', e));
              }
            }
          } catch (err) {
            console.error('Error handling answer:', err);
            nextPartner();
          }
        } else if (data.type === 'candidate') {
          const candidate = data.candidate;
          if (!candidate || !candidate.candidate) return;

          if (pcRef.current?.remoteDescription && pcRef.current.signalingState !== 'closed') {
            pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {
              console.warn('Error adding ICE candidate:', e);
            });
          } else {
            console.log('Queuing early candidate');
            iceCandidatesQueue.current.push(candidate);
          }
        }
        break;

      case 'typing':
        setIsTyping(msg.isTyping);
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
    setIsTyping(false);
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
    setIsTyping(false);
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

  const sendTyping = useCallback((isTyping: boolean) => {
    if (chatState !== 'connected') return;
    sendWS({ type: 'typing', isTyping });
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
    sendTyping,
    isTyping,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    partnerMediaStatus,
    onlineCount,
    error
  };
}
