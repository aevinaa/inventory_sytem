import apiClient from './client';

export const scanSale = async (data) => {
  const response = await apiClient.post('/sales/scan', data);
  return response.data;
};

export const getRecentSales = async () => {
  // Assuming a generic endpoint exists or just re-using the reports one
  const response = await apiClient.get('/sales', { params: { limit: 10 } });
  return response.data;
};
