import apiClient from './strapiClient';

// 定义返回的 Planet 数据类型
export interface Planet {
  id: string;
  attributes: {
    name: string;
    description: string;
    galaxy: { id: string; attributes: { name: string } };
    topics: { id: string; attributes: { name: string } }[];
  };
}

// 获取所有 Planet
export const getPlanets = async (): Promise<Planet[]> => {
  try {
    const response = await apiClient.collection('planets').find();
    // 映射 Strapi 返回的数据到 Planet 类型
    return (response.data as any[]).map((planet) => ({
      id: planet.id,
      attributes: {
        name: planet.attributes.name,
        description: planet.attributes.description,
        galaxy: planet.attributes.galaxy?.data
          ? {
              id: planet.attributes.galaxy.data.id,
              attributes: {
                name: planet.attributes.galaxy.data.attributes.name
              }
            }
          : { id: '', attributes: { name: '' } },
        topics: planet.attributes.topics?.data
          ? planet.attributes.topics.data.map((topic: any) => ({
              id: topic.id,
              attributes: {
                name: topic.attributes.name
              }
            }))
          : []
      }
    }));
  } catch (error) {
    console.error('Error fetching planets:', error);
    throw error;
  }
};

// 获取单个 Planet
export const getPlanetById = async (id: string): Promise<Planet> => {
  try {
    const response = await apiClient.collection('planets').findOne(id);
    // 映射 Strapi 返回的数据到 Planet 类型
    return {
      id: response.data.id,
      attributes: {
        name: response.data.attributes.name,
        description: response.data.attributes.description,
        galaxy: response.data.attributes.galaxy?.data
          ? {
              id: response.data.attributes.galaxy.data.id,
              attributes: {
                name: response.data.attributes.galaxy.data.attributes.name
              }
            }
          : { id: '', attributes: { name: '' } },
        topics: response.data.attributes.topics?.data
          ? response.data.attributes.topics.data.map((topic: any) => ({
              id: topic.id,
              attributes: {
                name: topic.attributes.name
              }
            }))
          : []
      }
    };
  } catch (error) {
    console.error(`Error fetching planet with id ${id}:`, error);
    throw error;
  }
};

// 创建 Planet
export const createPlanet = async (planetData: { name: string; description: string; galaxy: string }): Promise<Planet> => {
  try {
    const response = await apiClient.collection('planets').create({ data: planetData });
    return {
      id: response.data.id,
      attributes: response.data.attributes
    };
  } catch (error) {
    console.error('Error creating planet:', error);
    throw error;
  }
};

// 更新 Planet
export const updatePlanet = async (id: string, planetData: { name: string; description: string; galaxy: string }): Promise<Planet> => {
  try {
    const response = await apiClient.collection('planets').update(id, { data: planetData });
    return {
      id: response.data.id,
      attributes: response.data.attributes
    };
  } catch (error) {
    console.error(`Error updating planet with id ${id}:`, error);
    throw error;
  }
};

// 删除 Planet
export const deletePlanet = async (id: string): Promise<void> => {
  try {
    await apiClient.collection('planets').delete(id);
  } catch (error) {
    console.error(`Error deleting planet with id ${id}:`, error);
    throw error;
  }
};
