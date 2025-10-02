'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LoyaltyProgram } from '@/components/loyalty-program';

export default function LoyaltyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to menu
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">FastBite Rewards</h1>
            <p className="text-muted-foreground">Earn points, unlock rewards, enjoy perks</p>
          </div>
        </div>

        <LoyaltyProgram />
      </div>
    </div>
  );
}