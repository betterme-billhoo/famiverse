import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ForceGraphRef, ForceGraphRefWithInternal } from '../types/graph';

export function useStarBackground(fgRef: ForceGraphRef): void {
  const animationFrameId = useRef<number | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    // 延迟执行，等待 fgRef.current 可用
    const timer = setTimeout(() => {
        let scene: THREE.Scene | undefined;

        // 尝试获取 scene (合并逻辑)
        if (fgRef.current) {
            if (typeof fgRef.current.scene === 'function') {
                scene = fgRef.current.scene();
            } else if ((fgRef.current as ForceGraphRefWithInternal)._scene) {
                console.warn('Using internal _scene property for star background. Consider checking ForceGraphMethods type.');
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
        const starsSizes: number[] = [];
        const starsOpacities: number[] = [];
        const starsFlickerSpeeds: number[] = [];

        for (let i = 0; i < 10000; i++) {
          const x = (Math.random() - 0.5) * 2000;
          const y = (Math.random() - 0.5) * 2000;
          const z = (Math.random() - 0.5) * 2000;
          starsVertices.push(x, y, z);
          const size = Math.random() * 0.3 + 0.05;
          starsSizes.push(size);
          starsOpacities.push(Math.random() * 0.5 + 0.5);
          starsFlickerSpeeds.push(Math.random() * 0.02 + 0.005);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));

        const starsMaterial = new THREE.PointsMaterial({
          color: 0xffffff,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.8,
        });

        const starField = new THREE.Points(starsGeometry, starsMaterial);
        starFieldRef.current = starField; // 保存引用
        scene.add(starField);

        // --- 星空动画逻辑 ---
        const animate = () => {
          if (!starFieldRef.current) return; // 检查引用是否存在

          starFieldRef.current.rotation.x += 0.0001;
          starFieldRef.current.rotation.y += 0.0001;

          const sizes = starFieldRef.current.geometry.attributes.size.array as Float32Array;
          const opacities = starsOpacities;
          const baseSizes = starsSizes;
          const flickerSpeeds = starsFlickerSpeeds;

          for (let i = 0; i < sizes.length; i++) {
            opacities[i] += Math.sin(Date.now() * flickerSpeeds[i]) * 0.01;
            if (opacities[i] > 1) opacities[i] = 1;
            if (opacities[i] < 0.3) opacities[i] = 0.3;
            sizes[i] = baseSizes[i] * opacities[i];
          }

          starFieldRef.current.geometry.attributes.size.needsUpdate = true;
          (starFieldRef.current.material as THREE.PointsMaterial).opacity = 0.8 + Math.sin(Date.now() * 0.001) * 0.2;
          (starFieldRef.current.material as THREE.PointsMaterial).needsUpdate = true;

          animationFrameId.current = requestAnimationFrame(animate);
        };
        animate();

    }, 100); // 延迟 100ms，给 ForceGraph3D 初始化时间

    // 清理函数
    return () => {
      clearTimeout(timer); // 清除定时器
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
        scene?.remove(starFieldRef.current); // 从场景中移除
        starFieldRef.current.geometry.dispose();
        (starFieldRef.current.material as THREE.Material).dispose(); // 明确类型
        starFieldRef.current = null; // 清除引用
      }
    };

  }, [fgRef]); // 依赖 fgRef
}