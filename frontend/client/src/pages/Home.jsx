import React, { lazy, Suspense, useEffect } from "react";
import { fetchAllProducts } from "../store/slices/productSlice";
import { useSelector, useDispatch } from "react-redux";
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import LazySection from "../components/common/LazySection";

// 1. Khai báo Lazy Loading cho các Component phụ trách từng vùng dữ liệu
const RecommendSlider = lazy(() => import("../components/Home/RecommendSlider"));
const RecipeBento = lazy(() => import("../components/Home/RecipeBento"));
const ProductSlider = lazy(() => import("../components/Home/ProductSlider"));
const MealPlanBanner = lazy(() => import("../components/Home/MealPlanBanner"));
const RecentlyViewed = lazy(() => import("../components/Home/RecentlyViewed"));
const FridgeBanner = lazy(() => import("../components/Home/FridgeBanner"));
const FeatureSection = lazy(() => import("../components/Home/FeatureSection"));
const NewsletterSection = lazy(() => import("../components/Home/NewsletterSection"));

// 2. Component Loading hiển thị tạm thời trong lúc tải file JS
const SectionLoader = () => (
  <div className="h-40 flex items-center justify-center text-gray-400">
    Loading section...
  </div>
);

const Index = () => {
  const dispatch = useDispatch();
  const { newProducts, loading } = useSelector((state) => state.product);

  // Kích hoạt lấy dữ liệu từ Backend khi vừa vào trang chủ
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Các phần trên cùng (Above the fold) hiển thị ngay lập tức, không lazy */}
      <HeroSlider />
      
      <div className="container mx-auto px-4 pt-20">
        <CategoryGrid />

        {/* Tách biệt từng Suspense để tối ưu hóa quá trình Render.
          Kết hợp class "content-visibility-auto" giúp trình duyệt bỏ qua việc vẽ 
          các phần nằm ngoài màn hình, giúp cuộn trang siêu mượt.
        */}
        
        <div className="content-visibility-auto contain-intrinsic-size-[400px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <RecommendSlider />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[500px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <RecipeBento />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[450px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <ProductSlider 
                title="New Arrivals" 
                products={newProducts} 
                loading={loading} 
              />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[300px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <MealPlanBanner />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[400px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <RecentlyViewed />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[300px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <FridgeBanner />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[350px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <FeatureSection />
            </Suspense>
          </LazySection>
        </div>

        <div className="content-visibility-auto contain-intrinsic-size-[250px]">
          <LazySection>
            <Suspense fallback={<SectionLoader />}>
              <NewsletterSection />
            </Suspense>
          </LazySection>
        </div>

      </div>
    </div>
  );
};

export default Index;