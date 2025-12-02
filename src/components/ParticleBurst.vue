<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  currentX?: number;
  currentY?: number;
  currentOpacity?: number;
  currentScale?: number;
  currentRotation?: number;
  startTime: number;
  duration: number;
}

interface BurstOptions {
  count?: number;
  color?: string;
  secondaryColor?: string;
  spread?: number;
  size?: number;
  duration?: number;
}

const particles = ref<Particle[]>([]);
let animationFrameId: number | null = null;

const animate = (currentTime: number) => {
  if (particles.value.length === 0) {
    animationFrameId = null;
    return;
  }

  // Update all particles in one loop
  particles.value.forEach((p) => {
    const elapsed = currentTime - p.startTime;
    const progress = elapsed / p.duration;

    if (progress < 1) {
      const easeOut = 1 - Math.pow(1 - progress, 3);
      p.currentX = p.x + p.vx * easeOut;
      p.currentY = p.y + p.vy * easeOut - progress * 30;
      p.currentOpacity = 1 - progress;
      p.currentScale = 1 - progress * 0.5;
      p.currentRotation = p.rotation + progress * 180;
    }
  });

  // Remove expired particles
  const now = currentTime;
  particles.value = particles.value.filter((p) => {
    return (now - p.startTime) < p.duration;
  });

  // Continue animation if particles remain
  if (particles.value.length > 0) {
    animationFrameId = requestAnimationFrame(animate);
  } else {
    animationFrameId = null;
  }
};

const burst = (x: number, y: number, options: BurstOptions = {}) => {
  const {
    count = 8,
    color = '#00ffaa',
    secondaryColor = '#00aaff',
    spread = 60,
    size = 6,
    duration = 600,
  } = options;

  const startTime = performance.now();
  const newParticles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = ((Math.PI * 2) / count) * i + (Math.random() - 0.5) * 0.5;
    const velocity = spread + Math.random() * 20;
    const particleSize = size + Math.random() * 4;

    newParticles.push({
      id: Date.now() + i + Math.random() + '',
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: particleSize,
      color: Math.random() > 0.5 ? color : secondaryColor,
      opacity: 1,
      rotation: Math.random() * 360,
      startTime,
      duration,
      currentX: x,
      currentY: y,
      currentOpacity: 1,
      currentScale: 1,
      currentRotation: 0,
    });
  }

  particles.value.push(...newParticles);

  // Start animation loop if not already running
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(animate);
  }
};

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});

defineExpose({ burst });
</script>

<template>
  <div class="particle-container">
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: (particle.currentX || particle.x) + 'px',
        top: (particle.currentY || particle.y) + 'px',
        width: particle.size + 'px',
        height: particle.size + 'px',
        backgroundColor: particle.color,
        opacity: particle.currentOpacity || particle.opacity,
        transform:
          'translate(-50%, -50%) scale(' +
          (particle.currentScale || 1) +
          ') rotate(' +
          (particle.currentRotation || particle.rotation) +
          'deg)',
        boxShadow: '0 0 ' + particle.size * 2 + 'px ' + particle.color,
      }"
    ></div>
  </div>
</template>
