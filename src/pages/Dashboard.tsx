import { useState, type RefObject } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useInventoryList } from '../hooks/useInventory';
import { useCart } from '../hooks/useCart';
import { useProductSearch } from '../hooks/useProductSearch';
import { useProductModal } from '../hooks/useProductModal';
import { useCheckout } from '../hooks/useCheckout';
import { SearchBar } from '../components/dashboard/SearchBar';
import { ProductGrid } from '../components/dashboard/ProductGrid';
import { Cart } from '../components/dashboard/Cart';
import { ProductModal } from '../components/dashboard/ProductModal';
import {
  DashboardContainer, MainContent, LoadingWrapper, Spinner, ErrorWrapper, ErrorIcon, ErrorMessage,
  CartesianGridContainer, PayBar, PayBarTotal, PayBarLabel, PayBarAmount, PayBarButton
} from '../components/dashboard/styles';
import { formatPrice } from '../utils/formatPrice';

export default function Dashboard() {
  const { data: inventoryData, isLoading, error } = useInventoryList();
  const allProducts = Array.isArray(inventoryData) ? inventoryData : [];

  // Custom hooks
  const {
    cart, addToCart, updateQuantity, removeFromCart, clearCart,
    totalPrice, totalItems, cashReceived, setCashReceived, changeDue
  } = useCart();

  const { searchQuery, setSearchQuery, isSearchFocused, setIsSearchFocused, searchInputRef, filteredProducts } = useProductSearch(allProducts);
  const { productModal, closeProductModal, handleQuantityChange } = useProductModal();
  const { handleCheckout: processCheckout } = useCheckout();

  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCartFromModal = () => {
    if (!productModal.product) return;
    addToCart(productModal.product, productModal.quantity);
    closeProductModal();
  };

  const handleCheckout = () => {
    processCheckout(cart, filteredProducts, clearCart);
  };

  if (isLoading) {
    return (
      <LoadingWrapper>
        <Spinner />
      </LoadingWrapper>
    );
  }

  if (error) {
    return (
      <ErrorWrapper>
        <ErrorIcon>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </ErrorIcon>
        <ErrorMessage>
          Error loading inventory: {error.message}
        </ErrorMessage>
      </ErrorWrapper>
    );
  }

  return (
    <DashboardContainer>
      <MainContent>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>BentaKo POS</h1>
          <div style={{ display: 'none' }} /* Desktop cart title handled in sidebar */ />
        </div>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
          searchInputRef={searchInputRef as RefObject<HTMLInputElement>}
          hasResults={filteredProducts.length > 0}
        />

        <CartesianGridContainer style={{ marginTop: '2rem' }}>
          <ProductGrid
            products={filteredProducts}
            searchQuery={searchQuery}
            cart={cart}
            onProductClick={(product) => addToCart(product, 1)}
          />
        </CartesianGridContainer>
      </MainContent>

      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        changeDue={changeDue}
      />

      <ProductModal
        productModal={productModal}
        closeProductModal={closeProductModal}
        handleQuantityChange={handleQuantityChange}
        addToCartFromModal={addToCartFromModal}
      />

      {/* Floating Bar for Mobile/Tablet Portrait */}
      {cart.length > 0 && !isCartOpen && (
        <PayBar>
          <PayBarTotal>
            <PayBarLabel>Total Items: {totalItems}</PayBarLabel>
            <PayBarAmount>₱{formatPrice(totalPrice)}</PayBarAmount>
          </PayBarTotal>
          <PayBarButton onClick={() => setIsCartOpen(true)}>
            <FiShoppingCart />
            Check Out
          </PayBarButton>
        </PayBar>
      )}
    </DashboardContainer>
  );
}
