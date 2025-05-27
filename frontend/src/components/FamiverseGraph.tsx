'use client';

import * as THREE from 'three';
import React, { useRef, useState, useCallback } from 'react';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';

import { useStarBackground } from '../hooks/useStarBackground';
import { NodeData, LinkData, ForceGraphRef } from '../types/graph';
import { useApiGraphData } from '@/hooks/useApiGraphData';
import MOSS from './MOSS';

export default function FamiverseGraph() {
  const fgRef: ForceGraphRef = useRef(undefined);
  const [initialFocusDone, setInitialFocusDone] = useState(false);
  const [isInteractingDisabled, setIsInteractingDisabled] = useState(true);

  const graphData = useApiGraphData();

  useStarBackground(fgRef);

  // 初始化完毕后，聚焦到 home-planet 节点
  const handleEngineStop = useCallback(() => {
    if (!initialFocusDone && fgRef.current && graphData.nodes.length > 0) {
      const homePlanetNode = graphData.nodes.find(node => node.id === 'home-planet');

      if (homePlanetNode && typeof homePlanetNode.x === 'number' && typeof homePlanetNode.y === 'number' && typeof homePlanetNode.z === 'number') {
        const distance = 10;
        const camX = homePlanetNode.x;
        const camY = homePlanetNode.y - distance / 2; // 稍微降低视角，使得星球挡住一部分
        const camZ = homePlanetNode.z + distance;
        const animationDuration = 6000; // 动画时长

        // 开始动画前确认交互是禁用的 (虽然默认是 true，但明确一下)
        setIsInteractingDisabled(true);

        fgRef.current.cameraPosition(
          { x: camX, y: camY, z: camZ },
          { x: homePlanetNode.x, y: homePlanetNode.y + 16, z: homePlanetNode.z },
          animationDuration
        );

        // 动画结束后启用交互
        setTimeout(() => {
          setIsInteractingDisabled(false);
        }, animationDuration + 100); // 稍微延迟一点确保动画完成

        setInitialFocusDone(true);
      } else {
         console.warn('Home planet node or its position not found after engine stop.');
         setIsInteractingDisabled(false); // 如果找不到节点或位置无效，也解除禁用
      }
    } else if (!initialFocusDone) {
        // 如果引擎停止时条件不满足（例如没有节点），也解除禁用
        setIsInteractingDisabled(false);
    }
  }, [graphData.nodes, initialFocusDone]);

  const nodeObject = useCallback((node: NodeData) => {
    const geometry = new THREE.SphereGeometry(8, 32, 32);
    const material = new THREE.MeshLambertMaterial({
      color: node.color
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { nodeId: node.id };

    const animate = () => {
      mesh.rotation.y += 0.001;
      requestAnimationFrame(animate);
    };
    animate();

    return mesh;
  }, []);

  // Hnadle the click event for nodes
  const [mossVisible, setMossVisible] = useState(false); // 新增：MOSS 显示状态
  const [mossPlanetInfo, setMossPlanetInfo] = useState<{ name: string; description: string } | undefined>(undefined); // 新增：MOSS 展示内容

  const handleNodeClick = useCallback((node: NodeObject<NodeData>) => {
    if (isInteractingDisabled) return; // 如果交互被禁用，则不处理点击

    const nodeData = node as NodeData;

    if (nodeData && nodeData.name && nodeData.description !== undefined) {
        setMossPlanetInfo({ name: nodeData.name, description: nodeData.description });
        setMossVisible(true);
    }

    // Focus on the node
    if (typeof node.x === 'number' && typeof node.y === 'number' && typeof node.z === 'number') {
      const distance = 50;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      const newPos = { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio };

      fgRef.current?.cameraPosition(
        newPos,
        { x: node.x, y: node.y, z: node.z },
        2500
      );
    } else {
      console.warn('Node coordinates are not available yet for focusing.');
    }
  }, [isInteractingDisabled]); // 添加 isInteractingDisabled 作为依赖

  // 新增：关闭 MOSS 的方法
  const handleMossClose = () => {
      setMossVisible(false);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <MOSS 
        visible={mossVisible} 
        planetInfo={mossPlanetInfo} 
        onClose={handleMossClose}
        onOpen={() => setMossVisible(true)} 
      />

      <ForceGraph3D<NodeData, LinkData>
        ref={fgRef}
        graphData={graphData}
        nodeThreeObject={nodeObject}
        backgroundColor="#000000"
        onNodeClick={handleNodeClick}
        nodeLabel={(node: NodeObject<NodeData>) => `${node.name}`}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={0.1}
        enableNodeDrag={!isInteractingDisabled}
        enablePointerInteraction={!isInteractingDisabled}
        enableNavigationControls={!isInteractingDisabled}
        cooldownTicks={100}
        onEngineStop={handleEngineStop}
      />
    </div>
  );
}
