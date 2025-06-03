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

import { useEffect, useState } from 'react';
import { getGalaxies } from '../services/galaxyDAO';
import { getPlanets, Planet } from '../services/planetDAO';
import { GraphData, NodeData, LinkData } from '../types/graph';
import { Galaxy } from '@/services/galaxyDAO';

// Helper function to convert degrees to radians
const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

async function fetchApiRawData(): Promise<{ nodes: NodeData[]; links: LinkData[]; galaxies: Galaxy[] }> {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];

  // TODO：后续需要使用 DAO 层获取家庭星球的数据，目前写死，仅作为测试使用
  nodes.push({
    documentId: 'home-planet', // 暂时手动指定 homePlanet 的 documentId
    name: '我的家园',
    description: '这里是我们的家园。',
    color: '#FFFFFF',
    galaxyDocumentId: 'none',
    galaxyName: 'none',
    isCentre: false
  });

  // 从 API 获取星系和星球数据
  const galaxies: Galaxy[] = await getGalaxies();
  const planets: Planet[] = await getPlanets();

  // 针对每一个星系，遍历其所有星球并加入到节点列表
  for (const galaxy of galaxies) {
    galaxy.planets.forEach((planet, index) => {
      const thePlanet = planets.find(p => p.documentId === planet.documentId);

      if (thePlanet) {
        nodes.push({
          documentId: thePlanet.documentId, // 添加documentId字段
          name: thePlanet.name,
          description: thePlanet.description,
          color: galaxy.color, // 当前默认使用星系颜色，未来优化为基于星系主色调进行颜色随机微调
          galaxyDocumentId: galaxy.documentId, // 添加galaxyDocumentId字段
          galaxyName: galaxy.name,
          isCentre: index === 0 // 我们默认每个星系的第一个星球为中心节点，其余星球将围绕这个中心节点进行分布
        });
      }
    });
  }

  // TODO: Add links between nodes later if needed.

  return { nodes, links, galaxies };
}

