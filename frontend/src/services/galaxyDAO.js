import strapi from './strapiClient';

// 获取所有银河系
export const getGalaxies = async () => {
  try {
    const response = await strapi.findMany('api::galaxy.galaxy');
    return response;
  } catch (error) {
    console.error('Error fetching galaxies:', error);
    throw error;
  }
};

// 获取特定银河系的详情
export const getGalaxyById = async (id) => {
  try {
    const response = await strapi.findOne('api::galaxy.galaxy', id);
    return response;
  } catch (error) {
    console.error(`Error fetching galaxy with id ${id}:`, error);
    throw error;
  }
};

// 创建一个新的银河系
export const createGalaxy = async (galaxyData) => {
  try {
    const response = await strapi.create('api::galaxy.galaxy', galaxyData);
    return response;
  } catch (error) {
    console.error('Error creating galaxy:', error);
    throw error;
  }
};

// 更新银河系
export const updateGalaxy = async (id, galaxyData) => {
  try {
    const response = await strapi.update('api::galaxy.galaxy', id, galaxyData);
    return response;
  } catch (error) {
    console.error(`Error updating galaxy with id ${id}:`, error);
    throw error;
  }
};

// 删除银河系
export const deleteGalaxy = async (id) => {
  try {
    const response = await strapi.delete('api::galaxy.galaxy', id);
    return response;
  } catch (error) {
    console.error(`Error deleting galaxy with id ${id}:`, error);
    throw error;
  }
};
