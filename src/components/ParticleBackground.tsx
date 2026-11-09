import React, { useEffect, useRef, useState } from 'react';
import { ParticleConfig } from '../types';
import samuraiImg from '../assets/images/samurai_realistic_fire_transparent.png';

// Fallback path supporting GitHub Pages subpaths via BASE_URL
const SAMURAI_FALLBACK_PATH = `${import.meta.env.BASE_URL}assets/aistudio/samurai_realistic_fire_transparent.png`;
const SAMURAI_IMAGE_SRC = samuraiImg || SAMURAI_FALLBACK_PATH;

interface ParticleBackgroundProps {
  config: ParticleConfig;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  swaySpeed: number;
  swayOffset: number;
  opacity: number;
  color: string;
}

interface FireEmber {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
  opacity: number;
  color: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // 3D Parallax and interactive tilt
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: normX, y: normY });
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      setMousePos({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Canvas Particle Animation (Sakura petals + Real Katana Fire Embers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petalCount = config.density === 'low' ? 30 : config.density === 'medium' ? 60 : 90;
    const petals: Petal[] = [];
    const fireEmbers: FireEmber[] = [];

    const petalColors = [
      'rgba(255, 182, 193, 0.95)',
      'rgba(255, 120, 150, 0.90)',
      'rgba(254, 215, 226, 0.85)',
      'rgba(251, 146, 60, 0.80)',
    ];

    if (config.sakuraEnabled) {
      for (let i = 0; i < petalCount; i++) {
        petals.push({
          x: Math.random() * width,
          y: Math.random() * height - height * 0.2,
          size: Math.random() * 8 + 6,
          speedY: (Math.random() * 1.2 + 0.8) * config.speed,
          speedX: (Math.random() * 1.4 - 0.2) * config.speed,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() * 0.04 - 0.02) * config.speed,
          flip: Math.random() * Math.PI,
          flipSpeed: Math.random() * 0.03 + 0.015,
          swaySpeed: Math.random() * 0.025 + 0.01,
          swayOffset: Math.random() * Math.PI * 2,
          opacity: Math.random() * 0.35 + 0.65,
          color: petalColors[Math.floor(Math.random() * petalColors.length)],
        });
      }
    }

    const fireColors = [
      'rgba(255, 235, 100, 0.95)',
      'rgba(255, 140, 20, 0.90)',
      'rgba(239, 68, 68, 0.85)',
      'rgba(249, 115, 22, 0.80)',
    ];

    const spawnKatanaFireEmber = () => {
      // Approximate fire katana location on screen (right side where samurai holds sword)
      const isMobile = width < 768;
      const bladeCenterX = isMobile ? width * 0.68 : width * 0.76;
      const bladeCenterY = isMobile ? height * 0.52 : height * 0.48;

      const spread = Math.random() * 140 - 70;
      fireEmbers.push({
        x: bladeCenterX + spread,
        y: bladeCenterY + (Math.random() * 40 - 20) + (spread * 0.35),
        size: Math.random() * 3.5 + 1.5,
        speedX: (Math.random() * 1.2 - 0.6) + 0.8, // drifts right with the wind
        speedY: -(Math.random() * 2.2 + 1.2), // rises quickly like hot fire
        life: 0,
        maxLife: Math.random() * 40 + 30,
        opacity: Math.random() * 0.4 + 0.6,
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
      });
    };

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Continually spawn fire embers from the flaming katana
      if (frame % 2 === 0) {
        spawnKatanaFireEmber();
        if (Math.random() > 0.4) spawnKatanaFireEmber();
      }

      // Render Floating Sakura Petals with Wind Billow
      if (config.sakuraEnabled) {
        for (let i = 0; i < petals.length; i++) {
          const p = petals[i];
          p.swayOffset += p.swaySpeed;
          p.flip += p.flipSpeed;
          const currentSpeedX = p.speedX + Math.sin(p.swayOffset) * 1.4;
          p.x += currentSpeedX;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;

          // Mouse wind gust
          if (mouseRef.current.active) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist > 0) {
              const force = (150 - dist) / 150;
              p.x += (dx / dist) * force * 4.5;
              p.y += (dy / dist) * force * 4.5;
            }
          }

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -30) p.x = width + 20;
          if (p.x > width + 30) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(1, Math.cos(p.flip));
          ctx.globalAlpha = p.opacity;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.6, p.size * 0.8, p.size * 0.5, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.5, -p.size * 0.9, -p.size * 0.6, 0, -p.size);
          ctx.fill();
          ctx.restore();
        }
      }

      // Render Blazing Katana Fire Embers
      for (let i = fireEmbers.length - 1; i >= 0; i--) {
        const e = fireEmbers[i];
        e.life++;
        e.x += e.speedX;
        e.y += e.speedY;

        const progress = e.life / e.maxLife;
        if (progress >= 1) {
          fireEmbers.splice(i, 1);
          continue;
        }

        const currentAlpha = e.opacity * (1 - progress);
        ctx.save();
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (1 - progress * 0.4), 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 2.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, e.color);
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = grad;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [config.density, config.speed, config.sakuraEnabled]);

  // 3D Tilt calculation for the realistic 3D Samurai
  const tiltX = mousePos.y * -11;
  const tiltY = mousePos.x * 14;
  const parallaxX = mousePos.x * -20;
  const parallaxY = mousePos.y * -12;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-gradient-to-b from-[#8b7ba8] via-[#659cd1] to-[#fdecc4]">
      {/* Anime Sky Layer: Akashi Sky Blue with Soft Twilight Horizon */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#9383b3]/85 via-[#6399c9]/75 to-[#fed7aa]/55" />

      {/* The Giant Radiant Crimson-Orange Sunset Sun from the Artwork */}
      <div
        className="absolute top-[8%] right-[6%] sm:right-[12%] w-[360px] sm:w-[500px] lg:w-[560px] h-[360px] sm:h-[500px] lg:h-[560px] rounded-full bg-gradient-to-tr from-[#ea580c] via-[#f95738] to-[#fb923c] shadow-[0_0_120px_rgba(234,88,12,0.5)] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${parallaxX * 0.3}px, ${parallaxY * 0.3}px, 0)`,
        }}
      />

      {/* Fluffy Anime Sunset Clouds Floating Across the Sky */}
      <div
        className="absolute top-[50%] right-[-5%] sm:right-[3%] w-[420px] sm:w-[540px] h-[170px] bg-gradient-to-t from-[#fef3c7] via-[#fde68a]/85 to-transparent rounded-[120px] blur-sm opacity-90 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${parallaxX * 0.5}px, ${parallaxY * 0.5}px, 0)`,
        }}
      />
      <div
        className="absolute top-[70%] left-[2%] w-[460px] h-[190px] bg-gradient-to-t from-[#fef3c7] via-[#fde68a]/75 to-transparent rounded-[140px] blur-sm opacity-65 pointer-events-none"
      />

      {/* REALISTIC 3D SAMURAI WARRIOR (Realistic Face, Wind-Billowing Cape/Hair, Blazing Fire Katana) */}
      {!imageError && (
        <div
          className="absolute right-[-2%] sm:right-6 lg:right-16 bottom-[-2%] sm:bottom-0 h-[86vh] sm:h-[94vh] max-h-[980px] flex items-end justify-center pointer-events-none will-change-transform z-10 transition-transform duration-200 ease-out"
          style={{
            perspective: '1400px',
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
          }}
        >
          <div
            className="h-full w-auto flex items-end justify-center transition-transform duration-200 ease-out animate-wind-billow"
            style={{
              transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(55px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Blazing Katana Glow Corona */}
            <div className="absolute top-[38%] right-[24%] w-48 h-48 rounded-full bg-orange-500/25 blur-2xl pointer-events-none animate-pulse" />

            <img
              src={SAMURAI_IMAGE_SRC}
              alt="Realistic fierce samurai warrior with flaming fire katana and wind-blown hair and cape"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="h-full w-auto max-w-[88vw] sm:max-w-[52vw] object-contain object-bottom drop-shadow-[0_30px_50px_rgba(15,23,42,0.7)] drop-shadow-[0_15px_30px_rgba(234,88,12,0.5)] transition-all"
            />
          </div>
        </div>
      )}

      {/* Atmospheric Soft Scrim on the left side to keep exam cards clean and readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/30 to-transparent pointer-events-none lg:w-3/5" />

      {/* Drifting Sakura & Fire Sparks Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />
    </div>
  );
};
