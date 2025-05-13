import apiClient from './strapiClient';

// 定义 Strapi 返回的嵌套类型
interface StrapiPlanet {
  id: string;
  attributes: {
    name: string;
  };
}

interface StrapiGalaxyAttributes {
  name: string;
  description: string;
  planets: {
    data: StrapiPlanet[];
  };
}

interface StrapiGalaxy {
  id: string;
  attributes: StrapiGalaxyAttributes;
}

interface StrapiFindResponse {
  data: StrapiGalaxy[];
}

interface StrapiFindOneResponse {
  data: StrapiGalaxy;
}

// 定义返回的 Galaxy 数据类型
export interface Galaxy {
  id: string;
  attributes: {
    name: string;
    description: string;
    planets: { id: string; attributes: { name: string } }[];
  };
}

// 获取所有 Galaxy
export const getGalaxies = async (): Promise<Galaxy[]> => {
  try {
    const response = await apiClient.collection('galaxies').find();
    const typedResponse = response as unknown as StrapiFindResponse;

    // 映射 Strapi 返回的数据到 Galaxy 类型
    return typedResponse.data.map(galaxy => ({
      id: galaxy.id,
      attributes: {
        name: galaxy.attributes.name,
        description: galaxy.attributes.description,
        planets: galaxy.attributes.planets?.data
          ? galaxy.attributes.planets.data.map((planet) => ({
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
    const typedResponse = response as unknown as StrapiFindOneResponse;

    // 映射 Strapi 返回的数据到 Galaxy 类型
    return {
      id: typedResponse.data.id,
      attributes: {
        name: typedResponse.data.attributes.name,
        description: typedResponse.data.attributes.description,
        planets: typedResponse.data.attributes.planets?.data
          ? typedResponse.data.attributes.planets.data.map((planet) => ({
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
    await apiClient.collection('galaxies').update(id, { data: galaxyData });
  } catch (error) {
    console.error(`Error updating galaxy with id ${id}:`, error);
    throw error;
  }
};
