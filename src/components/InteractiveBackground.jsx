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

    // Particle class definition
    const colors = [
      'rgba(185, 101, 75, ', // Terracotta
      'rgba(82, 106, 120, ',  // Muted blue-gray
      'rgba(243, 228, 216, ', // Champagne/Muted peach
      'rgba(255, 249, 244, ', // Soft cream
    ];

    const particleCount = 65;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random(); // 0 (background) to 1 (foreground)
      particles.push({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        size: Math.random() * 2 + 1,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.15 + 0.05,
        targetOpacity: Math.random() * 0.15 + 0.05,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        depth: depth,
        // Drift variables
        angle: Math.random() * Math.PI * 2,
        driftSpeed: prefersReducedMotion ? 0 : Math.random() * 0.15 + 0.05,
      });
    }

    // Civic Data Nodes
    const nodes = [
      { x: 0.25, y: 0.3, r: 6, opacity: 0.12 },
      { x: 0.75, y: 0.2, r: 4, opacity: 0.08 },
      { x: 0.85, y: 0.75, r: 5, opacity: 0.1 },
      { x: 0.15, y: 0.8, r: 4, opacity: 0.08 },
    ];

    // Animation Loop
    const render = () => {
      // Clear with atmospheric haze color matches F3E4D8
      ctx.fillStyle = '#F3E4D8';
      ctx.fillRect(0, 0, width, height);

      // Lerping mouse coordinates for smooth inertia
      if (!prefersReducedMotion) {
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;
      }

      // Draw faint connections between a few particles to simulate civic nodes
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(185, 101, 75, 0.03)';
      for (let i = 0; i < 6; i++) {
        const p1 = particles[i];
        const p2 = particles[i + 1];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw static civic nodes in the distance
      nodes.forEach((n) => {
        const parallaxX = !prefersReducedMotion ? (mouse.x - width / 2) * 0.015 : 0;
        const parallaxY = !prefersReducedMotion ? (mouse.y - height / 2) * 0.015 : 0;
        
        const nodeX = n.x * width + parallaxX;
        const nodeY = n.y * height + parallaxY;

        ctx.strokeStyle = `rgba(82, 106, 120, ${n.opacity})`;
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
        // Natural drift over time
        if (!prefersReducedMotion) {
          p.angle += 0.002;
          p.baseX += Math.cos(p.angle) * p.driftSpeed;
          p.baseY += Math.sin(p.angle) * p.driftSpeed;
        }

        // Reset if drifted offscreen
        if (p.baseX < 0) p.baseX = width;
        if (p.baseX > width) p.baseX = 0;
        if (p.baseY < 0) p.baseY = height;
        if (p.baseY > height) p.baseY = 0;

        // Calculate Mouse influence based on depth layers
        // Foreground particles respond noticeably, background particles are almost static
        let offsetX = 0;
        let offsetY = 0;

        if (!prefersReducedMotion && mouse.active) {
          const dx = mouse.x - p.baseX;
          const dy = mouse.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInfluence = 150;

          if (dist < maxInfluence) {
            const force = (maxInfluence - dist) / maxInfluence;
            // Shift particles gently away/towards cursor depending on depth layer
            const shiftAmt = force * 35 * p.depth;
            offsetX = -(dx / dist) * shiftAmt;
            offsetY = -(dy / dist) * shiftAmt;
          }
        }

        // Apply Parallax effect based on depth layer
        const parallaxX = !prefersReducedMotion ? (mouse.x - width / 2) * 0.025 * p.depth : 0;
        const parallaxY = !prefersReducedMotion ? (mouse.y - height / 2) * 0.025 * p.depth : 0;

        p.x = p.baseX + offsetX + parallaxX;
        p.y = p.baseY + offsetY + parallaxY;

        // Soft fading in/out animation
        if (p.opacity < p.targetOpacity) {
          p.opacity += p.fadeSpeed;
        } else {
          p.opacity -= p.fadeSpeed;
          if (p.opacity <= 0.02) {
            p.targetOpacity = Math.random() * 0.15 + 0.05;
            p.baseX = Math.random() * width;
            p.baseY = Math.random() * height;
          }
        }

        ctx.fillStyle = `${p.colorBase}${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

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
