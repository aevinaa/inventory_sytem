import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import useShopStore from '../store/shopStore';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
    const { currentShop } = useShopStore();
    const queryClient = useQueryClient();
    const [newName, setNewName] = useState('');

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories', currentShop?.id],
        queryFn: async () => {
            const res = await apiClient.get('/categories', {
                params: { shop_id: currentShop?.id }
            });
            return res.data;
        },
        enabled: !!currentShop?.id,
    });

    const createMutation = useMutation({
        mutationFn: async (name) => {
            const res = await apiClient.post('/categories', {
                name,
                shop_id: currentShop?.id,
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Category created');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setNewName('');
        },
        onError: (e) => toast.error(e.response?.data?.detail || 'Failed'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            toast.success('Category deleted');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createMutation.mutate(newName.trim());
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a3c5e' }}>Categories</h1>
                <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                    {currentShop?.name}
                </p>
            </div>

            {/* Add form */}
            <form onSubmit={handleAdd} style={{
                display: 'flex', gap: 10, marginBottom: 24,
            }}>
                <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="New category name e.g. Necklaces"
                    style={{
                        flex: 1, padding: '10px 14px',
                        border: '1.5px solid #e5e7eb', borderRadius: 8,
                        fontSize: 14, outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1a3c5e'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                    type="submit"
                    disabled={createMutation.isPending}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px', borderRadius: 8,
                        background: '#1a3c5e', color: 'white',
                        border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: 600,
                    }}
                >
                    <Plus size={16} />
                    Add
                </button>
            </form>

            {/* List */}
            <div style={{
                background: 'white', borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}>
                {isLoading ? (
                    <p style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Loading...</p>
                ) : categories.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                        <p style={{ fontSize: 32, marginBottom: 8 }}>🏷️</p>
                        <p>No categories yet. Add one above.</p>
                    </div>
                ) : (
                    categories.map((cat, i) => (
                        <div key={cat.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', padding: '14px 20px',
                            borderBottom: i < categories.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                                {cat.name}
                            </span>
                            <button
                                onClick={() => deleteMutation.mutate(cat.id)}
                                style={{
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', color: '#dc2626',
                                    padding: 6, borderRadius: 6,
                                }}
                                title="Delete category"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Categories;