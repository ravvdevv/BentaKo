import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import {
  POSSidebar, CartHeader, CartTitle, CloseButton, EmptyCartWrapper, CartItemsWrapper,
  CartItem, CartItemImage, CartItemDetails, CartItemName, CartItemPrice, QuantityControl,
  QuantityButton, RemoveButton, CartFooter, TotalWrapper, CheckoutButton,
  CashSection, CashLabel, CashInputWrapper, CashInput, CurrencyPrefix, QuickCashGrid, QuickCashButton,
  ChangeDisplay, ChangeLabel, ChangeValue
} from './styles';
import { formatPrice } from '../../utils/formatPrice';
import { usePretext } from '../../hooks/usePretext';
import type { CartItem as CartItemType } from '../../types/cart';

interface CartProps {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cart: CartItemType[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  totalPrice: number;
  handleCheckout: () => void;
  cashReceived: number;
  setCashReceived: (val: number) => void;
  changeDue: number;
}

export const Cart = ({
  isCartOpen,
  setIsCartOpen,
  cart,
  updateQuantity,
  removeFromCart,
  totalPrice,
  handleCheckout,
  cashReceived,
  setCashReceived,
  changeDue,
}: CartProps) => {
  const quickCashLabels = [20, 50, 100, 200, 500, 1000];

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCashReceived(isNaN(val) ? 0 : val);
  };

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const totalPriceText = `₱${formatPrice(totalPrice)}`;
  const { height: totalHeight } = usePretext(totalPriceText, '800 28px Inter', 200);

  return (
    <>
      <POSSidebar isOpen={isCartOpen}>
        <div style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CartHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FiShoppingCart size={20} />
              <CartTitle>Current Bill</CartTitle>
            </div>
            <CloseButton onClick={() => setIsCartOpen(false)} aria-label="Close sidebar">&times;</CloseButton>
          </CartHeader>

          {cart.length === 0 ? (
            <EmptyCartWrapper>
              <FiShoppingCart size={48} />
              <p>Your cart is empty</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Select items to start a sale</p>
            </EmptyCartWrapper>
          ) : (
            <>
              <CartItemsWrapper>
                {cart.map(item => (
                  <CartItem key={item.id}>
                    <CartItemImage>{item.image}</CartItemImage>
                    <CartItemDetails>
                      <CartItemName>{item.name}</CartItemName>
                      <CartItemPrice>₱{formatPrice(item.price)}</CartItemPrice>
                    </CartItemDetails>
                    <QuantityControl>
                      <QuantityButton onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}>
                        <FiMinus size={14} />
                      </QuantityButton>
                      <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <QuantityButton onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} disabled={item.quantity >= item.stock}>
                        <FiPlus size={14} />
                      </QuantityButton>
                    </QuantityControl>
                    <RemoveButton onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}>
                      <FiTrash2 size={16} />
                    </RemoveButton>
                  </CartItem>
                ))}
              </CartItemsWrapper>

              <CartFooter>
                <TotalWrapper style={{ height: totalHeight > 0 ? `${totalHeight}px` : 'auto' }}>
                  <span>Total Amount</span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{totalPriceText}</span>
                </TotalWrapper>

                <CashSection>
                  <CashLabel>
                    <span>Cash Tendered</span>
                    {cashReceived > 0 && <span onClick={() => setCashReceived(0)} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Clear</span>}
                  </CashLabel>
                  <CashInputWrapper>
                    <CurrencyPrefix>₱</CurrencyPrefix>
                    <CashInput 
                      type="number" 
                      placeholder="0.00" 
                      value={cashReceived || ''} 
                      onChange={handleCashInput}
                    />
                  </CashInputWrapper>

                  <QuickCashGrid>
                    {quickCashLabels.map(amount => (
                      <QuickCashButton key={amount} onClick={() => handleQuickCash(amount)}>
                        +{amount}
                      </QuickCashButton>
                    ))}
                  </QuickCashGrid>

                  <ChangeDisplay hasChange={cashReceived >= totalPrice && totalPrice > 0}>
                    <ChangeLabel>Change Due</ChangeLabel>
                    <ChangeValue>₱{formatPrice(changeDue)}</ChangeValue>
                  </ChangeDisplay>

                  <CheckoutButton onClick={handleCheckout} disabled={cart.length === 0 || cashReceived < totalPrice}>
                    {cashReceived < totalPrice && totalPrice > 0 ? 'Insufficient Cash' : (
                      <>
                        <FiDollarSign size={20} />
                        Complete Transaction
                        <FiArrowRight size={18} />
                      </>
                    )}
                  </CheckoutButton>
                </CashSection>
              </CartFooter>
            </>
          )}
        </div>
      </POSSidebar>

      {/* Overlay for mobile drawer */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
        />
      )}
    </>
  );
};
