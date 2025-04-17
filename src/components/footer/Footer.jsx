import React from "react";
import RootLayout from "../../layout/RootLayout";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import MasterCard from "../../assets/mastercard.png";
import CreditCard from "../../assets/creditcard.png";
import Paypal from "../../assets/paypal.png";

const Footer = () => {
  return (
    <div className="w-full h-auto bg-neutral-950 py-12">
      <RootLayout>
        {/* Footer other content */}
        <div className="w-full grid grid-cols-5 gap-8">
          <div className="col-span-2 space-y-8 md:pr-10 pr-0">
            <div className="space-y-3">
              {/* Logo */}
              <Link to="/" className="text-6xl text-primary font-bold">
                ReTravel
              </Link>

              {/* Some description */}
              <p className="text-sm text-neutral-500 font-normal">
                ReTravel is a platform that connects users with travel experts
                to make travel planning easier and more enjoyable.
              </p>
            </div>

            {/* Social links */}
            <div className="w-full flex items-center gap-x-5">
              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaInstagram className="w-5 h-5 text-neutral-50" />
              </div>

              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaFacebookF className="w-5 h-5 text-neutral-50" />
              </div>

              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaYoutube className="w-5 h-5 text-neutral-50" />
              </div>

              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaLinkedin className="w-5 h-5 text-neutral-50" />
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1 space-y-5">
            <h1 className="text-lg text-neutral-100 font-semibold">
              Quick Links
            </h1>

            <div className="space-y-2">
              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                About Us
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                My Account
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Reserve your ticket
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Create your account
              </Link>
            </div>
          </div>

          {/* Top reserved routes */}
          <div className="col-span-1 space-y-5">
            <h1 className="text-lg text-neutral-100 font-semibold">
              Top Reserved Routes
            </h1>

            <div className="space-y-2">
              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Jakarta - Yogyakarta
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Yogyakarta - Jakarta
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Jakarta - Bali
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Bali - Jakarta
              </Link>
            </div>
          </div>

          {/* Support links */}
          <div className="col-span-1 space-y-5">
            <h1 className="text-lg text-neutral-100 font-semibold">
              Support Links
            </h1>

            <div className="space-y-2">
              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Privacy Policy
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Help & Support Center
              </Link>

              <Link
                to="/"
                className="block text-base text-neutral-500 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                FaQs
              </Link>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-neutral-800/50" />

        {/* Copyright */}
        <div className="w-full flex items-center justify-between">
          <p className="text-sm text-neutral-600 font-normal">
            Copyright &copy; 2025. All rights reserved
          </p>

          <div className="flex items-center gap-x-2">
            <div className="">
              <img
                src={MasterCard}
                alt=""
                className="w-fit h-9 object-contain object-ce"
              />
            </div>
            <div className="">
              <img
                src={Paypal}
                alt=""
                className="w-fit h-9 object-contain object-ce"
              />
            </div>
            <div className="">
              <img
                src={CreditCard}
                alt=""
                className="w-fit h-9 object-contain object-ce"
              />
            </div>
          </div>
        </div>
      </RootLayout>
    </div>
  );
};

export default Footer;
