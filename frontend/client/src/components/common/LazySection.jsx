import React, { Suspense } from "react";
import { useInView } from "react-intersection-observer";

const LazySection = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px",
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
          {children}
        </Suspense>
      ) : (
        <div style={{ minHeight: "200px" }} />
      )}
    </div>
  );
};

export default LazySection;