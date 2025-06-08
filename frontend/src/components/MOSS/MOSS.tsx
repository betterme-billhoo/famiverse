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

import React, { useRef, useState, useEffect } from 'react';
import OptionsButton, { OptionButton } from './MOSSOptionsButton';

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
  const [showOptions, setShowOptions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Create refs for option buttons dynamically - Fixed type definition
  const optionRefs = useRef<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>({});

  // Handle close logic
  const handleClose = () => {
    onClose();
    setShowOptions(false); // Hide options when closing
  };

  // Handle MOSS button click with animation
  const handleMossButtonClick = () => {
    if (!showOptions) {
      setIsAnimating(true);
      setShowOptions(true);
      // Reset animation state after animation completes - reduced to 100ms
      setTimeout(() => setIsAnimating(false), 100);
    } else {
      setShowOptions(false);
      setIsAnimating(false);
    }
  };

  // Handle go home option
  const handleGoHome = () => {
    console.log("导航到家庭星球");
    setShowOptions(false); // Hide options
    setIsAnimating(false);
    
    // Call the function to focus on home planet (same as clicking it)
    if (onGoHome) {
      onGoHome();
    }
  };

  // Handle create planet option
  const handleCreatePlanet = () => {
    console.log("创建星球功能待开发");
    setShowOptions(false);
    setIsAnimating(false);
    // Future implementation for creating planets
  };

  // ===== OPTION BUTTONS CONFIGURATION =====
  // Centralized configuration for all option buttons
  // Add, remove, or modify buttons here
  const getOptionButtons = (): OptionButton[] => {
    return [
      {
        id: 'home',
        icon: '🏠',
        title: '回家',
        onClick: handleGoHome
      },
      {
        id: 'create',
        icon: '🌍',
        title: '创建星球',
        onClick: handleCreatePlanet
      }
    ];
  };
  // ===== END OPTION BUTTONS CONFIGURATION =====

  // Calculate option button positions in 90° arc on top-left
  const calculateOptionPositions = () => {
    const options = getOptionButtons();
    
    const radius = 64; // Main button diameter as radius (16 * 4 = 64px)
    const totalAngle = 90; // 90 degrees arc
    const optionCount = options.length;
    
    return options.map((option, index) => {
      let angle;
      if (optionCount === 1) {
        // Single button at 45° (middle of 90° arc)
        angle = 45;
      } else {
        // Multiple buttons distributed evenly in 90° arc
        // Start from 0° and end at 90°, distribute evenly
        angle = (totalAngle / (optionCount - 1)) * index;
      }
      
      // Convert angle to radians and calculate position
      // Note: CSS coordinates have Y increasing downward, so we adjust
      const radian = (angle * Math.PI) / 180;
      const x = -Math.cos(radian) * radius; // Negative for left direction
      const y = -Math.sin(radian) * radius; // Negative for upward direction
      
      return {
        ...option,
        ref: optionRefs.current[option.id],
        style: {
          bottom: `calc(2rem + 32px + ${-y}px)`, // 2rem base + half button height + offset
          right: `calc(2rem + 32px + ${-x}px)`,  // 2rem base + half button width + offset
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animationDelay: `${index * 50}ms`,
          transform: isAnimating 
            ? 'scale(0) translate(10px, 10px)' 
            : 'scale(1) translate(0, 0)',
          transition: `all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${index * 0.05}s`
        }
      };
    });
  };

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
        // Check if click is on main MOSS button
        const isClickOnMossButton = mossButtonRef.current?.contains(target);
        
        // Check if click is on any option button
        const isClickOnOptionButton = Object.values(optionRefs.current).some(
          ref => ref.current?.contains(target)
        );
        
        if (isClickOnMossButton || isClickOnOptionButton) {
          return; // Don't hide if clicking on any of the buttons
        }
        
        setShowOptions(false);
        setIsAnimating(false);
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
            <div className="w-full flex-1 flex">
              {/* Left spacer - 1/4 width */}
              <div className="flex-1"></div>
              
              {/* Content area - 2/4 width with scrollable content */}
              <div className="flex-2 flex flex-col h-full">
                <div className="text-center mb-2">
                  <span className="font-semibold text-lg">{planetInfo.name}</span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="text-left">
                    <span>{planetInfo.description || '暂无简介'}</span>
                  </div>
                </div>
              </div>
              
              {/* Right spacer - 1/4 width */}
              <div className="flex-1"></div>
            </div>
          ) : (
            <div className="w-full flex-1 flex">
              {/* Left spacer - 1/4 width */}
              <div className="flex-1"></div>
              
              {/* Content area - 2/4 width */}
              <div className="flex-2 flex items-center justify-center">
                <div className="text-gray-500">点击任意星球，MOSS 会为你介绍它的基本信息。</div>
              </div>
              
              {/* Right spacer - 1/4 width */}
              <div className="flex-1"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* 选项按钮组件 - 仅在MOSS未显示时展示 */}
      {!visible && (
        <OptionsButton 
          options={getOptionButtons()}
          showOptions={showOptions}
          isAnimating={isAnimating}
          optionRefs={optionRefs}
          calculateOptionPositions={calculateOptionPositions}
        />
      )}
      
      {/* 右下角圆形头像按钮 */}
      {!visible && (
        <button
          ref={mossButtonRef}
          className={`fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full ${showOptions ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} shadow-lg flex items-center justify-center transition-all duration-200 ${
            showOptions ? 'scale-110' : 'scale-100 hover:scale-105'
          }`}
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