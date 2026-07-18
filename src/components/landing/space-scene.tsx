"use client";

import { Float, Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#67e8f9" />
      <pointLight position={[-10, -5, -10]} intensity={0.9} color="#8b5cf6" />
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[1.3, 1]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#22d3ee" emissiveIntensity={0.5} wireframe />
        </mesh>
      </Float>
      <Sparkles count={40} scale={3} size={2} speed={0.4} color="#ffffff" />
    </>
  );
}

export function SpaceScene() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative h-[360px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-premium backdrop-blur-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.18),transparent_25%)]" />
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Scene />
        </Canvas>
      </Suspense>
    </motion.div>
  );
}
