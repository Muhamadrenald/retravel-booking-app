import React from "react";
import Services from "./services/Services";
import TopSearch from "./topsearch/TopSearch";
import Activities from "../activities/Activities";
import Promo from "../promo/Promo";
import Categories from "../categories/Categories";
import Cart from "../cart/Cart";
import Transaction from "../transaction/Transaction";
import Banner from "./hero/Banner";

const Home = () => {
  return (
    <div className="space-y-16 w-full min-h-screen pb-16">
      {/* Hero */}
      <Banner />

      {/* Categories */}
      <Categories />

      {/* Activities */}
      {/* <Activities /> */}

      {/* Promo */}
      <Promo />

      {/* Cart */}
      {/* <Cart /> */}

      {/* Transaction */}
      {/* <Transaction /> */}

      {/* Services */}
      <Services />

      {/* Top Search */}
      <TopSearch />
    </div>
  );
};

export default Home;
