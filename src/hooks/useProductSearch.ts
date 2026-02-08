import { useState, useEffect, useRef, useMemo } from 'react';
import type { InventoryItem } from '../types/inventory';

export const useProductSearch = (allProducts: InventoryItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize filtered products to avoid recalculating on every render
  const filteredProducts = useMemo(() => {
    if (debouncedQuery === '') return allProducts;
    
    const lowerQuery = debouncedQuery.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery))
    );
  }, [allProducts, debouncedQuery]);

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    searchInputRef,
    filteredProducts,
  };
};
