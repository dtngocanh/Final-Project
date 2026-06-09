import React, { useEffect } from "react"; 
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import ProductSlider from "../components/Home/ProductSlider";
import FeatureSection from "../components/Home/FeatureSection";
import NewsletterSection from "../components/Home/NewsletterSection";
import { useSelector, useDispatch } from "react-redux"; 
import RecommendSlider from "../components/Home/RecommendSlider";
import { fetchAllProducts } from "../store/slices/productSlice"; 
const Index = () => {
  const dispatch = useDispatch(); 

  // Lấy dữ liệu từ Redux Store
  const { topRatedProducts, newProducts, loading } = useSelector(
    (state) => state.product
  );

  // 5. Kích hoạt gọi API đổ dữ liệu về Store khi vừa vào Trang Chủ
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <HeroSlider />
      <div className="container mx-auto px-4 pt-20">
        <CategoryGrid />
        
        <RecommendSlider />
        
        {/* Slider này giờ sẽ tự động sáng bừng khi newProducts có dữ liệu */}
        <ProductSlider 
          title="New Arrivals" 
          products={newProducts} 
          loading={loading} 
        />
        
        <FeatureSection />
        <NewsletterSection />
      </div>
    </div>
  );
};

export default Index;