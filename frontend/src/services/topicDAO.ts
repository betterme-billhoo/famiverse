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

// 定义返回的 Topic 数据类型
export interface Topic {
  documentId: string; 
  attributes: {
    name: string;
    description: string;
    content: string;
    planet: { documentId: string; attributes: { name: string } }; 
  };
}

// 定义 Strapi 返回的嵌套类型
interface StrapiPlanet {
  documentId: string; 
  attributes: {
    name: string;
  };
}

interface StrapiTopicAttributes {
  name: string;
  description: string;
  content: string;
  planet: {
    data: StrapiPlanet | null;
  };
}

interface StrapiTopic {
  documentId: string; 
  attributes: StrapiTopicAttributes;
}

interface StrapiFindResponse {
  data: StrapiTopic[];
}

interface StrapiFindOneResponse {
  data: StrapiTopic;
}

// 获取所有 Topic
export const getTopics = async (): Promise<Topic[]> => {
  try {
    const response = await apiClient.collection('topics').find();
    const typedResponse = response as unknown as StrapiFindResponse;

    return typedResponse.data.map(topic => ({
      documentId: topic.documentId, 
      attributes: {
        name: topic.attributes.name,
        description: topic.attributes.description,
        content: topic.attributes.content,
        planet: topic.attributes.planet?.data
          ? {
              documentId: topic.attributes.planet.data.documentId, 
              attributes: {
                name: topic.attributes.planet.data.attributes.name
              }
            }
          : { documentId: '', attributes: { name: '' } } 
      }
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

// 获取单个 Topic
// 修改：参数使用documentId
export const getTopicByDocumentId = async (documentId: string): Promise<Topic> => {
  try {
    // 修改：使用documentId查询
    const response = await apiClient.collection('topics').findOne(documentId);
    const typedResponse = response as unknown as StrapiFindOneResponse;

    return {
      documentId: typedResponse.data.documentId, 
      attributes: {
        name: typedResponse.data.attributes.name,
        description: typedResponse.data.attributes.description,
        content: typedResponse.data.attributes.content,
        planet: typedResponse.data.attributes.planet?.data
          ? {
              documentId: typedResponse.data.attributes.planet.data.documentId, 
              attributes: {
                name: typedResponse.data.attributes.planet.data.attributes.name
              }
            }
          : { documentId: '', attributes: { name: '' } } 
      }
    };
  } catch (error) {
    console.error(`Error fetching topic with documentId ${documentId}:`, error);
    throw error;
  }
};

// 为了向后兼容，保留使用id的方法，但内部调用documentId的方法
export const getTopicById = async (id: string): Promise<Topic> => {
  console.warn('getTopicById is deprecated, please use getTopicByDocumentId instead');
  return getTopicByDocumentId(id);
};

// 创建 Topic
export const createTopic = async (topicData: { name: string; description: string; content: string; planet: string }): Promise<Topic> => {
  try {
    const response = await apiClient.collection('topics').create({ data: topicData });
    return {
      documentId: response.data.documentId, 
      attributes: response.data.attributes
    };
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// 更新 Topic
// 修改：参数使用documentId
export const updateTopic = async (documentId: string, topicData: { name: string; description: string; content: string; planet: string }): Promise<Topic> => {
  try {
    // 修改：使用documentId更新
    const response = await apiClient.collection('topics').update(documentId, { data: topicData });
    return {
      documentId: response.data.documentId, 
      attributes: response.data.attributes
    };
  } catch (error) {
    console.error(`Error updating topic with documentId ${documentId}:`, error);
    throw error;
  }
};

// 删除 Topic
// 修改：参数使用documentId
export const deleteTopic = async (documentId: string): Promise<void> => {
  try {
    // 修改：使用documentId删除
    await apiClient.collection('topics').delete(documentId);
  } catch (error) {
    console.error(`Error deleting topic with documentId ${documentId}:`, error);
    throw error;
  }
};
