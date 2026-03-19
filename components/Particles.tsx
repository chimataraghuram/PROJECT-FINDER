import React, { useEffect, useRef } from 'react';

const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const isMobile = window.innerWidth < 768;

    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: isMobile ? 80 : 150
    };

    const colors = [
      '#EF4444', // Red 500
      '#F59E0B', // Orange 500
      '#FBBF24', // Yellow 400
      '#DC2626', // Red 600
      '#EA580C'  // Orange 600
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      width: number;
      height: number;
      speedX: number;
      speedY: number;
      color: string;
      angle: number;
      spin: number;
      density: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.width = Math.random() * (isMobile ? 10 : 18) + 8;
        this.height = 2;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = Math.random() * 0.02 - 0.01;
        this.density = (Math.random() * (isMobile ? 15 : 30)) + 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += this.spin;

        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            this.x -= directionX;
            this.y -= directionY;
          }
        }

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;

        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = isMobile ? 0.4 : 0.5;

        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 2);
        ctx.fill();

        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      const densityMultiplier = isMobile ? 15000 : 8000;
      const numberOfParticles = (canvas.width * canvas.height) / densityMultiplier;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    init();
    animate();

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
      }
    };

    const handleInteractionEnd = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      resize();
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchMove);
    window.addEventListener('touchend', handleInteractionEnd);
    window.addEventListener('mouseout', handleInteractionEnd);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
      window.removeEventListener('mouseout', handleInteractionEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};

export default Particles;


