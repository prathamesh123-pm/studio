
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Beef, ClipboardList, BarChart3, User, BookMarked } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Beef className="h-6 w-6" />
          <span className="hidden sm:inline">Pashudhan Insight</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/brands">
            <Button variant="ghost" size="sm" className="gap-2">
              <BookMarked className="h-4 w-4" />
              Master Brands
            </Button>
          </Link>
          <Link href="/surveys">
            <Button variant="ghost" size="sm" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              My Surveys
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
