import React, { useRef, useEffect } from 'react';

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
  const mossRef = useRef<HTMLDivElement>(null);

  // 封装关闭逻辑
  const handleClose = () => {
    onClose();
  };

  // 添加点击外部区域关闭弹窗的处理函数
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visible && mossRef.current && !mossRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  return (
    <>
      {/* 弹窗 */}
      <div
        ref={mossRef}
        className={`fixed left-0 bottom-0 w-full z-50 transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
        style={{ height: '85%', maxHeight: '90vh' }}
      >
        <div className="relative bg-gray-800/80 w-full h-full rounded-t-xl shadow-2xl border-t border-gray-700 p-6 flex flex-col items-start">
          {/* 右上角关闭按钮 */}
          <div className="absolute top-3 right-3 flex gap-2">
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
            <span className="font-bold text-lg">MOSS</span>
          </div>
          {planetInfo ? (
            <>
              <div className="w-full text-center mb-2">
                <span className="font-semibold text-lg">{planetInfo.name}</span>
              </div>
              <div className="w-full text-left mb-4">
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
          aria-label="唤醒 MOSS"
        >
          <span className="text-3xl">🤖</span>
        </button>
      )}
    </>
  );
};

export default MOSS;