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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api',
  auth: "6768ac7095ce866fb94c02ece800b42c24dc587e863e37cdc58234790a115552b0051e8b4ab3c845aba81c4966e66188c35dece96eef5ccfce5bc6e41373dbb9965b95053afeb68fdcc5efdbea6a15cacf189d0b9084c99f499ecf6547bfdd35c13fb2c4a58462b9f3a33407b3965af2288d515b4b2e1dbf0d1e6ac42bcc4df5"
});

export default apiClient;
