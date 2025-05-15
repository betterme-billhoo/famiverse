import React from 'react';

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
  return (
    <>
      {/* 抽屉弹窗 */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        style={{ width: 400, maxWidth: '90vw' }}
      >
        <div className="bg-white dark:bg-black/90 h-full rounded-l-xl shadow-2xl border-l border-gray-200 dark:border-gray-700 p-6 flex flex-col items-start">
          <div className="flex items-center mb-3">
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
          <button
            className="self-end px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={onClose}
          >
            关闭
          </button>
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