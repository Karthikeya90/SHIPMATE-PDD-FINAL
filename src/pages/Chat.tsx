import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Search, Package, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { deliveryService } from '../services/deliveryService';
import { Message, DeliveryRequest, User } from '../data/types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
export function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const activeRole = location.pathname.startsWith('/sender') ? 'sender' : 'traveller';
  const initialRequestId = location.state?.requestId;
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<DeliveryRequest | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatUsers, setChatUsers] = useState<Record<string, User>>({});
  // Load requests
  useEffect(() => {
    if (!user) return;
    const loadRequests = async () => {
      try {
        const reqs =
        activeRole === 'sender' ?
        await deliveryService.getRequestsForSender(user.user_id) :
        await deliveryService.getRequestsForTraveller(user.user_id);
        // Only show chats for matched/active deliveries
        const activeReqs = reqs.filter((r) =>
        ['matched', 'picked_up', 'in_transit'].includes(r.status)
        );
        setRequests(activeReqs);

        // Fetch user profiles for other users in the chat list
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
                profile_image: p.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1f5e5b&color=fff`,
                location: p.location_lat ? {
                  lat: p.location_lat,
                  lng: p.location_lng,
                  address: p.location_address || ''
                } : undefined,
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
  // Load messages for active request
  useEffect(() => {
    if (!activeRequest) return;
    const loadMessages = async () => {
      const msgs = await chatService.getMessagesForRequest(
        activeRequest.request_id
      );
      setMessages(msgs);
      scrollToBottom();
    };
    loadMessages();
  }, [activeRequest]);
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRequest || !user) return;
    setIsSending(true);
    const receiverId =
    activeRole === 'sender' ?
    activeRequest.traveller_id! :
    activeRequest.sender_id;
    try {
      const msg = await chatService.sendMessage(
        activeRequest.request_id,
        user.user_id,
        receiverId,
        newMessage
      );
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      scrollToBottom();
      // Simulate reply
      chatService.
      simulateIncomingMessage(
        activeRequest.request_id,
        receiverId,
        user.user_id,
        "Got it! I'll keep you updated."
      ).
      then((reply) => {
        setMessages((prev) => [...prev, reply]);
        scrollToBottom();
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>);

  }
  return (
    <div className="h-[calc(100vh-8rem)] bg-card border border-border rounded-3xl overflow-hidden flex shadow-sm">
      {/* Sidebar - Chat List */}
      <div
        className={`w-full md:w-80 border-r border-border flex flex-col ${activeRequest ? 'hidden md:flex' : 'flex'}`}>
        
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-display font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {requests.length > 0 ?
          requests.map((req) => {
             const otherUserId =
             activeRole === 'sender' ? req.traveller_id : req.sender_id;
             const otherUser = otherUserId ? chatUsers[otherUserId] : undefined;
            return (
              <button
                key={req.request_id}
                onClick={() => setActiveRequest(req)}
                className={`w-full text-left p-4 border-b border-border hover:bg-muted transition-colors flex items-start gap-3 ${activeRequest?.request_id === req.request_id ? 'bg-muted' : ''}`}>
                
                  <img
                  src={
                  otherUser?.profile_image ||
                  `https://ui-avatars.com/api/?name=${otherUser?.name || 'U'}`
                  }
                  alt=""
                  className="h-10 w-10 rounded-full border border-border" />
                
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-semibold text-sm truncate">
                        {otherUser?.name || 'Unknown'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        12:30 PM
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium truncate mb-1">
                      {req.item_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Tap to view conversation
                    </p>
                  </div>
                </button>);

          }) :

          <div className="p-8 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active deliveries to chat about.</p>
            </div>
          }
        </div>
      </div>

      {/* Main Chat Area */}
      {activeRequest ?
      <div
        className={`flex-1 flex flex-col ${!activeRequest ? 'hidden md:flex' : 'flex'}`}>
        
          {/* Chat Header */}
          <div className="h-16 border-b border-border flex items-center px-4 md:px-6 bg-background/50 backdrop-blur">
            <button
            onClick={() => setActiveRequest(null)}
            className="md:hidden p-2 mr-2 text-muted-foreground hover:text-foreground">
            
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              {(() => {
              const otherUserId =
              activeRole === 'sender' ?
              activeRequest.traveller_id :
              activeRequest.sender_id;
              const otherUser = otherUserId ? chatUsers[otherUserId] : undefined;
              return (
                <>
                    <img
                    src={otherUser?.profile_image}
                    alt=""
                    className="h-10 w-10 rounded-full border border-border" />
                  
                    <div>
                      <h3 className="font-semibold">{otherUser?.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>{' '}
                        Online
                      </p>
                    </div>
                  </>);

            })()}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium">
                <Package className="h-3 w-3" /> {activeRequest.item_name}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-background/30">
            {messages.map((msg) => {
            const isMine = msg.sender_id === user?.user_id;
            return (
              <motion.div
                key={msg.message_id}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                
                  <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                  
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </span>
                </motion.div>);

          })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted border-none rounded-full py-3 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            
              <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50">
              
                {isSending ?
              <Loader2 className="h-5 w-5 animate-spin" /> :

              <Send className="h-5 w-5 ml-0.5" />
              }
              </button>
            </form>
          </div>
        </div> :

      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-muted-foreground bg-background/30">
          <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
          <p>Select a conversation to start messaging</p>
        </div>
      }
    </div>);

}