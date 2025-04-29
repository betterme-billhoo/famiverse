import { useState, useEffect } from 'react';
import { GraphData } from '../types/graph'; // 导入共享类型

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
      .then((data: GraphData) => { // 明确数据类型
        setGraphData(data);
      })
      .catch(error => console.error('Error fetching graph data:', error));
  }, [url]);

  return graphData;
}