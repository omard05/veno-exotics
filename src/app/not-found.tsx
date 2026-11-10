import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="h-display mt-4 text-6xl">Wrong turn.</h1>
        <Link href="/" className="btn-ghost mt-10">Return Home</Link>
      </div>
    </main>
  );
}
