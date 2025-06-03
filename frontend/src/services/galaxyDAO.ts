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

// 定义返回的 Galaxy 数据类型
export interface Galaxy {
  documentId: string; 
  id: string;
  name: string;
  color: string;
  description: string;
  planets: { documentId: string }[]; 
}

// 获取所有 Galaxy
export const getGalaxies = async (): Promise<Galaxy[]> => {
  try {
    const response = await apiClient.collection('galaxies').find({
      populate: {
        planets : {
          fields: ['documentId', 'name', 'color'] 
        }
      }
    });

    const galaxies: Galaxy[] = [];

    for (const item of response.data) {
      galaxies.push({
        documentId: item.documentId, 
        id: item.id,
        name: item.name,
        color: item.color,
        description: item.description,
        planets: item.planets
      })
    }

    return galaxies;
  } catch (error) {
    console.error('Error fetching galaxies:', error);
    throw error;
  }
};

// 获取单个 Galaxy
// 修改：参数使用documentId
export const getGalaxyByDocumentId = async (documentId: string): Promise<Galaxy> => {
  try {
    // 修改：使用documentId查询
    const response = await apiClient.collection('galaxies').findOne(documentId,
      {
        populate: {
          planets : {
            fields: ['documentId', 'name', 'color'] 
          }
        }
      }
    );

    const galaxy = {
      documentId: documentId, 
      id: response.data.id,
      name: response.data.name,
      color: response.data.color,
      description: response.data.description,
      planets: response.data.planets
    }

    return galaxy;
  } catch (error) {
    console.error(`Error fetching galaxy with documentId ${documentId}:`, error);
    throw error;
  }
};

// 更新 Galaxy
export const updateGalaxy = async (
  documentId: string,
  galaxyData: { name: string; description: string }): Promise<void> => {
  try {
    await apiClient.collection('galaxies').update(documentId, { data: galaxyData });
  } catch (error) {
    console.error(`Error updating galaxy with documentId ${documentId}:`, error);
    throw error;
  }
};
