import { useEffect, useState } from 'react';
import { getGalaxies } from '../services/galaxyDAO';
import { getPlanets, Planet } from '../services/planetDAO';
import { GraphData, NodeData, LinkData } from '../types/graph';
import { Galaxy } from '@/services/galaxyDAO';

export function useApiGraphData(): GraphData {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

  useEffect(() => {
    async function fetchData() {
      try {
        const nodes: NodeData[] = [];
        const links: LinkData[] = [];

        const galaxies: Galaxy[] = await getGalaxies();
        const planets: Planet[] = await getPlanets();

        for(const galaxy of galaxies) {
          for(const planet of galaxy.planets) {
            const thePlanet = planets.find(p => p.id === planet.id);

            if(thePlanet) {

              // Push planet to nodes
              nodes.push({
                id: thePlanet.id,
                name: thePlanet.name,
                description: thePlanet.description,
                color: '#FFFFFF'
              });
              
            } else {
              console.error(`Planet with id ${planet.id} not found.`);
            }
          } // for
        }

        setGraphData({ nodes, links });
      } catch (error) {

        console.error('Error fetching data:', error);
        setGraphData({ nodes: [], links: [] });
      }
    }

    fetchData();
  }, []);

  return graphData;
}