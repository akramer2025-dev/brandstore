'use client';

import Image from 'next/image';

export default function BrandBackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Shopping Girl - Top Right - باعدناها */}
      <div className="absolute top-5 right-5 opacity-4 rotate-12">
        <Image
          src="/shopping-girl.png"
          alt=""
          width={200}
          height={200}
          className="object-contain"
        />
      </div>

      {/* Rimo Text - Top Left - باعدناها */}
      <div className="absolute top-32 left-5 opacity-4 -rotate-6">
        <Image
          src="/rimo-text.png"
          alt=""
          width={180}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Shopping Bag - Middle Right - باعدناها */}
      <div className="absolute top-[45%] right-5 opacity-4 rotate-6">
        <Image
          src="/shopping-bag.png"
          alt=""
          width={140}
          height={140}
          className="object-contain"
        />
      </div>

      {/* Full Logo - Bottom Left - باعدناها */}
      <div className="absolute bottom-5 left-5 opacity-4 -rotate-3">
        <Image
          src="/rimo-full-logo.png"
          alt=""
          width={200}
          height={200}
          className="object-contain"
        />
      </div>

      {/* Rimo Text - Bottom Right - باعدناها */}
      <div className="absolute bottom-20 right-5 opacity-3 rotate-12">
        <Image
          src="/rimo-text.png"
          alt=""
          width={150}
          height={100}
          className="object-contain"
        />
      </div>

      {/* Product Icons - Subtle Decorative Elements */}
      {/* Gift Box - Center Left */}
      <div className="absolute top-[70%] left-[8%] opacity-20 rotate-12">
        <svg className="w-24 h-24 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 7h-3V6a3 3 0 0 0-6 0v1H8a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM13 6a1 1 0 0 1 2 0v1h-2V6zm5 13a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v10z"/>
          <path d="M12 2a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1z"/>
        </svg>
      </div>

      {/* T-Shirt Icon - Top Center Right */}
      <div className="absolute top-[15%] right-[25%] opacity-20 -rotate-6">
        <svg className="w-20 h-20 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4h1.5c.83 0 1.5.67 1.5 1.5S18.33 7 17.5 7H16v13H8V7H6.5C5.67 7 5 6.33 5 5.5S5.67 4 6.5 4H8c0-2.21 1.79-4 4-4s4 1.79 4 4zm-4-2c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>

      {/* Heart Icon - Right Side */}
      <div className="absolute top-[35%] right-[5%] opacity-20 rotate-3">
        <svg className="w-16 h-16 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* Shopping Cart - Bottom Right */}
      <div className="absolute bottom-[30%] right-[12%] opacity-20 -rotate-12">
        <svg className="w-20 h-20 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>

      {/* Mobile - Hidden on small screens */}
      <div className="hidden lg:block">
        {/* Shopping Girl - Middle Left (Small) - باعدناها */}
        <div className="absolute top-[55%] left-[15%] opacity-3 -rotate-12">
          <Image
            src="/shopping-girl.png"
            alt=""
            width={160}
            height={160}
            className="object-contain"
          />
        </div>

        {/* Shopping Bag - Top Center - باعدناها */}
        <div className="absolute top-10 left-[45%] opacity-3 rotate-3">
          <Image
            src="/shopping-bag.png"
            alt=""
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Full Logo - Bottom Center - باعدناها */}
        <div className="absolute bottom-10 left-[40%] opacity-3 rotate-6">
          <Image
            src="/rimo-full-logo.png"
            alt=""
            width={180}
            height={180}
            className="object-contain"
          />
        </div>

        {/* Additional Product Icons for Large Screens */}
        {/* Star Icon - Center */}
        <div className="absolute top-[60%] left-[60%] opacity-10 rotate-45">
          <svg className="w-14 h-14 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Diamond Icon - Left Center */}
        <div className="absolute top-[25%] left-[25%] opacity-10 -rotate-12">
          <svg className="w-16 h-16 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>
          </svg>
        </div>
        
        {/* Bow/Ribbon - Bottom Left of Center */}
        <div className="absolute bottom-[25%] left-[55%] opacity-10 rotate-6">
          <svg className="w-20 h-20 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 6.76L10.12 9.4c-.35.5-.35 1.2 0 1.7L12 13.74l1.88-2.64c.35-.5.35-1.2 0-1.7L12 6.76M12 1L8 7h8l-4-6M8 17l4 6 4-6H8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
