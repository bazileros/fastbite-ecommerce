import { Skeleton } from '@/components/ui/skeleton';

export function HeaderSkeleton() {
  return (
    <header className="top-0 z-50 sticky bg-background/80 backdrop-blur-md border-b w-full glass-effect">
      <div className="mx-auto px-4 container">
        <div className="flex justify-between items-center py-3 min-h-[72px]">
          {/* Logo Skeleton */}
          <div className="flex flex-shrink-0 items-center space-x-2">
            <Skeleton className="rounded-lg w-8 h-8" />
            <Skeleton className="w-24 h-6" />
          </div>

          {/* Navigation Skeleton - Desktop */}
          <div className="hidden lg:flex flex-shrink-0 items-center space-x-6 xl:space-x-8">
            <Skeleton className="rounded-md w-64 h-10" />
            <div className="flex space-x-6">
              <Skeleton key="nav-menu" className="w-16 h-4" />
              <Skeleton key="nav-about" className="w-16 h-4" />
              <Skeleton key="nav-contact" className="w-16 h-4" />
            </div>
          </div>

          {/* Store Info Skeleton - Desktop */}
          <div className="hidden 2xl:flex flex-shrink-0 items-center space-x-4 xl:space-x-6">
            <div key="store-pickup" className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div key="store-hours" className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div key="store-phone" className="flex items-center space-x-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
          </div>

          {/* Right Actions Skeleton */}
          <div className="flex flex-shrink-0 items-center space-x-1 xl:space-x-2">
            <Skeleton className="rounded-md w-10 h-10" />
            <Skeleton className="rounded-md w-10 h-10" />
            <Skeleton className="rounded-md w-10 h-10" />
            <Skeleton className="lg:hidden rounded-md w-10 h-10" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function SearchSkeleton() {
  return (
    <div className="relative w-full max-w-md">
      <Skeleton className="rounded-md w-full h-10" />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-20 h-6" />
      </div>
      <div className="space-y-3">
        <div key="cart-item-1" className="flex justify-between items-center p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="rounded w-12 h-12" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-16 h-4" />
        </div>
        <div key="cart-item-2" className="flex justify-between items-center p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="rounded w-12 h-12" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-16 h-4" />
        </div>
        <div key="cart-item-3" className="flex justify-between items-center p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Skeleton className="rounded w-12 h-12" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
      <Skeleton className="rounded-md w-full h-12" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="rounded-lg w-full aspect-square" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-3" />
      <div className="flex justify-between items-center">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="rounded-md w-20 h-8" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-48 h-8" />
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <ProductCardSkeleton key="product-1" />
        <ProductCardSkeleton key="product-2" />
        <ProductCardSkeleton key="product-3" />
        <ProductCardSkeleton key="product-4" />
        <ProductCardSkeleton key="product-5" />
        <ProductCardSkeleton key="product-6" />
      </div>
    </div>
  );
}