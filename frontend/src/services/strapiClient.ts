// Copyright 2025 Bill Hoo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { strapi } from '@strapi/client';

const apiClient = strapi({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:1337/api',
  auth: "34883110f2b4fc6d3693327413359fa36975dc7503f9662bf3e614224422e1ceb1c483ac35eb4bf2ce061b76a9aa5d93985e084460d60b7eb6c3cfa02dee2a4f92020d402a6c4fded75799652fdc4d90f10195deeb9450c9d8144cfce2966b36b97c40eeebf20ee368659256aa40fe237c6461e5f7945e2409715f2357141d15"
});

export default apiClient;
