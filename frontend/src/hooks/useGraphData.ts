import { useState, useEffect } from 'react';
import { GraphData, NodeData } from '../types/graph'; // 导入 NodeData

// Helper function to convert degrees to radians
const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

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
        const rootDistributionRadius = 1024; // root-* 节点围绕中心的分布半径
        const clusterRadius = 1024; // 簇内节点的分布半径
        const defaultSpread = 500; // 其他节点的 XY 平面分布范围
        const defaultZSpread = 100; // 其他节点的 Z 轴分布范围 (保持相对扁平)

        // 定义每个 root 节点的倾斜角度 (单位：度)
        const clusterTiltsInDegrees: { [key: string]: number } = {
          'root-character': 360 * (Math.random() - 0.5), // 随机倾斜角度
          'root-wisdom': 360 * (Math.random() - 0.5),
          'root-physical': 360 * (Math.random() - 0.5),
          'root-inner': 360 * (Math.random() - 0.5),
          'root-aesthetic': 360 * (Math.random() - 0.5),
          'root-practice': 360 * (Math.random() - 0.5)
        };

        // 将角度转换为弧度
        const clusterTilts: { [key: string]: number } = {};
        for (const key in clusterTiltsInDegrees) {
          clusterTilts[key] = degreesToRadians(clusterTiltsInDegrees[key]);
        }

        // 动态计算 root-* 节点的位置 (保持在 XZ 平面分布)
        const rootNodes = data.nodes.filter(node => node.id.startsWith('root-'));
        const calculatedRootPositions: { [key: string]: { x: number; y: number; z: number } } = {};
        const angleStep = (2 * Math.PI) / rootNodes.length; // 计算角度步长（弧度）

        rootNodes.forEach((node, index) => {
          const angle = index * angleStep;
          calculatedRootPositions[node.id] = {
            x: homePlanetPos.x + rootDistributionRadius * Math.cos(angle),
            y: homePlanetPos.y, // Root 节点本身保持在 y=0 平面
            z: homePlanetPos.z + rootDistributionRadius * Math.sin(angle),
          };
        });

        const nodesWithPositionedClusters = data.nodes.map((node: NodeData) => {
          let position = {
            x: (Math.random() - 0.5) * defaultSpread,
            y: (Math.random() - 0.5) * defaultSpread, // 其他节点默认在 XY 平面散开
            z: (Math.random() - 0.5) * defaultZSpread // 其他节点 Z 轴范围较小
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
            // ... 可以继续添加其他簇的判断

            // 如果是簇成员，并且其根节点位置已计算，则围绕根节点按倾斜角度分布
            if (rootNodeId && calculatedRootPositions[rootNodeId]) {
              const rootPos = calculatedRootPositions[rootNodeId];
              const tiltAngle = clusterTilts[rootNodeId] || 0; // 获取倾斜角度，默认为0

              // 在 XY 平面上生成随机偏移
              const dx = (Math.random() - 0.5) * clusterRadius * 2;
              const dy_initial = (Math.random() - 0.5) * clusterRadius * 2; // 初始 Y 偏移

              // 绕 Z 轴旋转 dy_initial (模拟倾斜) - 注意这里我们绕 Z 轴旋转 Y 偏移量
              // 如果想绕 X 轴旋转 Z 偏移量，公式会不同
              // 假设我们想让星系盘面在 XY 平面内旋转（倾斜）
              // 初始偏移在 XY 平面: (dx, dy_initial, 0)
              // 绕 Z 轴旋转 theta 角:
              // x' = dx * cos(theta) - dy_initial * sin(theta)
              // y' = dx * sin(theta) + dy_initial * cos(theta)
              // z' = 0 (如果只在 XY 平面倾斜)
              // 如果想增加厚度，可以再加一个小的随机 z 偏移

              // 为了模拟星系盘面绕穿过根节点的 X 轴倾斜：
              // 初始偏移在 XZ 平面: (dx, 0, dz_initial)
              const dz_initial = (Math.random() - 0.5) * clusterRadius * 2;
              const rotated_dy = -dz_initial * Math.sin(tiltAngle); // Y' = Y*cos(theta) - Z*sin(theta) = 0 - dz_initial*sin(theta)
              const rotated_dz = dz_initial * Math.cos(tiltAngle);  // Z' = Y*sin(theta) + Z*cos(theta) = 0 + dz_initial*cos(theta)


              position = {
                x: rootPos.x + dx, // X 坐标直接加上 X 偏移
                y: rootPos.y + rotated_dy, // Y 坐标加上旋转后的 Y 偏移
                z: rootPos.z + rotated_dz  // Z 坐标加上旋转后的 Z 偏移
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