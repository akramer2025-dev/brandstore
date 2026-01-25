'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  isRead: boolean;
  isAdminMessage: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface Conversation {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  lastMessage: Message;
  unreadCount: number;
}

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }
    if (session?.user?.role !== 'ADMIN') {
      redirect('/');
    }
  }, [session, status]);

  // جلب قائمة المحادثات
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // جلب محادثة محددة
  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?with=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // تحديث حالة القراءة
        const unreadIds = data
          .filter((msg: Message) => !msg.isRead && msg.senderId === userId)
          .map((msg: Message) => msg.id);
          
        if (unreadIds.length > 0) {
          await fetch('/api/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageIds: unreadIds })
          });
          fetchConversations();
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
      const interval = setInterval(() => fetchMessages(selectedUser), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage,
          receiverId: selectedUser
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedUser);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageCircle className="w-8 h-8" />
          محادثات العملاء
        </h1>

        <div className="grid md:grid-cols-3 gap-4 bg-gray-800/50 rounded-lg border border-teal-700/30 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {/* قائمة المحادثات */}
          <div className="md:col-span-1 border-l border-teal-700/30 overflow-y-auto">
            <div className="p-4 border-b border-teal-700/30 bg-teal-900/30">
              <h2 className="text-lg font-semibold text-white">المحادثات</h2>
            </div>
            
            {conversations.length === 0 ? (
              <p className="text-center text-gray-400 p-4">لا توجد محادثات</p>
            ) : (
              <div className="divide-y divide-teal-700/30">
                {conversations.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUser(conv.user.id)}
                    className={`w-full p-4 text-right hover:bg-teal-900/20 transition ${
                      selectedUser === conv.user.id ? 'bg-teal-900/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white flex-shrink-0">
                        {conv.user.image ? (
                          <img src={conv.user.image} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white truncate">
                            {conv.user.name || conv.user.email}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {conv.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* نافذة المحادثة */}
          <div className="md:col-span-2 flex flex-col">
            {selectedUser ? (
              <>
                {/* رأس المحادثة */}
                <div className="p-4 border-b border-teal-700/30 bg-teal-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {conversations.find(c => c.user.id === selectedUser)?.user.name || 
                         conversations.find(c => c.user.id === selectedUser)?.user.email}
                      </p>
                      <p className="text-xs text-gray-400">متصل</p>
                    </div>
                  </div>
                </div>

                {/* الرسائل */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isAdminMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isAdminMessage
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* إرسال رسالة */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-teal-700/30 bg-gray-900/30">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="اكتب رسالتك..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-gray-800/50 border-teal-700/50 text-white"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>اختر محادثة لعرضها</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
