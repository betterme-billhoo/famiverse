import { strapi } from '@strapi/client';

const apiClient = strapi({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api'
});

export default apiClient;
