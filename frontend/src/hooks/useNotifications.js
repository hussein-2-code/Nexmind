import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000/api';

function useNotifications(dropdownOpen = false) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const fetchWithAuth = async (url, options = {}) => {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => fetchWithAuth('/notifications/unread-count').then((d) => d.data.unreadCount),
    enabled: !!token,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });

  const listQuery = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () =>
      fetchWithAuth('/notifications?limit=15').then((d) => ({
        notifications: d.data?.notifications || [],
        unreadCount: d.data?.unreadCount ?? 0,
      })),
    enabled: !!token && !!dropdownOpen,
    staleTime: 30 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => fetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => fetchWithAuth('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    unreadCount: unreadCountQuery.data ?? 0,
    unreadLoading: unreadCountQuery.isLoading,
    notifications: listQuery.data?.notifications ?? [],
    listLoading: listQuery.isLoading,
    refetchList: listQuery.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    markAllAsReadPending: markAllAsReadMutation.isPending,
  };
}

export default useNotifications;
