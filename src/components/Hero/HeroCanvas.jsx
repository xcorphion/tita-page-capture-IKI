
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Edges, Float, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

const EyeWireframe = () => {
  const groupRef = useRef();
  const irisRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Auto rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
    }

    // Mouse tracking (smooth)
    const targetX = (state.mouse.y * Math.PI) / 10;
    const targetY = (state.mouse.x * Math.PI) / 10;
    if (groupRef.current) {
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.03;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.03;
    }

    // Iris pulsing
    if (irisRef.current) {
      const s = 0.97 + Math.sin(time * 2) * 0.03;
      irisRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Globo ocular */}
      <mesh>
        <sphereGeometry args={[2, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#8B0000" threshold={15} />
      </mesh>

      {/* 2. Íris */}
      <group ref={irisRef} rotation={[0.1, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.9, 0.08, 8, 32]} />
          <meshBasicMaterial transparent opacity={0} />
          <Edges color="#8B0000" />
        </mesh>
        
        {/* Círculos concêntricos */}
        {[0.7, 0.5, 0.3].map((radius, i) => (
          <mesh key={i}>
            <ringGeometry args={[radius, radius + 0.01, 32]} />
            <meshBasicMaterial color="#8B0000" side={THREE.DoubleSide} wireframe />
          </mesh>
        ))}
      </group>

      {/* 3. Pupila */}
      <mesh>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color="#8B0000" />
      </mesh>

      {/* 4. Nervos ópticos / cílios */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(Math.cos(angle) * 2, Math.sin(angle) * 2, 0),
          new THREE.Vector3(Math.cos(angle) * 3, Math.sin(angle) * 3, Math.random() * 2),
          new THREE.Vector3(Math.cos(angle) * 4, Math.sin(angle) * 4, Math.random() * -1)
        );
        const points = curve.getPoints(50);
        return (
          <line key={i}>
            <bufferGeometry attach="geometry">
              <float32BufferAttribute 
                attach="attributes-position" 
                args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]} 
              />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#3D0000" transparent opacity={0.6} />
          </line>
        );
      })}
    </group>
  );
};

const Particles = ({ count = 1500 }) => {
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      for (let i = 0; i < count; i++) {
        ref.current.geometry.attributes.position.array[i * 3 + 1] += Math.sin(time + i) * 0.0003;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.008} color="#3D0000" sizeAttenuation={false} transparent opacity={0.4} />
    </points>
  );
};

const Connections = () => {
  // Simple neural-like connections between some particles
  // For brevity and performance, we'll just draw a few random lines
  return Array.from({ length: 35 }).map((_, i) => (
    <line key={i}>
      <bufferGeometry attach="geometry">
        <float32BufferAttribute 
          attach="attributes-position" 
          args={[new Float32Array([
            (Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10,
            (Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10
          ]), 3]} 
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#8B0000" transparent opacity={0.15} />
    </line>
  ));
}

const HeroCanvas = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
      <Canvas 
        dpr={[1, 2]}
        gl={{ antialias: !isMobile, stencil: false, depth: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.5} />
        
        <EyeWireframe />
        <Particles count={isMobile ? 300 : 1500} />
        <Connections />

        {!isMobile && (
          <EffectComposer disableNormalPass>
            <Bloom 
              intensity={0.8} 
              luminanceThreshold={0.1} 
              luminanceSmoothing={0.9} 
            />
            <ChromaticAberration offset={[0.002, 0.002]} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
