"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, BarChart3, User, BookMarked } from 'lucide-react';

const CowIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 15c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H7z" />
    <path d="M17 15l1.5-3.5c.3-.7.1-1.5-.5-2L15 7l-1-2h-4l-1 2-3 2.5c-.6.5-.8 1.3-.5 2L7 15" />
    <path d="M9 5c0-1.7-1.3-3-3-3s-3 1.3-3 3" />
    <path d="M15 5c0-1.7 1.3-3 3-3s3 1.3 3 3" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
  </svg>
);

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-2 md:px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-1 md:gap-2 font-bold text-sm md:text-xl text-primary shrink-0">
          <div className="bg-primary/10 p-1 rounded-lg shrink-0">
            <CowIcon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
          </div>
          <span className="inline-block tracking-tight text-xs md:text-xl truncate max-w-[120px] md:max-w-none">Cattle Feed Survey App</span>
        </Link>
        <div className="flex items-center gap-0.5 md:gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-7 px-1 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link href="/brands">
            <Button variant="ghost" size="sm" className="h-7 px-1 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm">
              <BookMarked className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Brands</span>
            </Button>
          </Link>
          <Link href="/surveys">
            <Button variant="ghost" size="sm" className="h-7 px-1 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm">
              <ClipboardList className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Surveys</span>
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="rounded-full h-7 w-7 md:h-9 md:w-9 shrink-0 ml-0.5">
            <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
