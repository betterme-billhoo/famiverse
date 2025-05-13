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

// 定义 Strapi 返回的嵌套类型
interface StrapiTopic {
  id: string;
  attributes: {
    name: string;
  };
}

interface StrapiGalaxy {
  id: string;
  attributes: {
    name: string;
  };
}

interface StrapiPlanetAttributes {
  name: string;
  description: string;
  galaxy: {
    data: StrapiGalaxy | null;
  };
  topics: {
    data: StrapiTopic[];
  };
}

interface StrapiPlanet {
  id: string;
  attributes: StrapiPlanetAttributes;
}

interface StrapiFindResponse {
  data: StrapiPlanet[];
}

interface StrapiFindOneResponse {
  data: StrapiPlanet;
}

// 获取所有 Planet
export const getPlanets = async (): Promise<Planet[]> => {
  try {
    const response = await apiClient.collection('planets').find();
    const typedResponse = response as unknown as StrapiFindResponse;

    return typedResponse.data.map(planet => ({
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
          ? planet.attributes.topics.data.map(topic => ({
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
    const typedResponse = response as unknown as StrapiFindOneResponse;

    return {
      id: typedResponse.data.id,
      attributes: {
        name: typedResponse.data.attributes.name,
        description: typedResponse.data.attributes.description,
        galaxy: typedResponse.data.attributes.galaxy?.data
          ? {
              id: typedResponse.data.attributes.galaxy.data.id,
              attributes: {
                name: typedResponse.data.attributes.galaxy.data.attributes.name
              }
            }
          : { id: '', attributes: { name: '' } },
        topics: typedResponse.data.attributes.topics?.data
          ? typedResponse.data.attributes.topics.data.map(topic => ({
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
