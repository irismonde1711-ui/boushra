"use client";

import { useEffect, useState } from "react";

// The cart lives in localStorage, which the server can't see. Rendering cart-derived
// values only after mount avoids a server/client hydration mismatch.
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
