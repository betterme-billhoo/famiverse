import apiClient from './strapiClient';

// 定义返回的 Galaxy 数据类型
export interface Galaxy {
  id: string;
  attributes: {
    name: string;
    description: string;
    planets: { id: string | string; attributes: { name: string } }[];
  };
}

// 获取所有 Galaxy
export const getGalaxies = async (): Promise<Galaxy[]> => {
  try {
    const response = await apiClient.collection('galaxies').find();

    // 映射 Strapi 返回的数据到 Galaxy 类型
    return (response.data as any[]).map(galaxy => ({
      id: galaxy.id,
      attributes: {
        name: galaxy.attributes.name,
        description: galaxy.attributes.description,
        planets: galaxy.attributes.planets?.data
          ? galaxy.attributes.planets.data.map((planet: any) => ({
              id: planet.id,
              attributes: {
                name: planet.attributes.name
              }
            }))
          : []
      }
    }));
  } catch (error) {
    console.error('Error fetching galaxies:', error);
    throw error;
  }
};

// 获取单个 Galaxy
export const getGalaxyById = async (id: string): Promise<Galaxy> => {
  try {
    const response = await apiClient.collection('galaxies').findOne(id);

    // 映射 Strapi 返回的数据到 Galaxy 类型
    return {
      id: response.data.id,
      attributes: {
        name: response.data.attributes.name,
        description: response.data.attributes.description,
        planets: response.data.attributes.planets?.data
          ? response.data.attributes.planets.data.map((planet: any) => ({
              id: planet.id,
              attributes: {
                name: planet.attributes.name
              }
            }))
          : []
      }
    };
  } catch (error) {
    console.error(`Error fetching galaxy with id ${id}:`, error);
    throw error;
  }
};

// 更新 Galaxy
export const updateGalaxy = async (
  id: string,
  galaxyData: { name: string; description: string }): Promise<void> => {
  try {
    // Strapi v5 推荐参数格式为 { data: {...} }
    const response = await apiClient.collection('galaxies').update(id, { data: galaxyData });
  } catch (error) {
    console.error(`Error updating galaxy with id ${id}:`, error);
    throw error;
  }
};
