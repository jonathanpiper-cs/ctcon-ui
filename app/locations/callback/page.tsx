"use client";

import dynamic from "next/dynamic";

const OAuthCallback = dynamic(
  () =>
    import("./OAuthCallback").then((mod) => mod.OAuthCallback),
  {
    ssr: false,
  }
);

const callback = () => {
  return <OAuthCallback />;
};

export default callback;
