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

import * as THREE from 'three';
import { NodeObject, LinkObject, ForceGraphMethods } from 'react-force-graph-3d';

// 节点数据接口
export interface NodeData {
  documentId: string;
  name: string;
  color: string;
  description: string;
  galaxyDocumentId: string;
  galaxyName: string;
  isCentre: boolean;

  x?: number;
  y?: number;
  z?: number;
}

// 链接数据接口
export interface LinkData {
  source: string;
  target: string;
}

// 图数据接口
export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

// ForceGraph Ref 类型别名
export type ForceGraphRef = React.MutableRefObject<ForceGraphMethods<NodeObject<NodeData>, LinkObject<LinkData>> | undefined>;

// 扩展 Three.js Object3D 以包含 userData
export type Object3DWithUserData = THREE.Object3D & {
  userData: {
    nodeId?: string;
  };
  material?: THREE.Material | THREE.Material[];
};

// 访问内部 _scene 的辅助类型 (尽量避免使用)
export type ForceGraphRefWithInternal = ForceGraphMethods<NodeObject<NodeData>, LinkObject<LinkData>> & {
    _scene?: THREE.Scene;
};