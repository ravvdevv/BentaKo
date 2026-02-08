import React from 'react';
import styled from 'styled-components';
import type { InventoryItem } from '../../types/inventory';
import { formatPrice } from '../../utils/formatPrice';

// Types
interface ProductCardProps {
  product: InventoryItem;
  onClick: () => void;
  isInCart: boolean;
}

// Styled Components
const CardWrapper = styled.div<{ disabled: boolean; isInCart: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 1.25rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.small};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${({ theme, isInCart }) => (isInCart ? theme.colors.primary : 'transparent')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-3px)')};
    box-shadow: ${({ disabled, theme }) => (disabled ? theme.shadows.small : theme.shadows.medium)};
  }
`;

const ProductImage = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ProductPrice = styled.div<{ isLowStock: boolean }>`
  color: ${({ theme, isLowStock }) => (isLowStock ? theme.colors.error : theme.colors.primary)};
  font-weight: 700;
  margin: 0.5rem 0;
  font-size: 1.1rem;
`;

const ProductStock = styled.div<{ isLowStock: boolean }>`
  font-size: 0.75rem;
  color: ${({ theme, isLowStock }) => (isLowStock ? theme.colors.error : theme.colors.textLight)};
  font-weight: ${({ isLowStock }) => (isLowStock ? 600 : 400)};
`;

const LowStockWarning = styled.div`
    color: ${({ theme }) => theme.colors.error};
    margin-top: 0.25rem;
    font-weight: 600;
`;

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onClick, isInCart }) => {
  const isLowStock = product.stock <= (product.minStockLevel || 5);

  return (
    <CardWrapper
      onClick={product.stock > 0 ? onClick : undefined}
      disabled={product.stock === 0}
      isInCart={isInCart}
    >
      <ProductImage>{product.image || '📦'}</ProductImage>
      <ProductName>{product.name}</ProductName>
      <ProductPrice isLowStock={isLowStock}>
        ₱{formatPrice(product.price)}
      </ProductPrice>
      <ProductStock isLowStock={isLowStock}>
        {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
        {product.minStockLevel !== undefined && isLowStock && product.stock > 0 && (
          <LowStockWarning>(Low Stock)</LowStockWarning>
        )}
      </ProductStock>
    </CardWrapper>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
