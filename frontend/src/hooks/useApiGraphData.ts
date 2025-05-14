import { useEffect, useState } from 'react';
import { getGalaxies } from '../services/galaxyDAO';
import { getPlanets, Planet } from '../services/planetDAO';
import { GraphData, NodeData, LinkData } from '../types/graph';
import { Galaxy } from '@/services/galaxyDAO';

// Helper function to convert degrees to radians
const degreesToRadians = (degrees: number): number => degrees * (Math.PI / 180);

export function useApiGraphData(): GraphData {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const homePlanetId = 'home-planet';
        const homePlanetPos = { x: 0, y: 0, z: 0 }; // 中心节点位置

        const rootDistributionRadius = 4096; // root-* 节点围绕中心的分布半径
        const clusterRadiusX = 4096; // 簇内节点在盘面上的 X 方向分布半径 (椭圆长轴)
        const clusterRadiusZ = 512; // 簇内节点在盘面上的 Z 方向分布半径 (椭圆短轴)
        const clusterThickness = 200;  // 簇的厚度 (垂直于盘面)
        const spiralFactor = 8;       // 螺旋因子，值越大螺旋越紧密
        const defaultSpread = 600;    // 其他节点的 XY 平面分布范围
        const defaultZSpread = 100;   // 其他节点的 Z 轴分布范围

        const nodes: NodeData[] = [];
        const links: LinkData[] = [];

        // 添加 Home Planet
        nodes.push({
          id: homePlanetId,
          name: 'Home Planet',
          description: 'The home planet of the universe.',
          color: '#FFFFFF',
          galaxyId: 'none',
          galaxyName: 'none',
          isCentre: false
        });

        const galaxies: Galaxy[] = await getGalaxies();
        const planets: Planet[] = await getPlanets();

        for(const galaxy of galaxies) {
          galaxy.planets.forEach((planet, index) => {
            const thePlanet = planets.find(p => p.id === planet.id);

            if(thePlanet) {
              // Push planet to nodes
              nodes.push({
                id: thePlanet.id,
                name: thePlanet.name,
                description: thePlanet.description,
                color: galaxy.color, // TODO: Use galaxy color as the main color and generate variations.
                galaxyId: galaxy.id,
                galaxyName: galaxy.name,
                isCentre: index === 0 // 每个星系的第一个星球，我们设定为该星系的中心，后续所有星球都围绕该中心进行分布
              });
            } else {
              console.error(`Planet with id ${planet.id} not found.`);
            }
          }); // for planets
        } // for galaxies

        // 将六大星系的中心星球筛选出来
        const centreNodes = nodes.filter(node => node.isCentre);

        // 定义每个中心星球的倾斜角度 (单位：度) - 使用随机角度
        const clusterTiltsInDegrees: { [key: string]: number } = {};

        // 为每个中心节点随机一个倾斜角度
        centreNodes.forEach(planet => {
            clusterTiltsInDegrees[planet.id] = 360 * (Math.random() - 0.5);
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
          calculatedRootPositions[node.id] = {
            x: homePlanetPos.x + rootDistributionRadius * Math.cos(angle),
            y: homePlanetPos.y, // 中心本身保持在 y=0 平面
            z: homePlanetPos.z + rootDistributionRadius * Math.sin(angle),
          };
        });

        const nodesWithPositionedClusters = nodes.map((node: NodeData) => {
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
          // 2. 处理中心星球
          else if (calculatedRootPositions[node.id]) {
            position = calculatedRootPositions[node.id];
          }
          // 3. 处理其余同星系的星球
          else {
            for(const galaxy of galaxies) {
              if(node.galaxyId === galaxy.id){
                rootNodeId = galaxy.planets[0].id;
                break;
              }
            }

            // 如果同星系，并且其中心星球位置已计算，则围绕中心按椭圆、螺旋、倾斜、厚度分布
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
                x: rootPos.x + dx_initial,                 // 螺旋旋转后的 X 偏移
                y: rootPos.y + rotated_dy + thickness_dy, // 倾斜后的Y + 厚度引起的Y偏移
                z: rootPos.z + rotated_dz + thickness_dz  // 倾斜后的Z + 厚度引起的Z偏移
              };
            }

            // 4. 其他星球使用默认随机位置 (position 变量已在开始时初始化)
          }

          return {
            ...node,
            ...position // 应用计算出的或默认的位置
          };
        });

        setGraphData({ nodes: nodesWithPositionedClusters, links });
      } catch (error) {

        console.error('Error fetching data:', error);
        setGraphData({ nodes: [], links: [] });
      }
    }

    fetchData();
  }, []);

  return graphData;
}