'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';

export default function FamiverseGraph() {
  const fgRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // 星球数据
  const graphData = {
    nodes: [
      { id: 'Character', name: '德行', color: '#ff6666', info: '专注于谦虚、诚实、值得信赖...' },
      { id: 'Wisdom', name: '智慧', color: '#66ccff', info: '智力发展、人际关系、知识...' },
      { id: 'Physical Well-being', name: '身体', color: '#66ff66', info: '身心健康、强健的身体和心灵...' },
      { id: 'Aesthetics', name: '美育', color: '#ffcc66', info: '对美的感知、创造和欣赏...' },
      { id: 'Practice', name: '实践', color: '#cc99ff', info: '动手实验、项目、劳动、实践...' },
      { id: 'Inner Well-being', name: '正念', color: '#ffffff', info: '内心平静、人格修养、韧性...' }
    ],
    links: [
      { source: 'Character', target: 'Wisdom' },
      { source: 'Character', target: 'Physical Well-being' },
      { source: 'Character', target: 'Aesthetics' },
      { source: 'Character', target: 'Practice' },
      { source: 'Character', target: 'Inner Well-being' },
      { source: 'Wisdom', target: 'Physical Well-being' },
      { source: 'Wisdom', target: 'Aesthetics' },
      { source: 'Wisdom', target: 'Practice' },
      { source: 'Wisdom', target: 'Inner Well-being' },
      { source: 'Physical Well-being', target: 'Aesthetics' },
      { source: 'Physical Well-being', target: 'Practice' },
      { source: 'Physical Well-being', target: 'Inner Well-being' },
      { source: 'Aesthetics', target: 'Practice' },
      { source: 'Aesthetics', target: 'Inner Well-being' },
      { source: 'Practice', target: 'Inner Well-being' }
    ]
  };

  // 自定义节点对象
  const nodeObject = (node: any) => {
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: node.color });
    const mesh = new THREE.Mesh(geometry, material);
    
    // 添加自转动画
    const animate = () => {
      mesh.rotation.y += 0.005;
      requestAnimationFrame(animate);
    };
    animate();
    
    return mesh;
  };

  // 添加星空背景
  useEffect(() => {
    if (fgRef.current) {
      const scene = fgRef.current.scene();
      
      // 创建星空背景
      const starsGeometry = new THREE.BufferGeometry();
      const starsVertices = [];
      const starsSizes: number[] = [];
      const starsOpacities: number[] = [];
      const starsFlickerSpeeds: number[] = [];
      
      for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
        
        // 随机大小
        const size = Math.random() * 0.3 + 0.05;
        starsSizes.push(size);
        
        // 初始透明度
        starsOpacities.push(Math.random() * 0.5 + 0.5);
        
        // 随机闪烁速度
        starsFlickerSpeeds.push(Math.random() * 0.02 + 0.005);
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));
      
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
      });
      
      const starField = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(starField);
      
      // 星空微微旋转和闪烁
      const animate = () => {
        starField.rotation.x += 0.0001;
        starField.rotation.y += 0.0001;
        
        // 更新星星闪烁效果
        const sizes = starField.geometry.attributes.size.array;
        
        for (let i = 0; i < sizes.length; i++) {
          // 更新透明度 - 模拟闪烁
          starsOpacities[i] += Math.sin(Date.now() * starsFlickerSpeeds[i]) * 0.01;
          
          // 保持透明度在合理范围内
          if (starsOpacities[i] > 1) starsOpacities[i] = 1;
          if (starsOpacities[i] < 0.3) starsOpacities[i] = 0.3;
          
          // 根据透明度轻微调整大小，使闪烁效果更明显
          sizes[i] = starsSizes[i] * starsOpacities[i];
        }
        
        starField.geometry.attributes.size.needsUpdate = true;
        starField.material.opacity = 0.8 + Math.sin(Date.now() * 0.001) * 0.2;
        
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, []);

  return (
    <div className="w-full h-screen relative">
      <div className={`absolute top-5 left-5 p-3 bg-white/95 dark:bg-black/90 rounded-lg shadow-lg z-10 ${selectedNode ? 'block' : 'hidden'}`}>
        {selectedNode && (
          <>
            <h3 className="text-lg font-bold mb-2">{selectedNode.name}</h3>
            <p className="text-sm">{selectedNode.info}</p>
          </>
        )}
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeThreeObject={nodeObject}
        backgroundColor="#000000"
        onNodeClick={(node) => setSelectedNode(node)}
        nodeLabel={(node: any) => `${node.name}`}
        linkWidth={1}
        linkOpacity={0.5}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        controlType="orbit"
      />
    </div>
  );
}