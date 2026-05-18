import apiClient from './client';

export const getDailySales = async (targetDate, shopId) => {
  const response = await apiClient.get('/reports/daily-sales', {
    params: { target_date: targetDate, shop_id: shopId },
  });
  return response.data;
};

export const getSalesTrend = async (days = 30, shopId) => {
  const response = await apiClient.get(`/reports/sales-trend`, {
    params: { days, shop_id: shopId },
  });
  return response.data;
};

export const getLowStock = async (shopId) => {
  const response = await apiClient.get('/reports/low-stock', {
    params: { shop_id: shopId },
  });
  return response.data;
};

export const exportSalesExcel = async (dateFrom, dateTo, shopId) => {
  const response = await apiClient.get('/reports/export/sales/excel', {
    params: { date_from: dateFrom, date_to: dateTo, shop_id: shopId },
    responseType: 'blob',
  });
  downloadBlob(response.data, `sales_${dateFrom}_to_${dateTo}.xlsx`);
};

export const exportSalesPdf = async (dateFrom, dateTo, shopId) => {
  const response = await apiClient.get('/reports/export/sales/pdf', {
    params: { date_from: dateFrom, date_to: dateTo, shop_id: shopId },
    responseType: 'blob',
  });
  downloadBlob(response.data, `sales_${dateFrom}_to_${dateTo}.pdf`);
};

export const exportInventoryExcel = async (shopId) => {
  const response = await apiClient.get('/reports/export/inventory/excel', {
    params: { shop_id: shopId },
    responseType: 'blob',
  });
  downloadBlob(response.data, 'inventory.xlsx');
};

export const exportInventoryPdf = async (shopId) => {
  const response = await apiClient.get('/reports/export/inventory/pdf', {
    params: { shop_id: shopId },
    responseType: 'blob',
  });
  downloadBlob(response.data, 'inventory.pdf');
};