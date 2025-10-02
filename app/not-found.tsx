import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 max-w-md text-center">
        <h1 className="font-bold text-4xl">Page not found</h1>
  <p className="mt-4 text-muted-foreground">We couldn&apos;t find the page you&apos;re looking for.</p>
        <Link href="/" className="inline-block bg-primary mt-6 px-4 py-2 rounded-md text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}
