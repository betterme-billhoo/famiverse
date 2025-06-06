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

'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// 动态导入 FamiverseGraph 组件，避免 SSR 问题
const FamiverseGraph = dynamic(
  () => import('../components/FamiverseGraph'),
  { ssr: false }
);

export default function Home() {
  // 添加状态来控制客户端渲染 (如果尚未添加)
  const [isClient, setIsClient] = useState(false);

  // 在组件挂载后将状态设置为 true (如果尚未添加)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 从环境变量中获取是否显示GitHub按钮的配置
  const showGitHubButton = process.env.NEXT_PUBLIC_SHOW_GITHUB_BUTTON === 'true';

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative"> {/* 确保有 relative 定位 */}

      {/* 只有在客户端挂载后才渲染 FamiverseGraph 和 顶部链接 */}
      {isClient && (
        <>
          <FamiverseGraph />

          {showGitHubButton && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-4">
              <a
                href="https://github.com/betterme-billhoo/famiverse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors flex items-center justify-center"
                aria-label="View On GitHub"
              >
                {/* GitHub SVG 图标 */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              <a
                href="https://github.com/betterme-billhoo/famiverse/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors text-sm"
              >
                Discussion
              </a>

              <a
                href="https://github.com/users/betterme-billhoo/projects/1/views/1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors text-sm"
              >
                Roadmap
              </a>
            </div>
          )}
        </>
      )}

      {!isClient && <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white">Welcome to Famiverse...</div>}
    </div>
  );
}
