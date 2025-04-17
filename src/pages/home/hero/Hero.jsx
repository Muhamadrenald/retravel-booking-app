import React from "react";
import { motion } from "framer-motion";
import RootLayout from "../../../layout/RootLayout";
import Search from "./search/Search";

const Hero = () => {
  const variants = {
    hidden: { opacity: 0, y: -800 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className='w-full flex-1 h-screen bg-[url("./assets/herobg.png")] bg-cover bg-center bg-no-repeat relative'
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.85, ease: "easeInOut" }}
    >
      <RootLayout className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-neutral-50/70 via-neutral-50/15 to-neutral-50/5 flex items-start justify-start text-center flex-col">
        {/* Title Section */}
        <div className="w-full pt-20 md:pt-22 space-y-2">
          <motion.p
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-lg text-neutral-500 font-medium"
          >
            Get you bus tickets
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 1.85, ease: "easeOut" }}
            className="text-5xl text-neutral-800 font-bold capitalize"
          >
            Find best bus for you!
          </motion.h1>
        </div>
        {/* Search Section */}
        <Search />
      </RootLayout>
    </motion.div>
  );
};

export default Hero;
