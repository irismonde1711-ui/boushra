import { notFound } from "next/navigation";

// Any unknown URL inside a locale renders that locale's styled 404 page.
export default function CatchAll() {
  notFound();
}