function genGraphCoordinates(nodes: NodeData[], links: LinkData[], galaxies: Galaxy[]): GraphData {
  const homePlanetId = 'home-planet';
  const homePlanetPos = { x: 0, y: 0, z: 0 };

  const rootDistributionRadius = 4096;  // 其余节点围绕中心的分布半径
  const clusterRadiusX = 4096;          // 同星系内节点在盘面上的 X 方向分布半径 (椭圆长轴)
  const clusterRadiusZ = 512;           // 同星系内节点在盘面上的 Z 方向分布半径 (椭圆短轴)
  const clusterThickness = 200;         // 星系的厚度 (垂直于盘面)
  const spiralFactor = 8;               // 螺旋因子，值越大螺旋越紧密
  const defaultSpread = 600;            // 其他节点的 XY 平面分布范围
  const defaultZSpread = 100;           // 其他节点的 Z 轴分布范围

  // 筛选出所有中心节点
  const centreNodes = nodes.filter(node => node.isCentre);

  // 随机倾斜角度
  const clusterTiltsInDegrees: { [key: string]: number } = {};
  centreNodes.forEach(planet => {
    clusterTiltsInDegrees[planet.documentId] = 360 * (Math.random() - 0.5);
  });

  // 将角度转换为弧度
  const clusterTilts: { [key: string]: number } = {};
  for (const key in clusterTiltsInDegrees) {
    clusterTilts[key] = degreesToRadians(clusterTiltsInDegrees[key]);
  }

  // 动态计算中心节点的位置 (保持在 XZ 平面分布)
  const calculatedRootPositions: { [key: string]: { x: number; y: number; z: number } } = {};
  const angleStep = centreNodes.length > 0 ? (2 * Math.PI) / centreNodes.length : 0; // 计算角度步长（弧度），处理 rootNodes 为空的情况

  centreNodes.forEach((node, index) => {
    const angle = index * angleStep;
    calculatedRootPositions[node.documentId] = {
      x: homePlanetPos.x + rootDistributionRadius * Math.cos(angle),
      y: homePlanetPos.y, // 中心本身保持在 y=0 平面
      z: homePlanetPos.z + rootDistributionRadius * Math.sin(angle),
    };
  });

  // 计算所有节点的坐标
  const nodesWithPositionedClusters = nodes.map((node: NodeData) => {
    let position = {
      x: (Math.random() - 0.5) * defaultSpread, // 其他节点默认在 XY 平面散开
      y: (Math.random() - 0.5) * defaultSpread,
      z: (Math.random() - 0.5) * defaultZSpread // 其他节点 Z 轴范围较小
    };

    // 1. 处理家园节点
    if (node.documentId === homePlanetId) {
      position = homePlanetPos;
    }
    // 2. 处理中心节点
    else if (calculatedRootPositions[node.documentId]) {
      position = calculatedRootPositions[node.documentId];
    }
    // 3. 处理其余所有节点
    else {
      let rootNodeId: string | null = null;

      // 获取该节点对应的中心节点 ID（默认为该星系所有星球的第一个）
      for (const galaxy of galaxies) {
        if (node.galaxyDocumentId === galaxy.documentId) { // 使用documentId比较
          rootNodeId = galaxy.planets[0].documentId; // 使用documentId
          break;
        }
      }

      // 如果找到了中心节点，并且中心节点的位置已经计算出来
      if (rootNodeId && calculatedRootPositions[rootNodeId]) {
        const rootPos = calculatedRootPositions[rootNodeId];
        const tiltAngle = clusterTilts[rootNodeId] || 0; // 获取倾斜角度，默认为0

        // 在基础椭圆内生成随机点 (使用 sqrt 使点更集中于中心)
        const randomRadiusScale = Math.sqrt(Math.random()); // 半径比例 [0, 1]
        const randomAngle = Math.random() * 2 * Math.PI;    // 随机角度 [0, 2*PI]

        const baseX = clusterRadiusX * randomRadiusScale * Math.cos(randomAngle);
        const baseZ = clusterRadiusZ * randomRadiusScale * Math.sin(randomAngle);

        // 计算螺旋角度偏移 (基于半径比例)
        const spiralAngleOffset = randomRadiusScale * spiralFactor;

        // 将基础点按螺旋角度旋转
        const cosSpiral = Math.cos(spiralAngleOffset);
        const sinSpiral = Math.sin(spiralAngleOffset);
        const dx_initial = baseX * cosSpiral - baseZ * sinSpiral;
        const dz_initial = baseX * sinSpiral + baseZ * cosSpiral;

        // 应用倾斜（绕X轴旋转）
        const sinTilt = Math.sin(tiltAngle);
        const cosTilt = Math.cos(tiltAngle);
        const rotated_dy = -dz_initial * sinTilt;
        const rotated_dz = dz_initial * cosTilt;

        // 计算垂直于倾斜平面的偏移（厚度）
        const thicknessRandom = (Math.random() - 0.5) * clusterThickness;

        // 法向量 (0, cos(tiltAngle), sin(tiltAngle))
        const thickness_dy = thicknessRandom * cosTilt;
        const thickness_dz = thicknessRandom * sinTilt;

        // 合并所有偏移量并加到根节点位置上
        position = {
          x: rootPos.x + dx_initial,                // 螺旋旋转后的 X 偏移
          y: rootPos.y + rotated_dy + thickness_dy, // 倾斜后的Y + 厚度引起的Y偏移
          z: rootPos.z + rotated_dz + thickness_dz  // 倾斜后的Z + 厚度引起的Z偏移
        };

        // 4. 其他星球（如果数据出错找不到所属星系的）使用默认随机位置 (position 变量已在开始时初始化)
      }
    }

    return {
      ...node,
      ...position
    };
  });

  return { nodes: nodesWithPositionedClusters, links };
}

export function useApiGraphData(): GraphData {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    async function loadData() {
      try {
        const { nodes, links, galaxies } = await fetchApiRawData();
        const processed = genGraphCoordinates(nodes, links, galaxies);
        setGraphData(processed);
      } catch (error) {
        console.error('Error fetching data:', error);
        setGraphData({ nodes: [], links: [] });
      }
    }

    loadData();
  }, []);

  return graphData;
}