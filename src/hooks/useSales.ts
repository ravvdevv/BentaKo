import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSales, addSale } from '../services/salesService';
import type { Sale, CartItem } from '../types/sales';

const SALES_QUERY_KEYS = {
  all: ['sales'],
  lists: () => [...SALES_QUERY_KEYS.all, 'list'],
};

export const useSalesList = () => {
  return useQuery<Sale[], Error>({
    queryKey: SALES_QUERY_KEYS.lists(),
    queryFn: getSales,
  });
};

export const useAddSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cart: CartItem[]) => addSale(cart),
    onSuccess: () => {
      // Invalidate all sales queries to trigger a refetch of reports
      queryClient.invalidateQueries({ queryKey: SALES_QUERY_KEYS.all });
    },
  });
};
