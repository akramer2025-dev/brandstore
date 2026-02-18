"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, RefreshCw, MessageSquare, Search, Send, 
  Bot, User, Users, Clock, CheckCircle, AlertCircle,
  Phone, Mail, Filter, Archive, Star, MoreVertical,
  Smile, Paperclip, Image, Calendar, Settings
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'user' | 'ai' | 'admin';
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'pending' | 'resolved' | 'archived';
  type: 'customer' | 'ai-chat';
  messages: Message[];
}

export function MessagesCenterClient() {
  const [activeTab, setActiveTab] = useState("ai-chats");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // جلب المحادثات من API
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/chat-conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      
      // تحويل البيانات للتنسيق المطلوب
      const formattedConversations: Conversation[] = data.map((conv: any) => ({
        id: conv.id,
        customerName: conv.sessionId || 'عميل جديد',
        customerEmail: undefined,
        customerPhone: undefined,
        lastMessage: conv.lastMessage || 'لا توجد رسائل',
        lastMessageTime: new Date(conv.lastMessageAt).toLocaleDateString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        unreadCount: conv.isResolved ? 0 : 1,
        status: conv.isResolved ? 'resolved' : 'active',
        type: 'ai-chat', // كل المحادثات حالياً من المساعد الذكي
        messages: [], // سيتم تحميلها عند فتح المحادثة
      }));
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // جلب رسائل محادثة معينة
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/chat-conversations?id=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const messages = await response.json();
      
      // تحويل الرسائل للتنسيق المطلوب
      const formattedMessages: Message[] = messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' 
          ? 'العميل' 
          : msg.role === 'admin' 
            ? 'فريق الدعم' 
            : 'المساعد الذكي',
        timestamp: new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: msg.role === 'user' ? 'user' : msg.role === 'admin' ? 'admin' : 'ai',
        status: 'read',
      }));
      
      // تحديث المحادثة المحددة بالرسائل
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: formattedMessages
      } : null);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Sample data للمحادثات المباشرة (سيتم استبدالها لاحقاً)
  const sampleCustomerChats: Conversation[] = [
      {
        id: "sample-1",
        customerName: "أحمد محمد",
        customerEmail: "ahmed@example.com",
        customerPhone: "+201234567890",
        lastMessage: "شكراً لكم، الطلب وصل بحالة ممتازة!",
        lastMessageTime: "منذ 5 دقائق",
        unreadCount: 0,
        status: "resolved",
        type: "customer",
        messages: [
          {
            id: "m1",
            content: "مرحباً، أريد الاستفسار عن طلب رقم #12345",
            sender: "أحمد محمد",
            timestamp: "14:30",
            type: "user",
            status: "read"
          },
          {
            id: "m2", 
            content: "أهلاً بك! سأتحقق من حالة طلبك الآن",
            sender: "فريق الدعم",
            timestamp: "14:32",
            type: "admin",
            status: "read"
          },
          {
            id: "m3",
            content: "طلبك تم شحنه وسيصل خلال يومين",
            sender: "فريق الدعم", 
            timestamp: "14:33",
            type: "admin",
            status: "read"
          },
          {
            id: "m4",
            content: "شكراً لكم، الطلب وصل بحالة ممتازة!",
            sender: "أحمد محمد",
            timestamp: "16:45",
            type: "user",
            status: "read"
          }
        ]
      },
      {
        id: "sample-2",
        customerName: "فاطمة علي",
        customerEmail: "fatema@example.com",
        lastMessage: "هل يمكنني إرجاع المنتج إذا لم يعجبني؟",
        lastMessageTime: "منذ 15 دقيقة",
        unreadCount: 2,
        status: "pending",
        type: "customer",
        messages: [
          {
            id: "m5",
            content: "مرحباً، أريد معرفة سياسة الإرجاع",
            sender: "فاطمة علي",
            timestamp: "15:20",
            type: "user",
            status: "delivered"
          },
          {
            id: "m6",
            content: "هل يمكنني إرجاع المنتج إذا لم يعجبني؟",
            sender: "فاطمة علي",
            timestamp: "15:25",
            type: "user", 
            status: "delivered"
          }
        ]
      },
  ];

  // دمج المحادثات الحقيقية مع الـ sample data
  const allConversations = [...conversations, ...sampleCustomerChats];
  
  const customerChats = allConversations.filter(c => c.type === 'customer');
  const aiChats = allConversations.filter(c => c.type === 'ai-chat');
  
  const filteredConversations = activeTab === 'customer-chats' ? customerChats : aiChats;
  const searchFilteredConversations = filteredConversations.filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // إنشاء رسالة مؤقتة للعرض
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content: newMessage,
      sender: "فريق الدعم",
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      type: "admin",
      status: "sent"
    };

    // إضافة الرسالة للعرض فوراً
    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempMessage],
      lastMessage: newMessage,
      lastMessageTime: "الآن"
    } : null);

    const messageToSend = newMessage;
    setNewMessage("");

    // إرسال الرسالة للـ API إذا كانت محادثة حقيقية
    if (!selectedConversation.id.startsWith('sample-')) {
      try {
        const response = await fetch('/api/admin/chat-conversations/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: selectedConversation.id,
            content: messageToSend,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const savedMessage = await response.json();

        // تحديث الرسالة المؤقتة بالرسالة المحفوظة
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: prev.messages.map(m => 
            m.id === tempMessage.id 
              ? {
                  ...m,
                  id: savedMessage.id,
                  status: 'delivered' as const,
                }
              : m
          ),
        } : null);
      } catch (error) {
        console.error('Error sending message:', error);
        // في حالة الفشل، نعرض رسالة خطأ
        alert('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
        // إزالة الرسالة المؤقتة
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: prev.messages.filter(m => m.id !== tempMessage.id),
        } : null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'pending': return 'في الانتظار';
      case 'resolved': return 'محلولة';
      case 'archived': return 'مؤرشفة';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-green-100 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <MessageSquare className="w-10 h-10" />
                  💬 مركز المحادثات والرسائل
                </h1>
                <p className="text-green-100 mt-2">
                  جميع محادثات العملاء والمساعد الذكي في مكان واحد
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchConversations}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-2 gap-4 h-auto p-2 bg-white/50 border border-gray-200 rounded-lg">
            <TabsTrigger 
              value="customer-chats" 
              className="flex items-center justify-center p-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              <Users className="w-5 h-5 mr-2" />
              <span>💬 محادثات العملاء ({customerChats.length})</span>
              {customerChats.some(c => c.unreadCount > 0) && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {customerChats.reduce((sum, c) => sum + c.unreadCount, 0)}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="ai-chats" 
              className="flex items-center justify-center p-4 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800"
            >
              <Bot className="w-5 h-5 mr-2" />
              <span>🤖 رسائل المساعد الذكي ({aiChats.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">إجمالي المحادثات</p>
                    <p className="text-3xl font-bold text-blue-800">{conversations.length}</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">في الانتظار</p>
                    <p className="text-3xl font-bold text-orange-800">
                      {conversations.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">محلولة</p>
                    <p className="text-3xl font-bold text-green-800">
                      {conversations.filter(c => c.status === 'resolved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">مساعد ذكي</p>
                    <p className="text-3xl font-bold text-purple-800">{aiChats.length}</p>
                  </div>
                  <Bot className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {activeTab === 'customer-chats' ? '💬 محادثات العملاء' : '🤖 المساعد الذكي'}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="البحث في المحادثات..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {searchFilteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          // جلب الرسائل من API إذا كانت محادثة حقيقية (مش sample)
                          if (conversation.type === 'ai-chat' && !conversation.id.startsWith('sample-')) {
                            fetchMessages(conversation.id);
                          }
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {conversation.type === 'ai-chat' ? (
                                <Bot className="w-4 h-4 text-gray-600" />
                              ) : (
                                <User className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{conversation.customerName}</h4>
                              <p className="text-xs text-gray-500">{conversation.lastMessageTime}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <Badge className={`${getStatusColor(conversation.status)} text-xs`}>
                              {getStatusText(conversation.status)}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        
                        {conversation.type === 'customer' && conversation.customerEmail && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {conversation.customerEmail}
                            </span>
                            {conversation.customerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {conversation.customerPhone}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <CardHeader className="pb-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {selectedConversation.type === 'ai-chat' ? (
                              <Bot className="w-5 h-5 text-gray-600" />
                            ) : (
                              <User className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{selectedConversation.customerName}</h3>
                            <p className="text-sm text-gray-500">
                              {selectedConversation.type === 'ai-chat' ? 'محادثة مع المساعد الذكي' : 'محادثة مباشرة'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(selectedConversation.status)}>
                            {getStatusText(selectedConversation.status)}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {/* Messages */}
                    <CardContent className="p-0">
                      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                        {selectedConversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.type === 'admin'
                                  ? 'bg-blue-600 text-white'
                                  : message.type === 'ai'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'  
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-70">{message.timestamp}</span>
                                {message.type === 'admin' && (
                                  <div className="flex items-center gap-1">
                                    {message.status === 'sent' && <Clock className="w-3 h-3" />}
                                    {message.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                                    {message.status === 'read' && <CheckCircle className="w-3 h-3 fill-current" />}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Input - متاح لجميع المحادثات */}
                      <div className="border-t p-4">
                        {selectedConversation.type === 'ai-chat' && !selectedConversation.id.startsWith('sample-') && (
                          <div className="flex items-center gap-2 text-purple-700 bg-purple-50 p-2 rounded-lg mb-3">
                            <Bot className="w-4 h-4" />
                            <span className="text-sm">
                              يمكنك التدخل والرد على العميل مباشرة
                            </span>
                          </div>
                        )}
                        {selectedConversation.id.startsWith('sample-') && (
                          <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded-lg mb-3">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">
                              هذه محادثة تجريبية - لا يمكن الرد عليها
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled={selectedConversation.id.startsWith('sample-')}>
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled={selectedConversation.id.startsWith('sample-')}>
                            <Image className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" disabled={selectedConversation.id.startsWith('sample-')}>
                            <Smile className="w-4 h-4" />
                          </Button>
                          
                          <Textarea
                            placeholder={
                              selectedConversation.id.startsWith('sample-') 
                                ? "محادثة تجريبية..." 
                                : "اكتب رسالتك هنا..."
                            }
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                            disabled={selectedConversation.id.startsWith('sample-')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                          />
                          
                          <Button 
                            onClick={sendMessage} 
                            disabled={!newMessage.trim() || selectedConversation.id.startsWith('sample-')}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">اختر محادثة للبدء</h3>
                      <p className="text-sm">اختر محادثة من القائمة لعرض الرسائل والرد على العملاء</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Settings className="w-5 h-5" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Archive className="w-4 h-4 mr-2" />
                  أرشفة المحادثات المحلولة
                </Button>
                
                <Button className="bg-green-600 hover:bg-green-700">
                  <Star className="w-4 h-4 mr-2" />
                  تمييز المحادثات المهمة
                </Button>
                
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Bot className="w-4 h-4 mr-2" />
                  إعدادات المساعد الذكي
                </Button>
                
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  تقرير المحادثات اليومي
                </Button>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}