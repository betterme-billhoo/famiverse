import strapi from './strapiClient';

// 获取所有行星
export const getPlanets = async () => {
  try {
    const response = await strapi.findMany('api::planet.planet');
    return response;
  } catch (error) {
    console.error('Error fetching planets:', error);
    throw error;
  }
};

// 获取特定行星的详情
export const getPlanetById = async (id) => {
  try {
    const response = await strapi.findOne('api::planet.planet', id);
    return response;
  } catch (error) {
    console.error(`Error fetching planet with id ${id}:`, error);
    throw error;
  }
};

// 创建一个新的行星
export const createPlanet = async (planetData) => {
  try {
    const response = await strapi.create('api::planet.planet', planetData);
    return response;
  } catch (error) {
    console.error('Error creating planet:', error);
    throw error;
  }
};

// 更新行星
export const updatePlanet = async (id, planetData) => {
  try {
    const response = await strapi.update('api::planet.planet', id, planetData);
    return response;
  } catch (error) {
    console.error(`Error updating planet with id ${id}:`, error);
    throw error;
  }
};

// 删除行星
export const deletePlanet = async (id) => {
  try {
    const response = await strapi.delete('api::planet.planet', id);
    return response;
  } catch (error) {
    console.error(`Error deleting planet with id ${id}:`, error);
    throw error;
  }
};
