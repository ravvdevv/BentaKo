import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiHome, FiPackage, FiPieChart, FiCreditCard, FiShoppingCart, FiSearch, FiMenu, FiMonitor, FiSmartphone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useInventoryList } from '../hooks/useInventory';
import { useCart } from '../hooks/useCart';
import { useProductSearch } from '../hooks/useProductSearch';
import { useProductModal } from '../hooks/useProductModal';
import { useCheckout } from '../hooks/useCheckout';
import { useMobileDetect } from '../hooks/useMobileDetect';
import { ProductModal } from '../components/dashboard/ProductModal';
import { formatPrice } from '../utils/formatPrice';

// Styled Components for Mobile
const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const MobileHeader = styled.header`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const DeviceInfoBanner = styled.div`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ViewToggleButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.35rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const SearchContainer = styled.div`
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 80px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ProductCard = styled.div<{ disabled: boolean; isInCart: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  border: 2px solid ${({ theme, isInCart }) => (isInCart ? theme.colors.primary : 'transparent')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:active {
    transform: ${({ disabled }) => (disabled ? 'none' : 'scale(0.97)')};
  }
`;

const ProductImage = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductPrice = styled.div<{ isLowStock: boolean }>`
  color: ${({ theme, isLowStock }) => (isLowStock ? theme.colors.error : theme.colors.primary)};
  font-weight: 700;
  margin: 0.25rem 0;
  font-size: 1rem;
`;

const ProductStock = styled.div<{ isLowStock: boolean }>`
  font-size: 0.7rem;
  color: ${({ theme, isLowStock }) => (isLowStock ? theme.colors.error : theme.colors.textLight)};
  font-weight: ${({ isLowStock }) => (isLowStock ? 600 : 400)};
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
`;

const NavItem = styled.button<{ $isActive?: boolean }>`
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.textLight)};
  transition: color 0.2s;
  font-size: 0.7rem;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};

  svg {
    font-size: 1.25rem;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  h3 {
    margin: 0.5rem 0;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.background};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const CartDrawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s ease;
  z-index: 200;
  display: flex;
  flex-direction: column;
`;

const CartOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
  z-index: 199;
`;

const CartHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
`;

const CartContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.75rem;
`;

const CartItemImage = styled.div`
  font-size: 2rem;
`;

const CartItemDetails = styled.div`
  flex: 1;
`;

const CartItemName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const CartItemPrice = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 0.9rem;
`;

const CartItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: background 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const QuantityDisplay = styled.span`
  font-weight: 600;
  min-width: 30px;
  text-align: center;
`;

const RemoveButton = styled.button`
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const CartFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: white;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textLight};

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  p {
    margin: 0.5rem 0 0;
  }
`;

