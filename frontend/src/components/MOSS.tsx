import React, { useRef, useEffect, useState } from 'react';

interface MOSSProps {
  visible: boolean;
  planetInfo?: {
    name: string;
    description: string;
  };
  onClose: () => void;
  onOpen: () => void;
}

const MOSS: React.FC<MOSSProps> = ({ visible, planetInfo, onClose }) => {
  const mossRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);

  // 封装关闭逻辑
  const handleClose = () => {
    onClose();
    setShowOptions(false); // 关闭时也隐藏选项界面
  };

  // 处理MOSS按钮点击
  const handleMossButtonClick = () => {
    setShowOptions(!showOptions); // 切换选项界面显示状态
  };

  // 处理回家选项
  const handleGoHome = () => {
    // 这里可以添加导航到家庭星球的逻辑
    console.log("导航到家庭星球");
    setShowOptions(false); // 隐藏选项界面
    // 这里需要实现导航到家庭星球的逻辑
  };

  // 处理创建星球选项
  const handleCreatePlanet = () => {
    console.log("创建星球功能待开发");
    setShowOptions(false); // 隐藏选项界面
    // 这里将来会实现创建星球的逻辑
  };

  // 添加点击外部区域关闭弹窗的处理函数
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visible && mossRef.current && !mossRef.current.contains(event.target as Node)) {
        handleClose();
      }
      
      // 点击外部区域时也关闭选项界面
      if (showOptions && !mossRef.current?.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose, showOptions]);

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
      
      {/* 圆形选项按钮 - 围绕主按钮均匀分布 */}
      {showOptions && !visible && (
        <>
          {/* 回家按钮 - 位于主按钮上方 */}
          <button 
            onClick={handleGoHome}
            className="fixed z-40 w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center transition-all"
            style={{ 
              bottom: '8rem', // 主按钮位置 + 32px
              right: '8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
            }}
            title="回家"
          >
            <span className="text-xl">🏠</span>
          </button>
          
          {/* 创建星球按钮 - 位于主按钮左侧 */}
          <button 
            onClick={handleCreatePlanet}
            className="fixed z-40 w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg flex items-center justify-center transition-all"
            style={{ 
              bottom: '5.5rem', // 主按钮中心位置
              right: '10.5rem', // 主按钮位置 + 32px
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
            }}
            title="创建星球"
          >
            <span className="text-xl">🌍</span>
          </button>
        </>
      )}
      
      {/* 右下角圆形头像按钮 */}
      {!visible && (
        <button
          className={`fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full ${showOptions ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} shadow-lg flex items-center justify-center transition-all`}
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
          onClick={handleMossButtonClick}
          aria-label="唤醒 MOSS"
        >
          <span className="text-3xl">🤖</span>
        </button>
      )}
    </>
  );
};

export default MOSS;