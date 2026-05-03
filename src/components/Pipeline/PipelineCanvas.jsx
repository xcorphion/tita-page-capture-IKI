
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

const SkullWireframe = () => {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={ref}>
      {/* Base craniana simplificada */}
      <mesh scale={[1, 1.2, 1]}>
        <sphereGeometry args={[1.4, 10, 8]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#8B0000" />
      </mesh>

      {/* Maxilar simplificado */}
      <mesh position={[0, -0.8, 0.4]}>
        <boxGeometry args={[1.2, 0.8, 1]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#8B0000" />
      </mesh>

      {/* Cavidades oculares */}
      <mesh position={[-0.5, 0.2, 1.2]}>
        <torusGeometry args={[0.25, 0.05, 6, 16]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#8B0000" />
      </mesh>
      <mesh position={[0.5, 0.2, 1.2]}>
        <torusGeometry args={[0.25, 0.05, 6, 16]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#8B0000" />
      </mesh>

      {/* Rede neural interna */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => {
          const pos = [
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5
          ];
          return (
            <group key={i}>
              <mesh position={pos}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial color="#B22222" />
              </mesh>
              {/* Lines connecting nodes */}
              {i > 0 && (
                <line>
                  <bufferGeometry attach="geometry">
                    <float32BufferAttribute 
                      attach="attributes-position" 
                      args={[new Float32Array([...pos, 0,0,0]), 3]} 
                    />
                  </bufferGeometry>
                  <lineBasicMaterial attach="material" color="#B22222" transparent opacity={0.6} />
                </line>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

const PipelineCanvas = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="h-[520px] w-full border border-accent-dim relative overflow-hidden">
      <Canvas 
        dpr={[1, 2]}
        gl={{ antialias: !isMobile, stencil: false, depth: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <color attach="background" args={['#080404']} />
        
        <ambientLight intensity={0.5} />
        <SkullWireframe />

        <EffectComposer disableNormalPass>
          <Bloom intensity={1.2} luminanceThreshold={0.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default PipelineCanvas;
