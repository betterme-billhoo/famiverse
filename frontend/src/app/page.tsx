'use client';

import dynamic from 'next/dynamic';

// 动态导入 FamiverseGraph 组件，避免 SSR 问题
const FamiverseGraph = dynamic(
  () => import('../components/FamiverseGraph'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <FamiverseGraph />
    </div>
  );
}
