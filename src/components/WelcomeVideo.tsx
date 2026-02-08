'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Play } from 'lucide-react';

export default function WelcomeVideo() {
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // تحقق إذا المستخدم شاف الفيديو قبل كده
    const hasSeenVideo = localStorage.getItem('hasSeenWelcomeVideo');
    
    if (!hasSeenVideo) {
      // إظهار الفيديو بعد تحميل الصفحة بثانية
      setTimeout(() => {
        setShowVideo(true);
        setIsPlaying(true);
      }, 1000);
    }
  }, []);

  const handleClose = () => {
    setShowVideo(false);
    localStorage.setItem('hasSeenWelcomeVideo', 'true');
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoEnd = () => {
    handleClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!showVideo) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-orange-900/50"
        onClick={handleClose}
      />

      {/* Video Container */}
      <div className="relative z-10 w-full max-w-4xl mx-4 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 group backdrop-blur-sm"
          aria-label="تخطي الفيديو"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute -bottom-8 right-0 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            تخطي (ESC)
          </span>
        </button>

        {/* Video Player */}
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            {/* استخدام الفيديو المحلي */}
            <source src="/welcome-video.mp4" type="video/mp4" />
            {/* Fallback لفيديو احتياطي */}
            <source src="https://cdn.pixabay.com/video/2023/04/20/159068-821572968_large.mp4" type="video/mp4" />
            متصفحك لا يدعم تشغيل الفيديو
          </video>

          {/* Video Overlay with Store Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-fade-in-up">
                مرحباً بك في ريمو ستور! 🎉
              </h1>
              <p className="text-lg md:text-xl opacity-90 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                اكتشف أفضل المنتجات بأرخص الأسعار! 🛍️
              </p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 hover:scale-110"
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? (
                <div className="w-5 h-5 flex gap-1 items-center justify-center">
                  <div className="w-1.5 h-5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-5 bg-white rounded-full"></div>
                </div>
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 hover:scale-110"
              aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Skip Text */}
          <div className="absolute top-4 left-4 pointer-events-auto">
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white text-sm bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300"
            >
              تخطي الفيديو ⏭️
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-progress"
            style={{
              animation: 'progress 15s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
