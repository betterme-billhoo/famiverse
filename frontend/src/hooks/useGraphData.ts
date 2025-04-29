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
        // 为节点设置初始位置以模拟扁平分布
        const nodesWithInitialPosition = data.nodes.map((node: NodeData) => ({
          ...node,
          // 在较大的 x, y 平面内随机分布
          x: (Math.random() - 0.5) * 300, // 调整范围以适应你的场景
          y: (Math.random() - 0.5) * 300, // 调整范围以适应你的场景
          // z 坐标限制在很小的范围内，使其看起来扁平
          z: (Math.random() - 0.5) * 0.01   // 调整范围以控制“厚度”
        }));

        setGraphData({ ...data, nodes: nodesWithInitialPosition });
      })
      .catch(error => console.error('Error fetching graph data:', error));
  }, [url]);

  return graphData;
}