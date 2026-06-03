import React from "react";
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import ProductSlider from "../components/Home/ProductSlider";
import FeatureSection from "../components/Home/FeatureSection";
import NewsletterSection from "../components/Home/NewsletterSection";
import { useSelector } from "react-redux";
import RecommendSlider from "../components/Home/RecommendSlider";

const Index = () => {
  const { topRatedProducts, newProducts } = useSelector(
    (state) => state.product
  );
  return (
    <div className="min-h-screen">
      <HeroSlider />
      <div className="container mx-auto px-4 pt-20">
        <CategoryGrid />
        <RecommendSlider/>
        <ProductSlider title="New Arrivals" products={newProducts} />
        <FeatureSection />
        <NewsletterSection />
      </div>
    </div>
  );
};

export default Index;
