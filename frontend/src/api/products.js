import apiClient from './client';

export const getProducts = async (params) => {
  const response = await apiClient.get('/products', { params });
  return response.data;
};

export const getProduct = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data, shopId) => {
  const response = await apiClient.post(`/products?shop_id=${shopId}`, data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

export const uploadImage = async (id, file) => {
  const form = new FormData();
  form.append('file', file);
  return apiClient.post(`/products/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

export const getCategories = async (shopId) => {
  const response = await apiClient.get('/categories', {
    params: shopId ? { shop_id: shopId } : {}
  });
  return response.data;
};

export const getStockHistory = async (id) => {
  const response = await apiClient.get(`/stock/${id}/history`);
  return response.data;
};

export const adjustStock = async (data) => {
  const response = await apiClient.post('/stock/adjust', data);
  return response.data;
};