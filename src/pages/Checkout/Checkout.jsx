import React, { createContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useUserInfo from "../../hooks/useUserInfo";
import Payment from "../Payment/Payment";
import useCart from "../../hooks/useCart";
import useAuthContext from "../../hooks/useAuthContext";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import CustomHelmet from "../../components/CustomHelmet/CustomHelmet";
import toast from "react-hot-toast";

// Payment Context to handle payment info
export const PaymentContext = createContext(null);

const Checkout = () => {
  const { user } = useAuthContext();
  const [userFromDB] = useUserInfo();
  const [axiosSecure] = useAxiosSecure();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const { cartData, cartSubtotal, refetch } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // "Buy Now" hands a single product straight to checkout without touching the
  // cart. When present it replaces the cart for this session only; the cart
  // itself is left untouched (and not cleared on success).
  const buyNowItem = location.state?.buyNow || null;
  const checkoutItems = buyNowItem ? [buyNowItem] : cartData;
  const checkoutSubtotal = buyNowItem
    ? (buyNowItem.price || 0) * (buyNowItem.quantity || 1)
    : cartSubtotal?.subtotal || 0;

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    
    // For card payments, the order is already created and verified in Payment.jsx.
    // If we reach here, it means they clicked Complete Order after Razorpay success,
    // or they are using COD/UPI.
    if (paymentMethod === "card" && paymentInfo?.status === "success") {
      const goToConfirmation = () => {
        navigate("/order-success", {
          state: {
            orderStatus: "success",
            from: location,
            orderId: paymentInfo.orderId,
          },
        });
        setPaymentInfo(null);
        refetch();
      };

      // A "Buy Now" checkout never involved the cart, so clearing it here would
      // silently discard items the customer had not bought yet. This mirrors
      // the COD path, where the backend skips the cart wipe when buyNow is set.
      if (buyNowItem) {
        goToConfirmation();
        return;
      }

      axiosSecure.delete("/orders/delete-cart-items").then(goToConfirmation);
      return;
    }

    axiosSecure
      .post("/orders", {
        name: user?.name || userFromDB?.name || "Customer",
        paymentMethod,
        items: checkoutItems, // Backend expects `items`
        buyNow: !!buyNowItem,
        shippingAddress: userFromDB?.shippingAddress,
      })
      .then((res) => {
        if (res.data.success) {
          navigate("/order-success", {
            state: {
              orderStatus: "success",
              from: location,
              orderId: res.data.data._id,
            },
          });
          setPaymentInfo(null);
          refetch();
        } else {
          toast.error(res.data.error || "Failed to place order.");
          setIsPlacingOrder(false);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.error || "Failed to place order.");
        setIsPlacingOrder(false);
      });
  };

  return (
    <main className="pt-32 pb-section-gap-lg max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop min-h-screen font-body-base bg-background">
      <CustomHelmet title="Checkout" />
      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Left Side: Form (60%) */}
        <div className="w-full lg:w-[60%] fade-in">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 mb-10 text-on-surface-variant font-label-caps tracking-widest text-[11px]">
            <Link to="/shop" className="hover:text-primary transition-colors">SHOP</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">CHECKOUT</span>
          </nav>
          
          <section className="mb-12">
            <h2 className="font-display-lg text-headline-sm mb-8 text-primary">Shipping Address</h2>
            {userFromDB?.shippingAddress ? (
              <div className="p-6 border border-outline-variant/30 bg-white space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-[0.2em] block mb-1">Name</span>
                    <p className="text-on-surface font-semibold">
                      {userFromDB?.shippingAddress.firstName} {userFromDB?.shippingAddress.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-[0.2em] block mb-1">Email</span>
                    <p className="text-on-surface font-semibold">
                      {userFromDB?.shippingAddress.email}
                    </p>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-[0.2em] block mb-1">Phone</span>
                    <p className="text-on-surface font-semibold">
                      {userFromDB?.shippingAddress.number || userFromDB?.shippingAddress.mobileNumber}
                    </p>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-[0.2em] block mb-1">City</span>
                    <p className="text-on-surface font-semibold">
                      {userFromDB?.shippingAddress.city}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-outline-variant/20">
                  <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-[0.2em] block mb-1">Full Address</span>
                  <p className="text-on-surface">
                    {userFromDB?.shippingAddress.streetAddress}, {userFromDB?.shippingAddress.city},{" "}
                    {userFromDB?.shippingAddress.state} - {userFromDB?.shippingAddress.postalCode},{" "}
                    {userFromDB?.shippingAddress.country}
                  </p>
                </div>
                <Link
                  to="/dashboard/myAddress"
                  className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors font-label-caps text-xs mt-4"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  EDIT ADDRESS
                </Link>
              </div>
            ) : (
              <div className="border border-outline-variant/30 bg-surface-container-low p-8 text-center space-y-6">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">location_on</span>
                <p className="text-on-surface-variant">You have not added a shipping or billing address yet.</p>
                <Link
                  to="/dashboard/myAddress"
                  className="inline-flex items-center gap-2 bg-primary text-white font-button-text uppercase tracking-[0.2em] px-8 py-4 hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Address
                </Link>
              </div>
            )}
          </section>

          <section className="mb-12">
            <h2 className="font-display-lg text-headline-sm mb-8 text-primary">Payment Method</h2>
            <div className="space-y-4">
              <label 
                className={`flex flex-col p-5 bg-white border cursor-pointer hover:border-primary transition-ui group ${paymentMethod === 'card' ? 'border-primary' : 'border-outline-variant'}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <input 
                      checked={paymentMethod === 'card'} 
                      readOnly
                      className="text-primary focus:ring-primary w-5 h-5 border-outline-variant" 
                      type="radio" 
                      name="payment" 
                    />
                    <span className="font-label-caps text-on-surface">CREDIT CARD</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="mt-6 pt-6 border-t border-outline-variant/30 px-2" onClick={(e) => e.stopPropagation()}>
                    <PaymentContext.Provider
                      value={{
                        // The items and the total must come from the same
                        // source: Payment used to read the cart itself, so a
                        // "Buy Now" checkout billed the cart while showing the
                        // Buy Now total.
                        orderTotal: checkoutSubtotal,
                        checkoutItems: checkoutItems,
                        isBuyNow: !!buyNowItem,
                        setPaymentInfo: setPaymentInfo,
                      }}
                    >
                      <Payment />
                    </PaymentContext.Provider>
                  </div>
                )}
              </label>

              <label 
                className={`flex items-center justify-between p-5 bg-white border cursor-pointer hover:border-primary transition-ui group ${paymentMethod === 'upi' ? 'border-primary' : 'border-outline-variant'}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="flex items-center gap-4">
                  <input 
                    checked={paymentMethod === 'upi'}
                    readOnly
                    className="text-primary focus:ring-primary w-5 h-5 border-outline-variant" 
                    type="radio" 
                    name="payment" 
                  />
                  <span className="font-label-caps text-on-surface">UPI / QR SCAN</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">qr_code_2</span>
              </label>

              <label 
                className={`flex items-center justify-between p-5 bg-white border cursor-pointer hover:border-primary transition-ui group ${paymentMethod === 'cod' ? 'border-primary' : 'border-outline-variant'}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="flex items-center gap-4">
                  <input 
                    checked={paymentMethod === 'cod'}
                    readOnly
                    className="text-primary focus:ring-primary w-5 h-5 border-outline-variant" 
                    type="radio" 
                    name="payment" 
                  />
                  <span className="font-label-caps text-on-surface">CASH ON DELIVERY</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">payments</span>
              </label>
            </div>
          </section>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant/30">
            <Link to="/shop" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[12px]">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              RETURN TO SHOP
            </Link>
            <button 
              className="w-full md:w-auto px-12 py-5 bg-primary-container text-on-primary-container font-button-text text-button-text uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-ui shadow-lg shadow-primary/10 text-center disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
              onClick={handlePlaceOrder}
              disabled={
                (!paymentInfo && paymentMethod === "card") ||
                !userFromDB?.shippingAddress ||
                isPlacingOrder ||
                !checkoutItems?.length
              }
            >
              {isPlacingOrder ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : 'Complete Order'}
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary (40%) */}
        <aside className="w-full lg:w-[40%]">
          <div className="lg:sticky lg:top-32 p-8 bg-surface-container border border-outline-variant/30 rounded-none fade-in">
            <h3 className="font-display-lg text-headline-sm mb-8 text-primary border-b border-outline-variant/30 pb-4">Order Summary</h3>
            
            {/* Item List */}
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {checkoutItems?.map((item, idx) => (
                // A "Buy Now" item is constructed client-side and has no _id,
                // so fall back to the product id (then index) for a stable key.
                <div key={item._id || item.productId || `item-${idx}`} className="flex items-center gap-4 group">
                  <div className="w-20 h-20 bg-white border border-outline-variant/20 overflow-hidden flex-shrink-0">
                    <img 
                      src={item.img || item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-display-lg text-body-lg text-on-surface line-clamp-1">{item.name}</p>
                    <p className="text-[12px] font-label-caps text-on-surface-variant mt-1">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="font-label-caps text-primary">₹{(item.price || item.discountPrice)?.toLocaleString("en-IN")}</p>
                </div>
              ))}
              {(!checkoutItems || checkoutItems.length === 0) && (
                <div className="text-center py-10 flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">shopping_bag</span>
                  <p className="font-body-base text-on-surface-variant">Your cart is empty</p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-8 border-t border-outline-variant/30">
              <div className="flex justify-between items-center text-on-surface-variant font-label-caps text-[12px]">
                <span>SUBTOTAL</span>
                <span>₹{(checkoutSubtotal || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant font-label-caps text-[12px]">
                <span>ESTIMATED SHIPPING</span>
                <span className="text-secondary">FREE</span>
              </div>
              {paymentInfo && (
                <div className="flex justify-between items-center text-on-surface-variant font-label-caps text-[12px]">
                  <span>PAYMENT STATUS</span>
                  <span className="text-success font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    PAID
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-6 mt-4 border-t border-primary/20">
                <span className="font-display-lg text-headline-sm text-primary">Total</span>
                <span className="font-display-lg text-headline-sm text-primary">
                  ₹{(checkoutSubtotal || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-outline-variant/30 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                <span className="text-[10px] font-label-caps tracking-widest">SECURE</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                <span className="text-[10px] font-label-caps tracking-widest">INSURED</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                <span className="text-[10px] font-label-caps tracking-widest">GUARANTEE</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
