import React from 'react';
import { NodeData } from '../types/graph'; // 导入共享类型

interface NodeInfoPanelProps {
  selectedNode: NodeData | null;
}

export default function NodeInfoPanel({ selectedNode }: NodeInfoPanelProps) {
  // 使用 `hidden` 类来控制显示/隐藏，而不是条件渲染，避免布局跳动
  return (
    <div className={`absolute top-5 left-5 p-3 bg-white/95 dark:bg-black/90 rounded-lg shadow-lg z-10 transition-opacity duration-300 ${selectedNode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {selectedNode && ( // 内部仍然需要条件渲染内容
        <>
          <h3 className="text-lg font-bold mb-2">{selectedNode.name}</h3>
          <p className="text-sm">{selectedNode.description}</p>
        </>
      )}
    </div>
  );
}