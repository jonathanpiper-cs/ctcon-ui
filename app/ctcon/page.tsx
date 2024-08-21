"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dyanmically import CTCon to avoid window undefined
const CTCon = dynamic(() => import("./CTCon").then((mod) => mod.default), { ssr: false });

const CTConPage = () => {
  return (
    <Suspense>
      <CTCon />
    </Suspense>
  );
};

export default CTConPage;
