"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      toastOptions={{
        style: {
          border: "none",
          background: "#333",
          color: "#fff",
        },
      }}
      position="top-right"
    />
  );
}
