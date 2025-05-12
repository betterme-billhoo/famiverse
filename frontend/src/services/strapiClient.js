import Strapi from '@strapi/client';

const strapi = new Strapi({
  url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
});

export default strapi;
