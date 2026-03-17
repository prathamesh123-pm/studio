"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, BarChart3, User, BookMarked } from 'lucide-react';

const CowIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 11V5l-2-2-2 2v6" />
    <path d="M9 11H3l-1 2v4a2 2 0 0 0 2 2h2" />
    <path d="M15 11h6l1 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M10 17v4" />
    <path d="M14 17v4" />
    <circle cx="12" cy="14" r="3" />
  </svg>
);

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 md:px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-1 md:gap-2 font-bold text-base md:text-xl text-primary shrink-0">
          <CowIcon className="h-5 w-5 md:h-6 md:w-6" />
          <span className="inline-block">Cattle Feed Survey App</span>
        </Link>
        <div className="flex items-center gap-0.5 md:gap-1 lg:gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-2 lg:px-3 gap-1 text-[10px] md:text-xs lg:text-sm">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link href="/brands">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-2 lg:px-3 gap-1 text-[10px] md:text-xs lg:text-sm">
              <BookMarked className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Brands</span>
            </Button>
          </Link>
          <Link href="/surveys">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-2 lg:px-3 gap-1 text-[10px] md:text-xs lg:text-sm">
              <ClipboardList className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Surveys</span>
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9 shrink-0 ml-0.5">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
