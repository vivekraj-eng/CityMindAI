import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Resizing handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse movement handler
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle Layer Definitions
    const particles = [];

    // Layer 1: Distant Stars
    const starCount = 95;
    for (let i = 0; i < starCount; i++) {
      particles.push({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 0.7 + 0.5,
        colorBase: 'rgba(255, 249, 244, ', // Soft ivory/champagne
        opacity: Math.random() * 0.25 + 0.2, // Clearly visible against warm peach
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        depth: 0.15, // Background parallax
        angle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.03 + 0.01,
        layer: 1
      });
    }

    // Layer 2: Midground Particles
    const midCount = 45;
    const midColors = [
      'rgba(243, 228, 216, ', // Champagne
      'rgba(185, 101, 75, ',  // Terracotta
      'rgba(82, 106, 120, ',  // Muted blue-gray
    ];
    for (let i = 0; i < midCount; i++) {
      particles.push({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 1.2 + 1.3,
        colorBase: midColors[Math.floor(Math.random() * midColors.length)],
        opacity: Math.random() * 0.25 + 0.25, // Bright midground floats
        twinkleSpeed: 0,
        depth: Math.random() * 0.4 + 0.35, // Medium depth parallax
        angle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.07 + 0.03,
        layer: 2
      });
    }

    // Layer 3: Feature Particles
    const featCount = 10;
    for (let i = 0; i < featCount; i++) {
      particles.push({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 3 + 3.5, // 3.5px to 6.5px soft accents
        colorBase: Math.random() > 0.4 ? 'rgba(243, 228, 216, ' : 'rgba(185, 101, 75, ',
        opacity: Math.random() * 0.12 + 0.12, // Subtle atmospheric haze density
        blur: Math.random() * 4 + 4,
        twinkleSpeed: 0,
        depth: Math.random() * 0.2 + 0.8, // Foreground parallax
        angle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.04 + 0.02,
        layer: 3
      });
    }

    // Civic Data Nodes
    const nodes = [
      { x: 0.25, y: 0.3, r: 6, opacity: 0.1 },
      { x: 0.75, y: 0.2, r: 4, opacity: 0.08 },
      { x: 0.85, y: 0.75, r: 5, opacity: 0.09 },
      { x: 0.15, y: 0.8, r: 4, opacity: 0.07 },
    ];

    // Animation Loop
    const render = () => {
      // Clear canvas with base warm peach matches #F3E4D8
      ctx.fillStyle = '#F3E4D8';
      ctx.fillRect(0, 0, width, height);

      // Reset shadows
      ctx.shadowBlur = 0;

      // Lerping mouse coordinates for smooth inertia
      if (!prefersReducedMotion) {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
      }

      // Draw static civic nodes in the distance
      nodes.forEach((n) => {
        const parallaxX = !prefersReducedMotion ? (mouse.x - width / 2) * 0.01 : 0;
        const parallaxY = !prefersReducedMotion ? (mouse.y - height / 2) * 0.01 : 0;
        
        const nodeX = n.x * width + parallaxX;
        const nodeY = n.y * height + parallaxY;

        ctx.strokeStyle = `rgba(82, 106, 120, ${n.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, n.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(185, 101, 75, ${n.opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and Draw Particles
      particles.forEach((p) => {
        // Natural floating motion
        if (!prefersReducedMotion) {
          p.angle += 0.001;
          p.baseX += Math.cos(p.angle) * p.driftSpeed;
          p.baseY += Math.sin(p.angle) * p.driftSpeed;
        }

        // Reset if drifted offscreen
        if (p.baseX < -10) p.baseX = width + 10;
        if (p.baseX > width + 10) p.baseX = -10;
        if (p.baseY < -10) p.baseY = height + 10;
        if (p.baseY > height + 10) p.baseY = -10;

        // Mouse influence based on Z-depth layers
        let offsetX = 0;
        let offsetY = 0;

        if (!prefersReducedMotion && mouse.active) {
          const dx = mouse.x - p.baseX;
          const dy = mouse.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInfluence = 180;

          if (dist < maxInfluence) {
            const force = (maxInfluence - dist) / maxInfluence;
            // Shift foreground particles slightly stronger, distant stars extremely subtle
            const shiftAmt = force * 28 * p.depth;
            offsetX = -(dx / dist) * shiftAmt;
            offsetY = -(dy / dist) * shiftAmt;
          }
        }

        // Parallax depth calculation
        const parallaxX = !prefersReducedMotion ? (mouse.x - width / 2) * 0.02 * p.depth : 0;
        const parallaxY = !prefersReducedMotion ? (mouse.y - height / 2) * 0.02 * p.depth : 0;

        p.x = p.baseX + offsetX + parallaxX;
        p.y = p.baseY + offsetY + parallaxY;

        // Render layer-specific twinkling and styles
        let currentOpacity = p.opacity;

        if (p.layer === 1) {
          // Subtle stars twinkling
          p.twinklePhase += p.twinkleSpeed;
          currentOpacity = Math.max(0.1, p.opacity + Math.sin(p.twinklePhase) * 0.12);
        }

        // Feature particle glow accents
        if (p.layer === 3 && p.blur) {
          ctx.shadowBlur = p.blur;
          ctx.shadowColor = p.colorBase.indexOf('185') !== -1 ? '#B9654B' : '#FFF9F4';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `${p.colorBase}${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset shadow blur for next frame
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="interactive-background-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
