import type { CartItem, Sale } from '../types/sales';

const SALES_STORAGE_KEY = 'sarisariai_sales';

export const getSales = (): Sale[] => {
  try {
    const salesJson = localStorage.getItem(SALES_STORAGE_KEY);
    if (!salesJson) {
      return [];
    }
    const sales = JSON.parse(salesJson);
    // Add a check to ensure the parsed data is an array
    if (!Array.isArray(sales)) {
        console.error('Sales data from localStorage is not an array:', sales);
        return [];
    }
    return sales;
  } catch (error) {
    console.error('Error parsing sales from localStorage:', error);
    // If parsing fails, it might be a good idea to clear the corrupted data
    localStorage.removeItem(SALES_STORAGE_KEY);
    return [];
  }
};

export const addSale = async (cart: CartItem[]): Promise<void> => {
  try {
    const existingSales = getSales();
    const saleDate = new Date().toISOString();
    const newSale: Sale[] = cart.map(item => ({ ...item, date: saleDate }));
    const updatedSales = [...existingSales, ...newSale];
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(updatedSales));
    return Promise.resolve();
  } catch (error) {
    console.error('Error saving sale to localStorage', error);
    return Promise.reject(error);
  }
};
