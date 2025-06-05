// Copyright 2025 Bill Hoo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use client';

import * as THREE from 'three';
import React, { useRef, useState, useCallback } from 'react';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';

import { useStarBackground } from '../hooks/useStarBackground';
import { NodeData, ForceGraphRef } from '../types/graph';
import { useApiGraphData } from '@/hooks/useApiGraphData';
import MOSS from './MOSS/MOSS';

export default function FamiverseGraph() {
  const fgRef: ForceGraphRef = useRef(undefined);
  const [initialFocusDone, setInitialFocusDone] = useState(false);
  const [isInteractingDisabled, setIsInteractingDisabled] = useState(true);
  const [currentFocusedNodeId, setCurrentFocusedNodeId] = useState<string | null>(null);
  // Add new state for showing welcome guide
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  const graphData = useApiGraphData();

  useStarBackground(fgRef);

  // Initialize and focus on home-planet node after engine stops
  const handleEngineStop = useCallback(() => {
    if (!initialFocusDone && fgRef.current && graphData.nodes.length > 0) {
      const homePlanetNode = graphData.nodes.find(node => node.documentId === 'home-planet');

      if (homePlanetNode && typeof homePlanetNode.x === 'number' && typeof homePlanetNode.y === 'number' && typeof homePlanetNode.z === 'number') {
        const distance = 10;
        const camX = homePlanetNode.x;
        const camY = homePlanetNode.y - distance / 2; // Slightly lower the view angle so the planet blocks part of the view
        const camZ = homePlanetNode.z + distance;
        const animationDuration = 6000; // Animation duration

        // Ensure interaction is disabled before starting animation (although it's true by default, make it explicit)
        setIsInteractingDisabled(true);

        fgRef.current.cameraPosition(
          { x: camX, y: camY, z: camZ },
          { x: homePlanetNode.x, y: homePlanetNode.y + 16, z: homePlanetNode.z },
          animationDuration
        );

        // Enable interaction and show welcome guide after animation completes
        setTimeout(() => {
          setIsInteractingDisabled(false);
          // Set current focused planet to home-planet
          setCurrentFocusedNodeId('home-planet');
          // Set planet info for MOSS and show welcome guide
          if (homePlanetNode && homePlanetNode.name && homePlanetNode.description !== undefined) {
            setMossPlanetInfo({ name: homePlanetNode.name, description: homePlanetNode.description });
          }
          setShowWelcomeGuide(true);
          setMossVisible(true);
        }, animationDuration + 100); // Slightly delay to ensure animation completion

        setInitialFocusDone(true);
      } else {
         console.warn('Home planet node or its position not found after engine stop.');
         setIsInteractingDisabled(false); // If node or position is not found, also remove the disable
      }
    } else if (!initialFocusDone) {
        // If conditions are not met when engine stops (e.g., no nodes), also remove the disable
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
  const [mossPlanetInfo, setMossPlanetInfo] = useState<{ name: string; description: string } | undefined>(undefined); // New: MOSS display content

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

  const getWelcomeGuideContent = () => {
    return {
      name: "欢迎来到家庭星球",
      description: "这里是您的家庭宇宙中心！以下是一些操作指南：\n\n🖱️ 左键点击：选择和查看星球详情\n🖱️ 右键拖拽：移动和旋转视角\n🔍 滚轮：缩放视图\n🏠 点击MOSS助手可以快速回到家庭星球\n\n开始探索您的家庭宇宙吧！"
    };
  };

  return (
    <div className="w-screen h-screen overflow-hidden">
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
        showNavInfo={false}
        cooldownTicks={100}
        onEngineStop={handleEngineStop}
      />
      
      <MOSS 
        visible={mossVisible} 
        planetInfo={showWelcomeGuide ? getWelcomeGuideContent() : mossPlanetInfo} 
        onClose={() => {
          setMossVisible(false);
          setShowWelcomeGuide(false);
        }}
        onOpen={() => setMossVisible(true)}
        onGoHome={focusOnHomePlanet}
      />
    </div>
  );
}
