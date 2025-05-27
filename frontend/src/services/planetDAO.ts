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
    let allPlanets: Planet[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await apiClient.collection('planets').find({
        populate: {
          galaxy: {
            fields: ['id', 'name'],
          }
        },
        pagination: {
          page: page,
          pageSize: 100
        }
      });
      
      const planets = response.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        galaxy: item.galaxy
      }));
      
      allPlanets = [...allPlanets, ...planets];
      
      // 检查是否还有更多页
      hasMore = (response.meta?.pagination?.page ?? 0) < (response.meta?.pagination?.pageCount ?? 0);
      page++;
    }

    return allPlanets;
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

