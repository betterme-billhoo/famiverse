import apiClient from './strapiClient';

// 定义返回的 Galaxy 数据类型
export interface Galaxy {
  documentId: string; 
  id: string;
  name: string;
  color: string;
  description: string;
  planets: { documentId: string }[]; 
}

// 获取所有 Galaxy
export const getGalaxies = async (): Promise<Galaxy[]> => {
  try {
    const response = await apiClient.collection('galaxies').find({
      populate: {
        planets : {
          fields: ['documentId', 'name', 'color'] 
        }
      }
    });

    const galaxies: Galaxy[] = [];

    for (const item of response.data) {
      galaxies.push({
        documentId: item.documentId, 
        id: item.id,
        name: item.name,
        color: item.color,
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
// 修改：参数使用documentId
export const getGalaxyByDocumentId = async (documentId: string): Promise<Galaxy> => {
  try {
    // 修改：使用documentId查询
    const response = await apiClient.collection('galaxies').findOne(documentId,
      {
        populate: {
          planets : {
            fields: ['documentId', 'name', 'color'] 
          }
        }
      }
    );

    const galaxy = {
      documentId: documentId, 
      id: response.data.id,
      name: response.data.name,
      color: response.data.color,
      description: response.data.description,
      planets: response.data.planets
    }

    return galaxy;
  } catch (error) {
    console.error(`Error fetching galaxy with documentId ${documentId}:`, error);
    throw error;
  }
};

// 更新 Galaxy
export const updateGalaxy = async (
  documentId: string,
  galaxyData: { name: string; description: string }): Promise<void> => {
  try {
    await apiClient.collection('galaxies').update(documentId, { data: galaxyData });
  } catch (error) {
    console.error(`Error updating galaxy with documentId ${documentId}:`, error);
    throw error;
  }
};
