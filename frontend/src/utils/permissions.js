import useAuthStore from '../store/authStore';

export const isAdmin = () => {
  const user = useAuthStore.getState().user;
  return user?.role === 'admin';
};

export const isStaff = () => {
  const user = useAuthStore.getState().user;
  return user?.role === 'staff' || user?.role === 'admin';
};

export const hasRole = (role) => {
  const user = useAuthStore.getState().user;
  return user?.role === role;
};
