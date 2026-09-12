import React from "react";
import { Link } from "react-router-dom";
import useUserInfo from "../../../hooks/useUserInfo";
import useAuthContext from "../../../hooks/useAuthContext";
import useOrders from "../../../hooks/useOrders";
import useWishlist from "../../../hooks/useWishlist";

const MyDashboard = () => {
  const [userFromDB] = useUserInfo();
  const { user } = useAuthContext();
  const { orders, isOrdersLoading } = useOrders();
  const [wishlist, isWishlistLoading] = useWishlist();

  // Get most recent 2 orders
  const recentOrders = orders?.slice(0, 2) || [];
  
  // Get most recent 4 wishlist items
  const recentWishlist = wishlist?.slice(0, 4) || [];

  return (
    <div className="w-full">
      <header className="mb-12">
        <span className="font-body-base text-[12px] font-semibold text-secondary tracking-[0.2em] uppercase block mb-2">
          Your Account
        </span>
        <h1 className="font-display-lg text-5xl md:text-6xl text-primary">Overview</h1>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Recent Orders */}
        <section className="bg-surface-dim p-8 border border-sand transition-ui duration-500 hover:shadow-[0_20px_40px_-10px_rgba(139,100,71,0.08)] flex flex-col h-full">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-sm text-headline-sm text-primary">Recent Orders</h2>
            <Link to="/dashboard/myOrders" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors">View All</Link>
          </div>
          <div className="space-y-6 flex-grow">
            {isOrdersLoading ? (
              <div className="text-on-surface-variant font-body-base">Loading orders...</div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div key={order._id || index} className="flex items-center gap-4 pb-6 border-b border-sand/20 last:border-0 last:pb-0">
                  <div className="w-20 h-20 bg-surface-container-low overflow-hidden border border-sand/30">
                    <img className="w-full h-full object-cover" src={order.items?.[0]?.image || "https://placehold.co/100x100"} alt="Order Item" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-body-base text-body-base font-semibold text-primary">{order.items?.[0]?.name || "Jewellery Item"}</p>
                    <p className="text-xs font-label-caps text-on-surface-variant mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-label-caps">{order.status || "Processing"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-variant font-body-base">No recent orders found.</div>
            )}
          </div>
        </section>

        {/* Wishlist Preview */}
        <section className="bg-surface-container p-8 border border-sand transition-ui duration-500 hover:shadow-[0_20px_40px_-10px_rgba(139,100,71,0.08)] flex flex-col h-full">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-sm text-headline-sm text-primary">Wishlist</h2>
            <Link to="/dashboard/wishlist" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors">View Wishlist</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-grow">
            {isWishlistLoading ? (
              <div className="text-on-surface-variant font-body-base col-span-2">Loading wishlist...</div>
            ) : recentWishlist.length > 0 ? (
              recentWishlist.map((item, index) => (
                <div key={item._id || index} className="group cursor-pointer overflow-hidden border border-sand/30">
                  <div className="aspect-square relative">
                    <img className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" src={item.image} alt={item.name} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-variant font-body-base col-span-2">Your wishlist is empty.</div>
            )}
          </div>
        </section>

        {/* Saved Addresses */}
        <section className="bg-surface-container p-8 border border-sand transition-ui duration-500 hover:shadow-[0_20px_40px_-10px_rgba(139,100,71,0.08)] flex flex-col h-full">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-sm text-headline-sm text-primary">Address Book</h2>
            <Link to="/dashboard/myAddress" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors">Manage</Link>
          </div>
          <div className="p-6 bg-background/50 border border-sand/20 flex-grow">
            {userFromDB?.shippingAddress ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-label-caps border border-secondary/20">Default</span>
                  <span className="material-symbols-outlined text-sand text-sm">home</span>
                </div>
                <p className="font-body-base text-body-base font-semibold mb-2">
                  {[userFromDB.shippingAddress.firstName, userFromDB.shippingAddress.lastName]
                    .filter(Boolean)
                    .join(" ") || userFromDB?.name}
                </p>
                <p className="font-body-base text-body-base text-on-surface-variant leading-relaxed">
                  {userFromDB.shippingAddress.streetAddress}
                  <br />
                  {userFromDB.shippingAddress.city}, {userFromDB.shippingAddress.state} -{" "}
                  {userFromDB.shippingAddress.postalCode}
                  <br />
                  {userFromDB.shippingAddress.country}
                </p>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-4">
                <span className="material-symbols-outlined text-sand text-3xl">location_off</span>
                <p className="font-body-base text-body-base text-on-surface-variant">
                  No address saved yet.
                </p>
                <Link
                  to="/dashboard/myAddress"
                  className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors border-b border-secondary/40"
                >
                  Add an address
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Account Details */}
        <section className="bg-surface-container p-8 border border-sand transition-ui duration-500 hover:shadow-[0_20px_40px_-10px_rgba(139,100,71,0.08)] flex flex-col h-full">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-sm text-headline-sm text-primary">Account Profile</h2>
            <Link to="/dashboard/accountDetails" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors">Edit Profile</Link>
          </div>
          <div className="space-y-6 flex-grow">
            <div className="flex justify-between border-b border-sand/20 pb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Full Name</span>
              <span className="font-body-base text-body-base font-medium text-right">{userFromDB?.name || user?.displayName}</span>
            </div>
            <div className="flex justify-between border-b border-sand/20 pb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Email Address</span>
              <span className="font-body-base text-body-base font-medium text-right">{userFromDB?.email || user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-sand/20 pb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Phone</span>
              <span className="font-body-base text-body-base font-medium text-right">{userFromDB?.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Member Since</span>
              <span className="font-body-base text-body-base font-medium text-right">{new Date(user?.metadata?.creationTime || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyDashboard;
