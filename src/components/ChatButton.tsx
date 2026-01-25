'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
    image: string | null;
  };
}

export default function ChatButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // جلب المحادثات
  const fetchMessages = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // عد الرسائل غير المقروءة
        const unread = data.filter((msg: Message) => 
          !msg.isRead && msg.receiverId === session.user.id
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      // تحديث المحادثات كل 10 ثواني
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // تحديث حالة القراءة عند فتح المحادثة
  useEffect(() => {
    if (isOpen && messages.length > 0 && session?.user) {
      const unreadMessageIds = messages
        .filter(msg => !msg.isRead && msg.receiverId === session.user.id)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length > 0) {
        fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: unreadMessageIds })
        }).then(() => {
          setUnreadCount(0);
          fetchMessages();
        });
      }
    }
  }, [isOpen, messages, session]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!session?.user) return null;

  return (
    <>
      {/* زر المحادثة العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 md:p-4 shadow-2xl transition-all duration-300 hover:scale-110"
      >
        {isOpen ? (
          <X className="w-5 h-5 md:w-6 md:h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* نافذة المحادثة */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 md:bottom-24 md:left-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-gradient-to-br from-gray-900 via-teal-900/50 to-gray-900 rounded-lg shadow-2xl border border-teal-700/30 flex flex-col max-h-[70vh] md:max-h-[600px]">
          {/* رأس المحادثة */}
          <div className="p-3 md:p-4 border-b border-teal-700/30 bg-teal-900/30">
            <h3 className="text-base md:text-lg font-bold text-white">
              {session.user.role === 'ADMIN' ? 'محادثات العملاء' : 'تواصل مع الإدارة'}
            </h3>
          </div>

          {/* المحادثات */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-teal-400" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm md:text-base">لا توجد محادثات بعد</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === session.user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] p-2 md:p-3 rounded-lg text-sm md:text-base ${
                      message.senderId === session.user.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {message.sender.name && message.senderId !== session.user.id && (
                      <p className="text-xs text-teal-300 mb-1">{message.sender.name}</p>
                    )}
                    <p className="break-words">{message.content}</p>
                    <p className="text-[10px] md:text-xs opacity-70 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* إرسال رسالة */}
          <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-teal-700/30 bg-gray-900/30">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="اكتب رسالتك..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-gray-800/50 border-teal-700/50 text-white text-sm md:text-base h-9 md:h-10"
                disabled={isSending}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="bg-teal-600 hover:bg-teal-700 px-3 md:px-4 h-9 md:h-10"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
