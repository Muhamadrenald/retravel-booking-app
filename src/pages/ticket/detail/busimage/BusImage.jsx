import React from "react";

const BusImage = () => {
  return (
    <div className="w-full grid grid-cols-4 gap-5 items-center border-t border-neutral-300 pt-7 pb-2">
      <div className="w-full rounded-xl overflow-hidden">
        <img
          //   src="https://cdn.pixabay.com/photo/2020/09/21/11/41/bus-5589826_1280.jpg"
          src="https://cdn.pixabay.com/photo/2017/07/30/14/44/bus-2554514_1280.jpg"
          alt="bus images"
          className="w-full aspect-video object-cover object-center rounded-xl border border-neutral-300/50 bg-neutral-200/15"
        />
      </div>

      <div className="w-full rounded-xl overflow-hidden">
        <img
          //   src="https://cdn.pixabay.com/photo/2020/09/21/11/41/bus-5589826_1280.jpg"
          src="https://cdn.pixabay.com/photo/2017/07/27/19/10/bus-2546383_640.jpg"
          alt="bus images"
          className="w-full aspect-video object-cover object-center rounded-xl border border-neutral-300/50 bg-neutral-200/15"
        />
      </div>

      <div className="w-full rounded-xl overflow-hidden">
        <img
          //   src="https://cdn.pixabay.com/photo/2020/09/21/11/41/bus-5589826_1280.jpg"
          src="https://cdn.pixabay.com/photo/2017/07/30/14/44/bus-2554514_1280.jpg"
          alt="bus images"
          className="w-full aspect-video object-cover object-center rounded-xl border border-neutral-300/50 bg-neutral-200/15"
        />
      </div>

      <div className="w-full rounded-xl overflow-hidden">
        <img
          //   src="https://cdn.pixabay.com/photo/2020/09/21/11/41/bus-5589826_1280.jpg"
          src="https://cdn.pixabay.com/photo/2018/03/07/16/07/coach-3206326_1280.png"
          alt="bus images"
          className="w-full aspect-video object-cover object-center rounded-xl border border-neutral-300/50 bg-neutral-200/15"
        />
      </div>
    </div>
  );
};

export default BusImage;
