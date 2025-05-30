'use client';

import * as THREE from 'three';
import React, { useRef, useState, useCallback } from 'react';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';

import { useStarBackground } from '../hooks/useStarBackground';
import { NodeData, ForceGraphRef } from '../types/graph';
import { useApiGraphData } from '@/hooks/useApiGraphData';
import MOSS from './MOSS';

export default function FamiverseGraph() {
  const fgRef: ForceGraphRef = useRef(undefined);
  const [initialFocusDone, setInitialFocusDone] = useState(false);
  const [isInteractingDisabled, setIsInteractingDisabled] = useState(true);
  const [currentFocusedNodeId, setCurrentFocusedNodeId] = useState<string | null>(null);

  const graphData = useApiGraphData();

  useStarBackground(fgRef);

  // 初始化完毕后，聚焦到 home-planet 节点
  const handleEngineStop = useCallback(() => {
    if (!initialFocusDone && fgRef.current && graphData.nodes.length > 0) {
      const homePlanetNode = graphData.nodes.find(node => node.documentId === 'home-planet');

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
          // 设置当前对准的星球为 home-planet
          setCurrentFocusedNodeId('home-planet');
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
    mesh.userData = { nodeId: node.documentId };

    const animate = () => {
      mesh.rotation.y += 0.001;
      requestAnimationFrame(animate);
    };
    animate();

    return mesh;
  }, []);

  const [mossVisible, setMossVisible] = useState(false);
  const [mossPlanetInfo, setMossPlanetInfo] = useState<{ name: string; description: string } | undefined>(undefined); // 新增：MOSS 展示内容

  const handleNodeClick = useCallback((node: NodeObject<NodeData>) => {
    if (isInteractingDisabled)
      return;

    const nodeData = node as NodeData;
    const nodeId = nodeData.documentId as string;

    // 先保存节点信息，但不立即显示 MOSS
    if (nodeData && nodeData.name && nodeData.description !== undefined) {
        setMossPlanetInfo({ name: nodeData.name, description: nodeData.description });
    }

    // 检查是否点击的是当前已对准的星球
    if (nodeId === currentFocusedNodeId) {
      // 如果是同一个星球，直接显示MOSS弹窗，无需动画
      setMossVisible(true);
      return;
    }

    // 如果是不同的星球，需要进行动画
    if (typeof node.x === 'number' && typeof node.y === 'number' && typeof node.z === 'number') {
      const distance = 50;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      const newPos = { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio };
      const animationDuration = 3000; // 点击星球的动画时长

      // 禁用交互，防止动画过程中的操作
      setIsInteractingDisabled(true);

      fgRef.current?.cameraPosition(
        newPos,
        { x: node.x, y: node.y, z: node.z },
        animationDuration
      );
      
      // 在动画完成后显示 MOSS 弹窗，并更新当前对准的星球
      if (nodeData && nodeData.name && nodeData.description !== undefined) {
        setTimeout(() => {
          setMossVisible(true);
          setIsInteractingDisabled(false); // 重新启用交互
          setCurrentFocusedNodeId(nodeId); // 更新当前对准的星球ID
        }, animationDuration + 100); // 稍微延迟一点确保动画完成
      }
    } else {
      console.warn('Node coordinates are not available yet for focusing.');
      // 如果无法获取坐标，直接显示 MOSS 弹窗
      if (nodeData && nodeData.name && nodeData.description !== undefined) {
        setMossVisible(true);
      }
    }
  }, [isInteractingDisabled, currentFocusedNodeId]); // 添加 currentFocusedNodeId 作为依赖

  // Add function to focus on home planet
  const focusOnHomePlanet = useCallback(() => {
    const homePlanetNode = graphData.nodes.find(node => node.documentId === 'home-planet');
    if (homePlanetNode) {
      handleNodeClick(homePlanetNode);
    }
  }, [graphData.nodes, handleNodeClick]);

  return (
    <div className="w-full h-screen">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeThreeObject={nodeObject}
        backgroundColor="#000000"
        onNodeClick={handleNodeClick}
        nodeLabel={(node: NodeObject<NodeData>) => {
          const name = node.name || '';
          const description = node.description || '';
          return `<div style="text-align: center;">${name}</div><div style="text-align: left;">${description}</div>`;
        }}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={0.1}
        enableNodeDrag={!isInteractingDisabled}
        enablePointerInteraction={!isInteractingDisabled}
        enableNavigationControls={!isInteractingDisabled}
        cooldownTicks={100}
        onEngineStop={handleEngineStop}
      />
      
      <MOSS 
        visible={mossVisible} 
        planetInfo={mossPlanetInfo} 
        onClose={() => setMossVisible(false)}
        onOpen={() => setMossVisible(true)}
        onGoHome={focusOnHomePlanet}
      />
    </div>
  );
}
