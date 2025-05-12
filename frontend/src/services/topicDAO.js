import strapi from './strapiClient';

// 获取所有主题
export const getTopics = async () => {
  try {
    const response = await strapi.findMany('api::topic.topic');
    return response;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

// 获取特定主题的详情
export const getTopicById = async (id) => {
  try {
    const response = await strapi.findOne('api::topic.topic', id);
    return response;
  } catch (error) {
    console.error(`Error fetching topic with id ${id}:`, error);
    throw error;
  }
};

// 创建一个新的主题
export const createTopic = async (topicData) => {
  try {
    const response = await strapi.create('api::topic.topic', topicData);
    return response;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// 更新主题
export const updateTopic = async (id, topicData) => {
  try {
    const response = await strapi.update('api::topic.topic', id, topicData);
    return response;
  } catch (error) {
    console.error(`Error updating topic with id ${id}:`, error);
    throw error;
  }
};

// 删除主题
export const deleteTopic = async (id) => {
  try {
    const response = await strapi.delete('api::topic.topic', id);
    return response;
  } catch (error) {
    console.error(`Error deleting topic with id ${id}:`, error);
    throw error;
  }
};