export default function Mobile() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, isTouchDevice } = useMobileDetect();
  
  const { data: inventoryData, isLoading, error } = useInventoryList();
  const allProducts = Array.isArray(inventoryData) ? inventoryData : [];
  
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { searchQuery, setSearchQuery, searchInputRef, filteredProducts } = useProductSearch(allProducts);
  const { productModal, openProductModal, closeProductModal, handleQuantityChange } = useProductModal();
  const { handleCheckout: processCheckout } = useCheckout();
  
  // Memoize cart item IDs for efficient lookups
  const cartItemIds = useMemo(() => new Set(cart.map(item => item.id)), [cart]);
  
  const getDeviceType = () => {
    if (isMobile) return 'Mobile';
    if (isTablet) return 'Tablet';
    if (isDesktop) return 'Desktop';
    return 'Unknown';
  };

  const addToCartFromModal = () => {
    if (!productModal.product) return;
    addToCart(productModal.product, productModal.quantity);
    closeProductModal();
  };

  const handleCheckout = () => {
    processCheckout(cart, filteredProducts, clearCart);
    setIsCartOpen(false);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <LoadingWrapper>
        <Spinner />
      </LoadingWrapper>
    );
  }

  // Handle error state
  if (error) {
    return (
      <MobileContainer>
        <EmptyState>
          <FiPackage />
          <h3>Error Loading Products</h3>
          <p>{error.message}</p>
        </EmptyState>
      </MobileContainer>
    );
  }

  // Main render
  return (
    <MobileContainer>
      <MobileHeader>
        <Logo>BentaKo!</Logo>
        <HeaderActions>
          <IconButton onClick={() => setIsCartOpen(true)}>
            <FiShoppingCart size={20} />
            {totalItems > 0 && <Badge>{totalItems}</Badge>}
          </IconButton>
          <IconButton>
            <FiMenu size={20} />
          </IconButton>
        </HeaderActions>
      </MobileHeader>

      <DeviceInfoBanner>
        <DeviceInfo>
          <FiSmartphone />
          <span>
            <strong>{getDeviceType()}</strong> {isTouchDevice && '• Touch'} • {window.innerWidth}x{window.innerHeight}
          </span>
        </DeviceInfo>
        <ViewToggleButton onClick={() => navigate('/')}>
          <FiMonitor size={14} />
          Desktop View
        </ViewToggleButton>
      </DeviceInfoBanner>

      {activeTab === 'home' && (
        <>
          <SearchContainer>
            <div style={{ position: 'relative' }}>
              <SearchIconWrapper>
                <FiSearch />
              </SearchIconWrapper>
              <SearchInput
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </SearchContainer>

          <ContentArea>
            {filteredProducts.length === 0 ? (
              <EmptyState>
                <FiPackage />
                <h3>No Products Found</h3>
                <p>
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'Add products to your inventory to get started'}
                </p>
              </EmptyState>
            ) : (
              <ProductGrid>
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= (product.minStockLevel || 5);
                  const isInCart = cartItemIds.has(product.id);

                  return (
                    <ProductCard
                      key={product.id}
                      onClick={() => product.stock > 0 && openProductModal(product)}
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
                      </ProductStock>
                    </ProductCard>
                  );
                })}
              </ProductGrid>
            )}
          </ContentArea>
        </>
      )}

      {activeTab === 'inventory' && (
        <ContentArea>
          <EmptyState>
            <FiPackage />
            <h3>Inventory</h3>
            <p>Inventory management coming soon</p>
          </EmptyState>
        </ContentArea>
      )}

      {activeTab === 'reports' && (
        <ContentArea>
          <EmptyState>
            <FiPieChart />
            <h3>Reports</h3>
            <p>Sales reports coming soon</p>
          </EmptyState>
        </ContentArea>
      )}

      {activeTab === 'utang' && (
        <ContentArea>
          <EmptyState>
            <FiCreditCard />
            <h3>Utang List</h3>
            <p>Debt tracking coming soon</p>
          </EmptyState>
        </ContentArea>
      )}

      <BottomNav>
        <NavItem $isActive={activeTab === 'home'} onClick={() => setActiveTab('home')}>
          <FiHome />
          <span>Home</span>
        </NavItem>
        <NavItem $isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
          <FiPackage />
          <span>Inventory</span>
        </NavItem>
        <NavItem $isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
          <FiPieChart />
          <span>Reports</span>
        </NavItem>
        <NavItem $isActive={activeTab === 'utang'} onClick={() => setActiveTab('utang')}>
          <FiCreditCard />
          <span>Utang</span>
        </NavItem>
      </BottomNav>

      <CartOverlay $isOpen={isCartOpen} onClick={() => setIsCartOpen(false)} />
      <CartDrawer $isOpen={isCartOpen}>
        <CartHeader>
          <h2>Cart ({totalItems})</h2>
          <IconButton onClick={() => setIsCartOpen(false)}>
            ✕
          </IconButton>
        </CartHeader>

        <CartContent>
          {cart.length === 0 ? (
            <EmptyCart>
              <FiShoppingCart />
              <h3>Your cart is empty</h3>
              <p>Add some products to get started</p>
            </EmptyCart>
          ) : (
            cart.map((item) => (
              <CartItem key={item.id}>
                <CartItemImage>{item.image || '📦'}</CartItemImage>
                <CartItemDetails>
                  <CartItemName>{item.name}</CartItemName>
                  <CartItemPrice>₱{formatPrice(item.price)}</CartItemPrice>
                  <CartItemActions>
                    <QuantityButton onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </QuantityButton>
                    <RemoveButton onClick={() => removeFromCart(item.id)}>Remove</RemoveButton>
                  </CartItemActions>
                </CartItemDetails>
              </CartItem>
            ))
          )}
        </CartContent>

        {cart.length > 0 && (
          <CartFooter>
            <TotalRow>
              <span>Total:</span>
              <span>₱{formatPrice(totalPrice)}</span>
            </TotalRow>
            <CheckoutButton onClick={handleCheckout}>
              Checkout
            </CheckoutButton>
          </CartFooter>
        )}
      </CartDrawer>

      <ProductModal
        productModal={productModal}
        closeProductModal={closeProductModal}
        handleQuantityChange={handleQuantityChange}
        addToCartFromModal={addToCartFromModal}
      />
    </MobileContainer>
  );
}
