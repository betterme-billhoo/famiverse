import apiClient from './strapiClient';

// 定义返回的 Galaxy 数据类型
export interface Galaxy {
  id: string;
  name: string;
  description: string;
  planets: { id: string }[];
}

// 获取所有 Galaxy
export const getGalaxies = async (): Promise<Galaxy[]> => {
  try {
    const response = await apiClient.collection('galaxies').find({
      populate: {
        planets : {
          fields: ['id', 'name']
        }
      }
    });

    const galaxies: Galaxy[] = [];

    for (const item of response.data) {
      galaxies.push({
        id: item.id,
        name: item.name,
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
export const getGalaxyById = async (id: string): Promise<Galaxy> => {
  try {
    const response = await apiClient.collection('galaxies').findOne(id);

    const galaxy = {
      id: id,
      name: response.data.name,
      description: response.data.description,

      // Fixme: Implement later
      planets: []
    }

    return galaxy;
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
