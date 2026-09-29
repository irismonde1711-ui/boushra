"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3200,
        style: {
          background: "#141413",
          color: "#f5f0e6",
          border: "1px solid rgba(233,186,12,0.35)",
          borderRadius: 0,
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#e9ba0c", secondary: "#0a0a0a" } },
      }}
    />
  );
}
