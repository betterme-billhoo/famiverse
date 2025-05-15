import React, { useState } from 'react';

interface MOSSProps {
  visible: boolean;
  planetInfo?: {
    name: string;
    description: string;
  };
  onClose: () => void;
  onOpen: () => void;
}

const MOSS: React.FC<MOSSProps> = ({ visible, planetInfo, onClose, onOpen }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // 封装关闭逻辑，确保每次关闭都重置为抽屉状态
  const handleClose = () => {
    setIsMaximized(false); // 关闭时重置为抽屉
    onClose();
  };

  return (
    <>
      {/* 弹窗 */}
      <div
        className={
          isMaximized
            ? `fixed top-1/2 left-1/2 z-50 transition-all duration-300 ${
                visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`
            : `fixed top-0 right-0 h-full z-50 transition-transform duration-300 ${
                visible ? 'translate-x-0' : 'translate-x-full pointer-events-none'
              }`
        }
        style={
          isMaximized
            ? {
                width: '80vw',
                height: '80vh',
                maxWidth: 800,
                maxHeight: 700,
                transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(100%, -50%) scale(0.8)',
                borderRadius: 24,
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.25)'
              }
            : { width: 400, maxWidth: '90vw' }
        }
      >
        <div className={`relative bg-white dark:bg-black/90 h-full rounded-l-xl shadow-2xl border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start ${isMaximized ? 'rounded-2xl border-l-0' : ''}`}>
          {/* 右上角按钮 */}
          <div className="absolute top-3 right-3 flex gap-2">
            {!isMaximized && (
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
                title="放大"
                onClick={() => setIsMaximized(true)}
              >
                <span className="text-lg">⛶</span>
              </button>
            )}
            {isMaximized && (
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
                title="缩小"
                onClick={() => setIsMaximized(false)}
              >
                <span className="text-lg">🗗</span>
              </button>
            )}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-400 hover:bg-red-500 text-white transition"
              title="关闭"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
          <div className="flex items-center mb-3 mt-2">
            <span className="text-2xl mr-2">🤖</span>
            <span className="font-bold text-lg">MOSS 人工智能助手</span>
          </div>
          {planetInfo ? (
            <>
              <div className="mb-2">
                <span className="font-semibold">星球名称：</span>
                <span>{planetInfo.name}</span>
              </div>
              <div className="mb-4">
                <span className="font-semibold">简介：</span>
                <span>{planetInfo.description || '暂无简介'}</span>
              </div>
            </>
          ) : (
            <div className="mb-4 text-gray-500">点击任意星球，MOSS 会为你介绍它的基本信息。</div>
          )}
        </div>
      </div>
      {/* 右下角圆形头像按钮 */}
      {!visible && (
        <button
          className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center transition-all"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
          onClick={onOpen}
          aria-label="打开MOSS助手"
        >
          <span className="text-3xl">🤖</span>
        </button>
      )}
    </>
  );
};

export default MOSS;