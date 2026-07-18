import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Navbar from "../layouts/navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto px-6 py-24 text-center">
        <span className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
          <Compass className="w-8 h-8 text-stone-400" strokeWidth={2} />
        </span>
        <h1 className="text-3xl font-semibold text-stone-900 mb-2">404</h1>
        <p className="text-sm text-stone-500 mb-8">
          We couldn't find the page you're looking for. It may have been moved or no longer exists.
        </p>
        <Link
          to="/"
          className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 rounded-full text-sm transition-colors"
        >
          Back to home
        </Link>
      </main>
    </>
  );
}
