import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import RootLayout from "../../../layouts/RootLayout";
import Search from "./search/Search";
import useBanners from "../../../hooks/useBanners";

const Banner = () => {
  const { banners, loading, error } = useBanners();

  const variants = {
    hidden: { opacity: 0, y: -800 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-xl text-neutral-600">Loading banner...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full flex-1 h-screen bg-neutral-50 relative"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.85, ease: "easeInOut" }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 10000, // Changed from 5000 to 10000 (10 seconds)
          disableOnInteraction: false,
        }}
        loop
        className="h-screen w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="w-full h-screen bg-cover bg-center bg-no-repeat relative"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            >
              <RootLayout className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 flex items-start justify-start text-center flex-col">
                <div className="w-full pt-20 md:pt-22 space-y-2">
                  <motion.p
                    initial={{ opacity: 0, y: -800 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -800 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="text-lg text-neutral-500 font-medium"
                  >
                    {banner.name || "Get your travel tickets"}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: -800 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -800 }}
                    transition={{ duration: 1.85, ease: "easeOut" }}
                    className="text-5xl text-neutral-800 font-bold capitalize"
                  >
                    Find the best travel for you!
                  </motion.h1>
                </div>

                {/* Search Section */}
                <Search />
              </RootLayout>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default Banner;
