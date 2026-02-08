"use client";

import { useEffect, useRef } from 'react';

export default function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Star class
    class Star {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speed: number = 0;
      opacity: number = 0;
      twinkleSpeed: number = 0;
      twinkleDirection: number = 0;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.05 + 0.01;
        this.opacity = Math.random();
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        if (!canvas) return;
        // Twinkle effect
        this.opacity += this.twinkleSpeed * this.twinkleDirection;
        if (this.opacity >= 1 || this.opacity <= 0.2) {
          this.twinkleDirection *= -1;
        }

        // Slow floating movement
        this.y -= this.speed;
        if (this.y < 0) {
          this.y = canvas!.height;
          this.x = Math.random() * canvas!.width;
        }
      }

      draw() {
        if (!ctx) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(192, 132, 252, 0.8)'); // purple-400
        gradient.addColorStop(1, 'rgba(192, 132, 252, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Core of the star
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Shooting star class
    class ShootingStar {
      x: number = 0;
      y: number = 0;
      length: number = 0;
      speed: number = 0;
      opacity: number = 0;
      angle: number = 0;
      active: boolean = false;

      constructor() {
        this.reset();
        this.active = false;
      }

      reset() {
        if (!canvas) return;
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height * 0.3;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 10 + 10;
        this.opacity = 1;
        this.angle = Math.PI / 4; // 45 degrees
        this.active = false;
      }

      update() {
        if (!this.active || !canvas) return;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.015;

        if (this.opacity <= 0 || this.x > canvas!.width || this.y > canvas!.height) {
          this.reset();
        }
      }

      draw() {
        if (!ctx || !this.active || this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(216, 180, 254, 0.9)'); // purple-300
        gradient.addColorStop(1, 'rgba(192, 132, 252, 0)'); // purple-400

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.length,
          this.y - Math.sin(this.angle) * this.length
        );
        ctx.stroke();

        ctx.restore();
      }

      trigger() {
        if (!this.active) {
          this.reset();
          this.active = true;
          this.opacity = 1;
        }
      }
    }

    // Create stars - increased count for more visibility
    const stars: Star[] = [];
    const starCount = 120; // Increased for more visible stars
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // Create shooting stars
    const shootingStars: ShootingStar[] = [];
    const shootingStarCount = 4; // Increased for more effect
    for (let i = 0; i < shootingStarCount; i++) {
      shootingStars.push(new ShootingStar());
    }

    // Trigger shooting stars randomly
    let shootingStarTimer: NodeJS.Timeout;
    const triggerShootingStar = () => {
      const inactiveStar = shootingStars.find(s => !s.active);
      if (inactiveStar) {
        inactiveStar.trigger();
      }
      shootingStarTimer = setTimeout(triggerShootingStar, Math.random() * 8000 + 3000); // More frequent
    };
    triggerShootingStar();

    // Animation loop with frame limiting for performance
    let animationId: number;
    let lastTime = 0;
    const fps = 30; // Limit to 30fps for better performance
    const frameInterval = 1000 / fps;
    
    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      
      lastTime = currentTime - (deltaTime % frameInterval);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      // Update and draw shooting stars
      shootingStars.forEach(star => {
        star.update();
        star.draw();
      });
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
      clearTimeout(shootingStarTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
