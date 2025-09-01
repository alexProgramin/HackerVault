"use client";

import { useEffect, useRef } from 'react';

export function BinaryOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fontSize = 16;
      ctx.font = `${fontSize}px "Source Code Pro", monospace`;
      
      const columns = Math.floor(canvas.width / fontSize);
      const drops = Array(columns).fill(1);

      const drawText = () => {
        ctx.fillStyle = 'rgba(11, 11, 13, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "hsl(145 100% 45% / 0.15)";
        
        for (let i = 0; i < drops.length; i++) {
          const text = Math.random() > 0.5 ? '0' : '1';
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        animationFrameId = requestAnimationFrame(drawText);
      }
      drawText();
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-30" />;
}
