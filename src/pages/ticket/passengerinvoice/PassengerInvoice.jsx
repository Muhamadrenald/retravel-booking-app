import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";

import BusImg from "../../../assets/bus.png";
import QrImg from "../../../assets/qrcode.jpg";
import { FaPhone } from "react-icons/fa";

const PassengerInvoice = () => {
  return (
    <div className="w-full col-span-4 rounded-3xl relative">
      {/* top bus details */}
      <div className="w-full flex items-center justify-between bg-primary px-6 py-3 rounded-tl-3xl">
        <div className="flex items-center gap-x-3">
          <img
            src={BusImg}
            alt="bus img"
            className="w-auto h-12 object-cover object-cente"
          />
          <h1 className="text-xl text-neutral-50 font-bold uppercase tracking-wider pt-1">
            Juragan Deluxe
          </h1>
        </div>

        <div className="flex items-center gap-x-2">
          <p className="text-xl text-neutral-50 font-bold">
            <span className="text-lg">(Bus No.)</span> J. N 1 AT
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-5 gap-8 items-center px-5 py-7 mb-7">
        <div className="col-span-4 space-y-3.5">
          {/* billno, per seat and date */}
          <div className="w-full flex items-center justify-between border-dashed border-b-2 border-neutral-200 pb-3">
            <p className="text-base text-neutral-500 font-normal">
              Bill No.: 123
            </p>

            <p className="text-base text-neutral-500 font-normal">
              Rp. 1.000.000 <span className="text-xs">/seat</span>
            </p>

            <p className="text-base text-neutral-500 font-normal">
              Date: 2025-04-26
            </p>
          </div>

          {/* passenger detail */}
          <div className="w-full flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-base text-neutral-600 font-normal">
                Name of Passenger: <span className="font-medium">John Doe</span>
              </p>

              <p className="text-base text-neutral-600 font-normal">
                Total Seat No.:{" "}
                <span className="font-medium">A2, A3, A4, B6</span>
              </p>

              <p className="text-base text-neutral-600 font-normal">
                Total No. Passenger:{" "}
                <span className="font-medium">04 Only</span>
              </p>

              <p className="text-base text-neutral-600 font-normal">
                Lion Air: <span className="font-medium">YIA, Yogyakarya</span>
              </p>
            </div>

            <div className="space-y-4 flex items-center justify-center flex-col">
              <div className="space-y-1 text-center">
                <p className="text-base text-neutral-600 font-normal">
                  Total Price
                </p>

                <h1 className="text-xl text-neutral-600 font-bold">
                  Rp. 1000.000
                </h1>
              </div>

              <div className="w-fit px-3 py-1 rounded-full bg-green-500/5 border border-green-600 text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                <FaCircleCheck size={16} />
                <span>Bill Paid</span>
              </div>

              {/* <div className="w-fit px-3 py-1 rounded-full bg-primary/5 border border-primary text-primary text-sm font-medium flex items-center justify-center gap-2">
                <IoCloseCircle size={16} />
                <span>Pending</span>
              </div> */}
            </div>
          </div>

          {/* route detail */}
          <div className="w-full flex items-center justify-between border-dashed border-t-2 border-neutral-200 pt-3">
            <p className="text-base text-neutral-600 font-normal">
              Jakarta
              <span className="text-neutral-400 px-2">-----</span>
              Yogyakarta
            </p>

            <p className="text-base text-neutral-600 font-normal">
              Arrive at 08.00 AM
            </p>

            <p className="text-base text-neutral-600 font-normal">
              Departue at 09.00 AM
            </p>
          </div>
        </div>

        <div className="col-span-1 border border-neutral-200 rounded-xl shadow-sm p-1">
          <img
            src={QrImg}
            alt=""
            className="w-full aspect-square object-cover object-center rounded-xl"
          />
        </div>
      </div>

      {/* left bottom section */}
      <div className="w-full bg-primary absolute bottom-0 left-0 rounded-bl-3xl flex items-center justify-between px-5 py-1.5">
        <p className="text-xs text-neutral-100 font-light">
          Note: 40% charge for service price 24 hours of program.
        </p>

        <div className="flex items-center gap-x-2">
          <FaPhone className="w-3 h-3 text-neutral-100" />
          <p className="text-sm text-neutral-100 font-light">
            +62-0897654321, +62-0123456789
          </p>
        </div>
      </div>
    </div>
  );
};

export default PassengerInvoice;
