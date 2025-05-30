import React, { useRef, useEffect, useState } from 'react';

interface MOSSProps {
  visible: boolean;
  planetInfo?: {
    name: string;
    description: string;
  };
  onClose: () => void;
  onOpen: () => void;
  onGoHome?: () => void; // Add new prop for home navigation
}

const MOSS: React.FC<MOSSProps> = ({ visible, planetInfo, onClose, onGoHome }) => {
  const mossRef = useRef<HTMLDivElement>(null);
  const mossButtonRef = useRef<HTMLButtonElement>(null);
  const homeButtonRef = useRef<HTMLButtonElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
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
    console.log("导航到家庭星球");
    setShowOptions(false); // 隐藏选项界面
    
    // Call the function to focus on home planet (same as clicking it)
    if (onGoHome) {
      onGoHome();
    }
  };

  // 处理创建星球选项
  const handleCreatePlanet = () => {
    console.log("创建星球功能待开发");
    setShowOptions(false);
    // 这里将来会实现创建星球的逻辑
  };

  // 添加点击外部区域关闭弹窗的处理函数
  // Handle click outside to close popup and hide options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close popup if clicking outside when visible
      if (visible && mossRef.current && !mossRef.current.contains(target)) {
        handleClose();
        return;
      }
      
      // Hide options if clicking outside the options area when options are shown
      if (showOptions && !visible) {
        // Check if click is on any of the option buttons or main MOSS button using refs
        const isClickOnMossButton = mossButtonRef.current?.contains(target);
        const isClickOnHomeButton = homeButtonRef.current?.contains(target);
        const isClickOnCreateButton = createButtonRef.current?.contains(target);
        
        if (isClickOnMossButton || isClickOnHomeButton || isClickOnCreateButton) {
          return; // Don't hide if clicking on any of the buttons
        }
        
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
            ref={homeButtonRef}
            onClick={handleGoHome}
            className="fixed z-40 w-12 h-12 rounded-full bg-gray-800/80 hover:bg-gray-700/80 shadow-lg flex items-center justify-center transition-all"
            style={{ 
              bottom: '8rem',
              right: '8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
            }}
            title="回家"
          >
            <span className="text-xl">🏠</span>
          </button>
          
          {/* 创建星球按钮 - 位于主按钮左侧 */}
          <button 
            ref={createButtonRef}
            onClick={handleCreatePlanet}
            className="fixed z-40 w-12 h-12 rounded-full bg-gray-800/80 hover:bg-gray-700/80 shadow-lg flex items-center justify-center transition-all"
            style={{ 
              bottom: '5.5rem',
              right: '10.5rem',
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
          ref={mossButtonRef}
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