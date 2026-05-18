import client from './client';

export const getSuppliers = () => client.get('/suppliers').then(r => r.data);
export const createSupplier = (data) => client.post('/suppliers', data).then(r => r.data);
export const updateSupplier = (id, data) => client.put(`/suppliers/${id}`, data).then(r => r.data);
export const deleteSupplier = (id) => client.delete(`/suppliers/${id}`).then(r => r.data);