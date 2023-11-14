"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const CTCon = dynamic(() => import("./CTCon").then((mod) => mod.default), { ssr: false });

const CTConPage = () => {
  return (
    <Suspense>
      <CTCon />
    </Suspense>
  );
};

export default CTConPage;
