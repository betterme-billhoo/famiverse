import apiClient from './strapiClient';

// 定义返回的 Topic 数据类型
export interface Topic {
  id: string;
  attributes: {
    name: string;
    description: string;
    content: string;
    planet: { id: string; attributes: { name: string } };
  };
}

// 定义 Strapi 返回的嵌套类型
interface StrapiPlanet {
  id: string;
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
  id: string;
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
      id: topic.id,
      attributes: {
        name: topic.attributes.name,
        description: topic.attributes.description,
        content: topic.attributes.content,
        planet: topic.attributes.planet?.data
          ? {
              id: topic.attributes.planet.data.id,
              attributes: {
                name: topic.attributes.planet.data.attributes.name
              }
            }
          : { id: '', attributes: { name: '' } }
      }
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

// 获取单个 Topic
export const getTopicById = async (id: string): Promise<Topic> => {
  try {
    const response = await apiClient.collection('topics').findOne(id);
    const typedResponse = response as unknown as StrapiFindOneResponse;

    return {
      id: typedResponse.data.id,
      attributes: {
        name: typedResponse.data.attributes.name,
        description: typedResponse.data.attributes.description,
        content: typedResponse.data.attributes.content,
        planet: typedResponse.data.attributes.planet?.data
          ? {
              id: typedResponse.data.attributes.planet.data.id,
              attributes: {
                name: typedResponse.data.attributes.planet.data.attributes.name
              }
            }
          : { id: '', attributes: { name: '' } }
      }
    };
  } catch (error) {
    console.error(`Error fetching topic with id ${id}:`, error);
    throw error;
  }
};

// 创建 Topic
export const createTopic = async (topicData: { name: string; description: string; content: string; planet: string }): Promise<Topic> => {
  try {
    const response = await apiClient.collection('topics').create({ data: topicData });
    return {
      id: response.data.id,
      attributes: response.data.attributes
    };
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// 更新 Topic
export const updateTopic = async (id: string, topicData: { name: string; description: string; content: string; planet: string }): Promise<Topic> => {
  try {
    const response = await apiClient.collection('topics').update(id, { data: topicData });
    return {
      id: response.data.id,
      attributes: response.data.attributes
    };
  } catch (error) {
    console.error(`Error updating topic with id ${id}:`, error);
    throw error;
  }
};

// 删除 Topic
export const deleteTopic = async (id: string): Promise<void> => {
  try {
    await apiClient.collection('topics').delete(id);
  } catch (error) {
    console.error(`Error deleting topic with id ${id}:`, error);
    throw error;
  }
};
