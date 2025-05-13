import apiClient from './strapiClient';

// 定义返回的 Planet 数据类型
export interface Planet {
  id: string;
  name: string;
  description: string;
  galaxy: { id: string; };
  topics?: { id: string; attributes: { name: string } }[];
}

// 获取所有 Planet
export const getPlanets = async (): Promise<Planet[]> => {
  try {
    const response = await apiClient.collection('planets').find();
    const planets: Planet[] = [];

    for (const item of response.data) {
      planets.push({
        id: item.id,
        name: item.name,
        description: item.description,
        galaxy: item.galaxy?.data
         ? { id: item.galaxy.data.id }
          : { id: '' },
      })
    }

    return planets;
  } catch (error) {
    console.error('Error fetching planets:', error);
    throw error;
  }
};

// 获取单个 Planet
export const getPlanetById = async (id: string): Promise<Planet> => {
  try {
    const response = await apiClient.collection('planets').findOne(id);
    const planet = {
      id: response.data.id,
      name: response.data.attributes.name,
      description: response.data.attributes.description,
      galaxy: response.data.attributes.galaxy?.data
        ? { id: response.data.attributes.galaxy.data.id }
        : { id: '' },
    };

    return planet;
  } catch (error) {
    console.error(`Error fetching planet with id ${id}:`, error);
    throw error;
  }
};

