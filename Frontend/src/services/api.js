import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const productsApi = {
  getAll: () => api.get('/products').then(r => r.data),
  getById: (id) => api.get(`/products/${id}`).then(r => r.data),
  create: (product) => api.post('/products', product).then(r => r.data)
};

export const packagesApi = {
  getAll: () => api.get('/Packages').then(r => r.data),
  getById: (id) => api.get(`/Packages/${id}`).then(r => r.data),
  create: (pkg) => api.post('/Packages', pkg).then(r => r.data),
  update: (id, pkg) => api.put(`/Packages/${id}`, pkg).then(r => r.data),
  getByTrackingCode: (code) => api.get(`/Packages/track/${code}`).then(r => r.data)
};

export default api;