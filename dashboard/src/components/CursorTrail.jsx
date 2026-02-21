import { useEffect, useRef } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse position
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      // Create new particles on mouse move
      if (Math.random() > 0.7) {
        particlesRef.current.push(new Particle(e.clientX, e.clientY));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size = Math.max(0, this.size - 0.05);
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        
        // Green glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(29, 185, 84, ${this.life})`;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29, 185, 84, ${this.life})`;
        ctx.fill();
        
        ctx.restore();
      }

      isAlive() {
        return this.life > 0 && this.size > 0;
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw();
        return particle.isAlive();
      });

      // Limit particle count for performance
      if (particlesRef.current.length > 100) {
        particlesRef.current.splice(0, particlesRef.current.length - 100);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default CursorTrail;