import { strapi } from '@strapi/client';

const apiClient = strapi({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  auth: "34883110f2b4fc6d3693327413359fa36975dc7503f9662bf3e614224422e1ceb1c483ac35eb4bf2ce061b76a9aa5d93985e084460d60b7eb6c3cfa02dee2a4f92020d402a6c4fded75799652fdc4d90f10195deeb9450c9d8144cfce2966b36b97c40eeebf20ee368659256aa40fe237c6461e5f7945e2409715f2357141d15"
});

export default apiClient;
