'use client';

import React, { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import ForceGraph3D, { NodeObject } from 'react-force-graph-3d';

import { useGraphData } from '../hooks/useGraphData';
import { useStarBackground } from '../hooks/useStarBackground';
import NodeInfoPanel from './NodeInfoPanel';
import { NodeData, LinkData, ForceGraphRef } from '../types/graph';

export default function FamiverseGraph() {
  const fgRef: ForceGraphRef = useRef(undefined);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  const graphData = useGraphData('/graph-data.json');
  useStarBackground(fgRef); // 应用星空背景效果

  const nodeObject = useCallback((node: NodeData) => {
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshLambertMaterial({
      color: node.color
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { nodeId: node.id }; // 存储 ID

    const animate = () => {
      mesh.rotation.y += 0.005;
      requestAnimationFrame(animate);
    };
    animate();

    return mesh;
  }, []);

  const handleNodeClick = useCallback((node: NodeObject<NodeData>) => {
    const nodeData = node as NodeData;
    setSelectedNode(nodeData);

    // 相机聚焦逻辑
    if (typeof node.x === 'number' && typeof node.y === 'number' && typeof node.z === 'number') {
      const distance = 40;
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

  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden"> {/* 添加 overflow-hidden */}
      <NodeInfoPanel selectedNode={selectedNode} />

      <ForceGraph3D<NodeData, LinkData>
        ref={fgRef}
        graphData={graphData}
        nodeThreeObject={nodeObject}
        backgroundColor="#000000"
        onNodeClick={handleNodeClick}
        nodeLabel={(node: NodeObject<NodeData>) => `${node.name}`}
        linkWidth={0.1}
        linkOpacity={0.35}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={0.12}
        enableNodeDrag={false}
        cooldownTicks={100}
      />
    </div>
  );
}
