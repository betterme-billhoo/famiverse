'use client';

import * as THREE from 'three';
import React, { useRef, useState, useCallback } from 'react';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';

import { useStarBackground } from '../hooks/useStarBackground';
import NodeInfoPanel from './NodeInfoPanel';
import { GraphData, NodeData, LinkData, ForceGraphRef } from '../types/graph';
import { getGalaxies } from '../services/galaxyDAO';
import { getPlanets } from '../services/planetDAO';
import { useEffect } from 'react';

export default function FamiverseGraph() {
  const fgRef: ForceGraphRef = useRef(undefined);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [initialFocusDone, setInitialFocusDone] = useState(false);
  const [isInteractingDisabled, setIsInteractingDisabled] = useState(true);

  // const graphData = useGraphData('/graph-data.json');
  const graphData = useFamiverseGraphData();

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
  const handleNodeClick = useCallback((node: NodeObject<NodeData>) => {
    if (isInteractingDisabled) return; // 如果交互被禁用，则不处理点击

    const nodeData = node as NodeData;
    setSelectedNode(nodeData);

    // Focus on the node
    if (typeof node.x === 'number' && typeof node.y === 'number' && typeof node.z === 'number') {
      const distance = 30;
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

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <NodeInfoPanel selectedNode={selectedNode} />

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

// 新增：自定义 Hook，动态获取并组装 GraphData
function useFamiverseGraphData(): GraphData {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    async function fetchData() {
      // 获取所有星系和行星
      const galaxies = await getGalaxies();
      const planets = await getPlanets();

      // 组装节点
      const nodes: NodeData[] = [];
      // home-planet 节点
      nodes.push({
        id: 'home-planet',
        name: '我的家庭',
        color: '#FFFFFF',
        info: '我的家庭',
        x: 0, y: 0, z: 0
      });

      // 星系节点
      galaxies.forEach(galaxy => {
        nodes.push({
          id: `galaxy-${galaxy.id}`,
          name: galaxy.attributes.name,
          color: '#69C0FF',
          info: galaxy.attributes.description || ''
        });
      });

      // 行星节点
      planets.forEach(planet => {
        nodes.push({
          id: `planet-${planet.id}`,
          name: planet.attributes.name,
          color: '#FF7875',
          info: planet.attributes.description || ''
        });
      });

      // 组装 links
      const links: LinkData[] = [];
      // home-planet -> 各星系
      galaxies.forEach(galaxy => {
        links.push({
          source: 'home-planet',
          target: `galaxy-${galaxy.id}`
        });
      });
      // 星系 -> 行星
      planets.forEach(planet => {
        if (planet.attributes.galaxy?.id) {
          links.push({
            source: `galaxy-${planet.attributes.galaxy.id}`,
            target: `planet-${planet.id}`
          });
        }
      });

      setGraphData({ nodes, links });
    }
    fetchData();
  }, []);

  return graphData;
}
