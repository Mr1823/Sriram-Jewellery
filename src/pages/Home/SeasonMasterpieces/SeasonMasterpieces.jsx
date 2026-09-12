import React from 'react';
import { Link } from 'react-router-dom';
import useProducts from '../../../hooks/useProducts';

const SeasonMasterpieces = () => {
  const [products, isProductsLoading] = useProducts();

  const fallbackImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA50x0y5imFYK00xXphjLkXenRuRpzPWcd5NVgxc1wSY6dWz7GdCR0uEn2G0_yD4EG4G1uLrjSYw_Tu1kPwWlAqs7n1La_Nza-ZD91d4XOP2yZoYcNaENrCNMnjKzf4I7QQwuDwMTO2XnfMN8srDXirsSrEYtWiMj3jEy19E2jnGdyvGcIn6wMIAjZ5qFE-ilV97BRJt5Qj_l7G7ylcpcSppv9BeI2xWxBcqUmRRJOdSE6AR2XPvHhYxinE3iWaMSaT838v0BTMn7c",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFBw7YPXt4hS_H3Aa9fW3oru67obHm_tZKHc565pb1XPZTBQtA4TrbjFNsbGIW_n3h4npOBt5JuTpy5-djPgA1q8W2RlpxYER_F-NEJ8txCpm_lAPpTSkyjpU4k5HLfkpMaiVBwLwoAnmY9FWYlWF-THoX1sKIMlfCG7Gm0KIne_iuPLbHDMmGCItP1vJpmbfi1JcYVfwFIWzt0gG6AxlE3UiqAkL7CY-OrkosDsohN2LQ06E0UkIksX2wfULwXqT07VMA_EK5xk4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD5nHWPuLBABkd9E1BshlaIA1Mzvvrc5X3FJtE5sUr-Q5sfVDu-GrVOkiF6NqrgE9HZt3L455GNJLXN5pv59Nr0XLdN1eAW_gAPHiNICOgf9Ohp6gfHcfdC6Z0TVRcYutQdhNqoofGifRbig2Rd3_oDdj3vUpYeO0CpnUEpeQ7rYSgSrGV5ecp7jFMEm_OAtlSBkfs9UD0aAc7fOMRpu_ipeGj32wPC7JcwPKlPZ5HpDO7683_-HhyPpnsEpzaV1poVbiYiteWIbtU"
  ];

  const featuredItems = products?.slice(0, 3) || [];

  return (
    <section className="bg-surface-container-low py-section-gap-sm mb-section-gap-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="font-label-caps text-label-caps text-primary/60 block mb-2">CURATED FOR YOU</span>
            <h2 className="font-headline-md text-headline-md text-primary">The Season's Masterpieces</h2>
          </div>
          <Link className="font-button-text text-button-text text-primary flex items-center gap-2 min-h-11 hover:gap-4 transition-ui group" to="/shop">
            View All Collections <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        
        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter h-[500px]">
            <div className="col-span-2 md:col-span-2 animate-pulse bg-surface-container rounded-lg h-full"></div>
            <div className="col-span-1 animate-pulse bg-surface-container rounded-lg h-full"></div>
            <div className="col-span-1 animate-pulse bg-surface-container rounded-lg h-full"></div>
          </div>
        ) : featuredItems.length >= 3 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {/* Hero Product (Spans 2 columns) */}
            {featuredItems[0] && (
              <Link to={`/products/${featuredItems[0]._id}/description`} className="col-span-2 md:col-span-2 group relative block">
                <div className="relative aspect-[16/9] md:aspect-auto md:h-[500px] overflow-hidden mb-6 border border-outline-variant/30">
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                    style={{ backgroundImage: `url('${featuredItems[0].images?.[0] || featuredItems[0].img || fallbackImages[0]}')` }}
                  ></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-primary-fixed m-4"></div>
                  <div className="absolute top-6 right-6 bg-primary text-white px-4 py-1.5 text-[10px] font-label-caps tracking-widest">FEATURED MASTERPIECE</div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline-sm text-[24px] text-primary group-hover:text-secondary transition-colors">{featuredItems[0].name}</h4>
                    <p className="font-body-base text-on-surface-variant">{featuredItems[0].category || featuredItems[0].categoryName || 'Fine Jewellery'}</p>
                  </div>
                  <p className="font-headline-sm text-[24px] text-primary">
                    {featuredItems[0].isQuoteOnly ? "Quote" : `₹${(featuredItems[0].price || featuredItems[0].computedPrice || 0).toLocaleString("en-IN")}`}
                  </p>
                </div>
              </Link>
            )}

            {/* Standard Product 1 */}
            {featuredItems[1] && (
              <Link to={`/products/${featuredItems[1]._id}/description`} className="col-span-1 group block">
                <div className="relative aspect-[3/4] overflow-hidden mb-4 border border-outline-variant/30">
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url('${featuredItems[1].images?.[0] || featuredItems[1].img || fallbackImages[1]}')` }}
                  ></div>
                </div>
                <h4 className="font-button-text text-[14px] text-primary truncate">{featuredItems[1].name}</h4>
                <p className="font-label-caps text-[12px] text-primary mt-1">
                  {featuredItems[1].isQuoteOnly ? "Quote" : `₹${(featuredItems[1].price || featuredItems[1].computedPrice || 0).toLocaleString("en-IN")}`}
                </p>
              </Link>
            )}

            {/* Standard Product 2 */}
            {featuredItems[2] && (
              <Link to={`/products/${featuredItems[2]._id}/description`} className="col-span-1 group block">
                <div className="relative aspect-[3/4] overflow-hidden mb-4 border border-outline-variant/30">
                  <div 
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ backgroundImage: `url('${featuredItems[2].images?.[0] || featuredItems[2].img || fallbackImages[2]}')` }}
                  ></div>
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 text-[10px] font-label-caps text-primary">LIMITED</div>
                </div>
                <h4 className="font-button-text text-[14px] text-primary truncate">{featuredItems[2].name}</h4>
                <p className="font-label-caps text-[12px] text-primary mt-1">
                  {featuredItems[2].isQuoteOnly ? "Quote" : `₹${(featuredItems[2].price || featuredItems[2].computedPrice || 0).toLocaleString("en-IN")}`}
                </p>
              </Link>
            )}
          </div>
        ) : (
          <p className="text-center text-on-surface-variant font-body-base">Not enough featured items available.</p>
        )}
      </div>
    </section>
  );
};

export default SeasonMasterpieces;
