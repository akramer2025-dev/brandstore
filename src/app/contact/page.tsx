"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "الهاتف",
      value: "01555512778",
      link: "tel:01555512778",
    },
    {
      icon: MessageCircle,
      title: "واتساب",
      value: "01555512778",
      link: "https://wa.me/201555512778",
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: "info@remostore.net",
      link: "mailto:info@remostore.net",
    },
    {
      icon: MapPin,
      title: "العنوان",
      value: "مصر - القاهرة",
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            اتصل بنا
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            نحن هنا لمساعدتك! تواصل معنا وسنرد عليك في أقرب وقت ممكن
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">معلومات التواصل</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{item.title}</p>
                        <p className="text-white font-semibold">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );

                return item.link ? (
                  <a key={index} href={item.link} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>

            {/* Working Hours */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-teal-400" />
                <h3 className="text-xl font-semibold text-white">ساعات العمل</h3>
              </div>
              <div className="space-y-2 text-gray-300">
                <p>السبت - الخميس: 9 صباحاً - 10 مساءً</p>
                <p>الجمعة: 2 مساءً - 10 مساءً</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6">أرسل رسالة</h2>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">تم الإرسال بنجاح!</h3>
                <p className="text-gray-400 mb-6">سنتواصل معك في أقرب وقت ممكن</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-teal-400 hover:text-teal-300 transition"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="اسمك الكريم"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الموضوع *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="موضوع رسالتك"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
