
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Beef, ClipboardList, BarChart3, User, BookMarked } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 md:px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-1 md:gap-2 font-bold text-lg md:text-xl text-primary shrink-0">
          <Beef className="h-5 w-5 md:h-6 md:w-6" />
          <span className="inline-block">Pashudhan Insight</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 px-2 md:h-9 md:px-3 gap-1 md:gap-2 text-xs md:text-sm">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link href="/brands">
            <Button variant="ghost" size="sm" className="h-8 px-2 md:h-9 md:px-3 gap-1 md:gap-2 text-xs md:text-sm">
              <BookMarked className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Master Brands</span>
            </Button>
          </Link>
          <Link href="/surveys">
            <Button variant="ghost" size="sm" className="h-8 px-2 md:h-9 md:px-3 gap-1 md:gap-2 text-xs md:text-sm">
              <ClipboardList className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">My Surveys</span>
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9 shrink-0 ml-1">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
