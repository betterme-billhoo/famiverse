import { useState, useEffect } from 'react';
import { GraphData, NodeData } from '../types/graph'; // 导入 NodeData

export function useGraphData(url: string): GraphData {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: GraphData) => {
        const homePlanetId = 'home-planet';
        const homePlanetPos = { x: 0, y: 0, z: 0 }; // 中心节点位置
        const rootDistributionRadius = 250; // root-* 节点围绕中心的分布半径
        const clusterRadius = 80; // 簇内节点的分布半径
        const defaultSpread = 500; // 其他节点的分布范围
        const ySpread = 0.01; // y轴的分布范围，保持扁平

        // 动态计算 root-* 节点的位置
        const rootNodes = data.nodes.filter(node => node.id.startsWith('root-'));
        const calculatedRootPositions: { [key: string]: { x: number; y: number; z: number } } = {};
        const angleStep = (2 * Math.PI) / rootNodes.length; // 计算角度步长（弧度）

        rootNodes.forEach((node, index) => {
          const angle = index * angleStep;
          calculatedRootPositions[node.id] = {
            x: homePlanetPos.x + rootDistributionRadius * Math.cos(angle),
            y: homePlanetPos.z + (Math.random() - 0.5) * ySpread,
            z: homePlanetPos.y + rootDistributionRadius * Math.sin(angle),
          };
        });

        const nodesWithPositionedClusters = data.nodes.map((node: NodeData) => {
          let position = {
            x: (Math.random() - 0.5) * defaultSpread,
            y: (Math.random() - 0.5) * ySpread,
            z: (Math.random() - 0.5) * defaultSpread
          };

          let rootNodeId: string | null = null;

          // 1. 处理 home-planet 节点
          if (node.id === homePlanetId) {
            position = homePlanetPos;
          }
          // 2. 处理 root-* 节点
          else if (calculatedRootPositions[node.id]) {
            position = calculatedRootPositions[node.id];
          }
          // 3. 处理簇节点
          else {
            if (node.id.startsWith('character-')) {
              rootNodeId = 'root-character';
            } else if (node.id.startsWith('wisdom-')) {
              rootNodeId = 'root-wisdom';
            } else if (node.id.startsWith('physical-')) {
              rootNodeId = 'root-physical';
            } else if (node.id.startsWith('inner-')) {
              rootNodeId = 'root-inner';
            } else if (node.id.startsWith('aesthetic-')) {
              rootNodeId = 'root-aesthetic';
            } else if (node.id.startsWith('practice-')) {
              rootNodeId = 'root-practice';
            }

            // 如果是簇成员，并且其根节点位置已计算，则围绕根节点分布
            if (rootNodeId && calculatedRootPositions[rootNodeId]) {
              const rootPos = calculatedRootPositions[rootNodeId];
              position = {
                x: rootPos.x + (Math.random() - 0.5) * clusterRadius * 2,
                y: rootPos.y + (Math.random() - 0.5) * ySpread,
                z: rootPos.z + (Math.random() - 0.5) * clusterRadius * 2
              };
            }
            // 4. 其他节点使用默认随机位置 (position 变量已在开始时初始化)
          }

          return {
            ...node,
            ...position // 应用计算出的或默认的位置
          };
        });

        setGraphData({ ...data, nodes: nodesWithPositionedClusters });
      })
      .catch(error => console.error('Error fetching graph data:', error));
  }, [url]);

  return graphData;
}