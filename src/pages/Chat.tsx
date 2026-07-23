import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Search,
  Package,
  ArrowLeft,
  Loader2,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Square,
  Play,
  Pause,
  X,
  Maximize2,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { deliveryService } from '../services/deliveryService';
import { Message, DeliveryRequest, User } from '../data/types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

/**
 * Custom Voice Message Player component
 */
function VoicePlayer({
  audioUrl,
  duration,
  isMine
}: {
  audioUrl: string;
  duration?: number;
  isMine: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-3 min-w-[200px] sm:min-w-[240px] py-1">
      <button
        type="button"
        onClick={togglePlay}
        className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm ${
          isMine
            ? 'bg-white text-primary hover:bg-white/90'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <input
          type="range"
          min="0"
          max={totalDuration || 100}
          value={currentTime}
          onChange={handleSeek}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
            isMine ? 'accent-white bg-white/30' : 'accent-primary bg-primary/20'
          }`}
        />
        <div className="flex justify-between items-center text-[10px] opacity-80 font-medium">
          <span>{formatSeconds(currentTime)}</span>
          <span>{formatSeconds(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const activeRole = location.pathname.startsWith('/sender') ? 'sender' : 'traveller';
  const initialRequestId = location.state?.requestId;

  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<DeliveryRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Photo viewer modal state
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatUsers, setChatUsers] = useState<Record<string, User>>({});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load requests
  useEffect(() => {
    if (!user) return;
    const loadRequests = async () => {
      try {
        const reqs =
          activeRole === 'sender'
            ? await deliveryService.getRequestsForSender(user.user_id)
            : await deliveryService.getRequestsForTraveller(user.user_id);
        const activeReqs = reqs.filter((r) =>
          ['matched', 'picked_up', 'in_transit', 'delivered'].includes(r.status)
        );
        setRequests(activeReqs);

        const otherUserIds = activeReqs
          .map((r) => (activeRole === 'sender' ? r.traveller_id : r.sender_id))
          .filter((id): id is string => !!id);

        if (otherUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', otherUserIds);

          if (profiles) {
            const map: Record<string, User> = {};
            profiles.forEach((p: any) => {
              map[p.id] = {
                user_id: p.id,
                name: p.name,
                email: p.email,
                phone: p.phone || undefined,
                city: p.city || undefined,
                role: p.role,
                profile_image:
                  p.profile_image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1f5e5b&color=fff`,
                created_at: p.created_at
              };
            });
            setChatUsers(map);
          }
        }

        if (initialRequestId) {
          const req = activeReqs.find((r) => r.request_id === initialRequestId);
          if (req) setActiveRequest(req);
        } else if (activeReqs.length > 0) {
          setActiveRequest(activeReqs[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRequests();
  }, [user, initialRequestId]);

  // Load messages and subscribe to real-time updates
  useEffect(() => {
    if (!activeRequest || !user) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const loadMessages = async () => {
      const msgs = await chatService.getMessagesForRequest(activeRequest.request_id);
      setMessages(msgs);
      scrollToBottom();
    };
    loadMessages();

    const unsubscribe = chatService.subscribeToMessages(
      activeRequest.request_id,
      user.user_id,
      (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.message_id === msg.message_id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    );
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [activeRequest, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Text message handler
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRequest || !user || isSending) return;
    setIsSending(true);
    const receiverId =
      activeRole === 'sender' ? activeRequest.traveller_id! : activeRequest.sender_id;

    try {
      const msg = await chatService.sendMessage(
        activeRequest.request_id,
        user.user_id,
        receiverId,
        newMessage.trim(),
        'text'
      );
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // Image Selection & Upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeRequest || !user) return;

    const receiverId =
      activeRole === 'sender' ? activeRequest.traveller_id! : activeRequest.sender_id;
    setIsSending(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Sending photo ${i + 1} of ${files.length}...`);

        const mediaUrl = await chatService.uploadMedia(file, 'images');

        const msg = await chatService.sendMessage(
          activeRequest.request_id,
          user.user_id,
          receiverId,
          '',
          'image',
          mediaUrl
        );
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsSending(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required to send voice messages.');
      console.error('Mic access error:', err);
    }
  };

  // Stop & Send Voice Recording
  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !activeRequest || !user) return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    const finalDuration = recordingTime;
    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      // Stop all mic tracks
      recorder.stream.getTracks().forEach((track) => track.stop());

      setIsRecording(false);
      setRecordingTime(0);
      setIsSending(true);
      setUploadProgress('Sending voice note...');

      try {
        const receiverId =
          activeRole === 'sender' ? activeRequest.traveller_id! : activeRequest.sender_id;

        const mediaUrl = await chatService.uploadMedia(audioBlob, 'audio');

        const msg = await chatService.sendMessage(
          activeRequest.request_id,
          user.user_id,
          receiverId,
          'Voice Message',
          'voice',
          mediaUrl,
          finalDuration
        );
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } catch (err) {
        console.error('Voice send error:', err);
      } finally {
        setIsSending(false);
        setUploadProgress(null);
      }
    };

    recorder.stop();
  };

  // Cancel Recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecordingTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getOtherUser = (req: DeliveryRequest) => {
    const otherUserId = activeRole === 'sender' ? req.traveller_id : req.sender_id;
    return otherUserId ? chatUsers[otherUserId] : undefined;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-card border border-border rounded-3xl overflow-hidden flex shadow-sm relative">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />

      {/* Sidebar - Chat List */}
      <div
        className={`w-full md:w-80 border-r border-border flex flex-col ${activeRequest ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-display font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {requests.length > 0 ? (
            requests.map((req) => {
              const otherUser = getOtherUser(req);
              return (
                <button
                  key={req.request_id}
                  onClick={() => setActiveRequest(req)}
                  className={`w-full text-left p-4 border-b border-border hover:bg-muted transition-colors flex items-start gap-3 ${
                    activeRequest?.request_id === req.request_id ? 'bg-muted' : ''
                  }`}
                >
                  <img
                    src={
                      otherUser?.profile_image ||
                      `https://ui-avatars.com/api/?name=${otherUser?.name || 'U'}&background=1f5e5b&color=fff`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-semibold text-sm truncate">
                        {otherUser?.name || 'Unknown'}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                        {activeRole === 'sender' ? 'Traveller' : 'Sender'}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium truncate mb-0.5">
                      📦 {req.item_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {req.status === 'delivered' ? '✅ Delivered' : `Status: ${req.status.replace('_', ' ')}`}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active deliveries to chat about.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeRequest ? (
        <div className={`flex-1 flex flex-col ${!activeRequest ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="h-16 border-b border-border flex items-center px-4 md:px-6 bg-background/50 backdrop-blur">
            <button
              type="button"
              onClick={() => setActiveRequest(null)}
              className="md:hidden p-2 mr-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {(() => {
              const otherUser = getOtherUser(activeRequest);
              return (
                <>
                  <img
                    src={
                      otherUser?.profile_image ||
                      `https://ui-avatars.com/api/?name=${otherUser?.name || 'U'}&background=1f5e5b&color=fff`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-semibold">{otherUser?.name || 'Unknown'}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> Online
                      <span className="mx-1 text-border">•</span>
                      <span className="capitalize">
                        {activeRole === 'sender' ? 'Traveller' : 'Sender'}
                      </span>
                    </p>
                  </div>
                </>
              );
            })()}

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium">
                <Package className="h-3 w-3" /> {activeRequest.item_name}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-background/30">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation with text, photo, or voice message!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.user_id;
              const senderProfile = isMine ? undefined : chatUsers[msg.sender_id];
              return (
                <motion.div
                  key={msg.message_id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                    {!isMine && (
                      <img
                        src={
                          senderProfile?.profile_image ||
                          `https://ui-avatars.com/api/?name=${senderProfile?.name || 'U'}&background=1f5e5b&color=fff&size=32`
                        }
                        alt=""
                        className="h-7 w-7 rounded-full border border-border object-cover flex-shrink-0 mb-4"
                      />
                    )}

                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && (
                        <span className="text-[11px] font-semibold text-primary mb-1 ml-1">
                          {senderProfile?.name || 'Unknown'}
                        </span>
                      )}
                      {isMine && (
                        <span className="text-[11px] font-semibold text-muted-foreground mb-1 mr-1">
                          You
                        </span>
                      )}

                      {/* Bubble content depending on type */}
                      <div
                        className={`rounded-2xl shadow-sm transition-all ${
                          msg.message_type === 'image'
                            ? 'p-1.5 bg-card border border-border'
                            : isMine
                            ? 'bg-primary text-primary-foreground rounded-br-md px-4 py-2.5'
                            : 'bg-muted border border-border text-foreground rounded-bl-md px-4 py-2.5'
                        }`}
                      >
                        {/* PHOTO MESSAGE */}
                        {msg.message_type === 'image' && msg.media_url && (
                          <div className="relative group rounded-xl overflow-hidden max-w-xs cursor-pointer">
                            <img
                              src={msg.media_url}
                              alt="Shared photo"
                              onClick={() => setActiveLightboxImage(msg.media_url!)}
                              className="max-h-64 sm:max-h-72 w-full object-cover rounded-xl group-hover:opacity-95 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                            </div>
                          </div>
                        )}

                        {/* VOICE MESSAGE */}
                        {msg.message_type === 'voice' && msg.media_url && (
                          <VoicePlayer
                            audioUrl={msg.media_url}
                            duration={msg.audio_duration}
                            isMine={isMine}
                          />
                        )}

                        {/* TEXT MESSAGE */}
                        {(!msg.message_type || msg.message_type === 'text') && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-muted-foreground mt-1 mx-1 flex items-center gap-1">
                        {format(new Date(msg.timestamp), 'h:mm a')}
                        {isMine && <Check className="h-3 w-3 text-primary" />}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Upload progress indicator */}
            {uploadProgress && (
              <div className="flex justify-center my-2">
                <div className="bg-muted border border-border px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm animate-pulse text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {uploadProgress}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp-Style Input Bar */}
          <div className="p-3 sm:p-4 bg-background border-t border-border">
            {isRecording ? (
              /* Voice Recording Bar */
              <div className="flex items-center justify-between bg-destructive/10 border border-destructive/30 rounded-full px-4 py-2.5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-destructive animate-ping" />
                  <span className="text-sm font-semibold text-destructive">
                    Recording: {formatRecordingTime(recordingTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-colors"
                    title="Cancel recording"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-white text-xs font-bold rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" /> Send
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Input Form */
              <form onSubmit={handleSendText} className="flex items-center gap-2 sm:gap-3">
                {/* 📷 Photo / Gallery Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Share photo from gallery"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>

                {/* 🎤 Voice Recording Button */}
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isSending}
                  className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Record voice message"
                >
                  <Mic className="h-5 w-5" />
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 bg-muted border border-border rounded-full py-2.5 px-4 sm:px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />

                {/* ➤ Send Button */}
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0"
                  title="Send message"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-muted-foreground bg-background/30">
          <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">Select a conversation to start messaging</p>
          <p className="text-sm mt-1 opacity-60">
            Choose a delivery chat from the sidebar
          </p>
        </div>
      )}

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveLightboxImage(null)}
          >
            <button
              type="button"
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={activeLightboxImage}
              alt="Full size view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}