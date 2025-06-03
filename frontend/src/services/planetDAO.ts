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

import apiClient from './strapiClient';

// 定义返回的 Planet 数据类型
export interface Planet {
  documentId: string; 
  id: string;
  name: string;
  description: string;
  galaxy: { documentId: string; }; 
  topics?: { documentId: string; attributes: { name: string } }[]; 
}

// 获取所有 Planet
export const getPlanets = async (): Promise<Planet[]> => {
  try {
    let allPlanets: Planet[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await apiClient.collection('planets').find({
        populate: {
          galaxy: {
            fields: ['documentId', 'name'], 
          }
        },
        pagination: {
          page: page,
          pageSize: 100
        }
      });
      
      const planets = response.data.map(item => ({
        documentId: item.documentId, 
        id: item.id,
        name: item.name,
        description: item.description,
        galaxy: { documentId: item.galaxy?.documentId || '' } 
      }));
      
      allPlanets = [...allPlanets, ...planets];
      
      // 检查是否还有更多页
      hasMore = (response.meta?.pagination?.page ?? 0) < (response.meta?.pagination?.pageCount ?? 0);
      page++;
    }

    return allPlanets;
  } catch (error) {
    console.error('Error fetching planets:', error);
    throw error;
  }
};

// 获取单个 Planet
export const getPlanetByDocumentId = async (documentId: string): Promise<Planet> => {
  try {

    const response = await apiClient.collection('planets').findOne(documentId);
    const planet = {
      documentId: response.data.documentId, 
      id: response.data.id,
      name: response.data.attributes.name,
      description: response.data.attributes.description,
      galaxy: response.data.attributes.galaxy?.data
        ? { documentId: response.data.attributes.galaxy.data.documentId } 
        : { documentId: '' }, 
    };

    return planet;
  } catch (error) {
    console.error(`Error fetching planet with documentId ${documentId}:`, error);
    throw error;
  }
};

