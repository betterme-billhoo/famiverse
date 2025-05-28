import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ForceGraphRef, ForceGraphRefWithInternal } from '../types/graph';

// --- GLSL Shaders ---
const vertexShader = `
  attribute float baseSize;
  attribute float baseOpacity;
  attribute float flickerSpeed;
  uniform float time;
  varying float vOpacity; // Pass opacity to fragment shader

  void main() {
    // Calculate flicker effect
    float flicker = sin(time * 1000.0 * flickerSpeed) * 0.5 + 0.5; // Flicker between 0.5 and 1.0
    vOpacity = baseOpacity * (0.5 + flicker * 0.5); // Modulate base opacity (range: baseOpacity * 0.75 to baseOpacity * 1.0)

    // Calculate final size
    float finalSize = baseSize * (0.7 + flicker * 0.3); // Modulate base size slightly

    // Standard point calculation
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = finalSize * (300.0 / -mvPosition.z); // Adjust size based on distance
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vOpacity; // Receive opacity from vertex shader
  uniform vec3 color;     // Base color

  void main() {
    // Add circular shape
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard; // Discard pixels outside circle

    gl_FragColor = vec4(color, vOpacity);
  }
`;
// --- End Shaders ---


export function useStarBackground(fgRef: ForceGraphRef): void {
  const animationFrameId = useRef<number | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null); // Ref for the material

  useEffect(() => {
    const timer = setTimeout(() => {
        let scene: THREE.Scene | undefined;
        if (fgRef.current) {
            if (typeof fgRef.current.scene === 'function') {
                scene = fgRef.current.scene();
            } else if ((fgRef.current as ForceGraphRefWithInternal)._scene) {
                scene = (fgRef.current as ForceGraphRefWithInternal)._scene;
            }
        }
        if (!scene) {
          console.error('Could not access the scene from ForceGraph3D ref for star background.');
          return;
        }

        // --- 星空创建逻辑 ---
        const starsGeometry = new THREE.BufferGeometry();
        const starsVertices: number[] = [];
        const starsBaseSizes: number[] = []; // Renamed
        const starsBaseOpacities: number[] = []; // Renamed
        const starsFlickerSpeeds: number[] = [];
        const starCount = 100000; // 星星数量
        const sphereRadius = 35000;

        for (let i = 0; i < starCount; i++) {
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const radius = sphereRadius * Math.cbrt(Math.random());
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          starsVertices.push(x, y, z);

          // Store base values for attributes
          starsBaseSizes.push(Math.random() * 15 + 5); // Increase base size slightly for visibility with shader
          starsBaseOpacities.push(Math.random() * 0.4 + 0.6); // Base opacity (0.6 to 1.0)
          starsFlickerSpeeds.push(Math.random() * 0.02 + 0.005);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        // Set attributes for the shader
        starsGeometry.setAttribute('baseSize', new THREE.Float32BufferAttribute(starsBaseSizes, 1));
        starsGeometry.setAttribute('baseOpacity', new THREE.Float32BufferAttribute(starsBaseOpacities, 1));
        starsGeometry.setAttribute('flickerSpeed', new THREE.Float32BufferAttribute(starsFlickerSpeeds, 1));

        // Create ShaderMaterial
        const starsMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(0xffffff) },
          },
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false, // Often good for transparent particles
          blending: THREE.AdditiveBlending, // Makes stars brighter when overlapping
        });
        materialRef.current = starsMaterial; // Store material reference

        const starField = new THREE.Points(starsGeometry, starsMaterial);
        starFieldRef.current = starField;
        scene.add(starField);

        // --- 星空动画逻辑 (Optimized) ---
        const clock = new THREE.Clock(); // Use THREE.Clock for time
        const animate = () => {
          if (!starFieldRef.current || !materialRef.current) return;

          // Only update rotation and time uniform
          starFieldRef.current.rotation.y += 0.00005; // Slow down rotation slightly

          // Update time uniform for shader
          materialRef.current.uniforms.time.value = clock.getElapsedTime();

          animationFrameId.current = requestAnimationFrame(animate);
        };
        animate();

    }, 100);

    // 清理函数
    return () => {
      clearTimeout(timer);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (starFieldRef.current && fgRef.current) {
        let scene: THREE.Scene | undefined;
         if (typeof fgRef.current.scene === 'function') {
            scene = fgRef.current.scene();
        } else if ((fgRef.current as ForceGraphRefWithInternal)._scene) {
            scene = (fgRef.current as ForceGraphRefWithInternal)._scene;
        }
        if (scene && starFieldRef.current) { // Check if scene and starfield exist before removing
            scene.remove(starFieldRef.current);
        }
        starFieldRef.current?.geometry.dispose(); // Use optional chaining
        materialRef.current?.dispose(); // Dispose shader material
        starFieldRef.current = null;
        materialRef.current = null;
      }
    };

  }, [fgRef]);
}