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
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.small};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid ${({ theme, isInCart }) => (isInCart ? theme.colors.primary : 'transparent')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-4px)')};
    box-shadow: ${({ disabled, theme }) => (disabled ? theme.shadows.small : '0 10px 20px -5px rgba(0, 0, 0, 0.1)')};
    border-color: ${({ theme, disabled, isInCart }) => (!disabled && !isInCart ? theme.colors.primary + '40' : undefined)};
  }

  &:active {
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(0.96)')};
  }

  ${({ isInCart, theme }) => isInCart && `
    &::after {
      content: '✓';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: ${theme.colors.primary};
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
  `}
`;

const ProductImage = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  transition: transform 0.2s;
  
  ${CardWrapper}:hover & {
    transform: scale(1.1);
  }
`;

const ProductName = styled.div`
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.4rem;
  line-height: 1.2;
`;

const ProductPrice = styled.div<{ isLowStock: boolean }>`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800;
  margin: 0.5rem 0;
  font-size: 1.25rem;
  background: ${({ theme }) => theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  display: inline-block;
  align-self: center;
`;

const ProductStock = styled.div<{ isLowStock: boolean }>`
  font-size: 0.75rem;
  color: ${({ theme, isLowStock }) => (isLowStock ? theme.colors.error : theme.colors.textLight)};
  font-weight: ${({ isLowStock }) => (isLowStock ? 700 : 500)};
  margin-top: auto;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`;

const LowStockWarning = styled.div`
    color: ${({ theme }) => theme.colors.error};
    font-size: 0.7rem;
    margin-top: 0.15rem;
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
      <ProductName title={product.name}>{product.name}</ProductName>
      <ProductPrice isLowStock={isLowStock}>
        ₱{formatPrice(product.price)}
      </ProductPrice>
      <ProductStock isLowStock={isLowStock}>
        {product.stock === 0 ? '🚫 Out of Stock' : `Stock: ${product.stock}`}
        {product.minStockLevel !== undefined && isLowStock && product.stock > 0 && (
          <LowStockWarning>Refill Soon!</LowStockWarning>
        )}
      </ProductStock>
    </CardWrapper>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
