"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, BarChart3, User, BookMarked, Truck, Settings, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

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
  const [profileName, setProfileName] = useState("");
  const [profileId, setProfileId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('last_surveyor_name') || "";
    const savedId = localStorage.getItem('last_surveyor_id') || "";
    setProfileName(savedName);
    setProfileId(savedId);
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('last_surveyor_name', profileName);
    localStorage.setItem('last_surveyor_id', profileId);
    toast({
      title: "प्रोफाईल अपडेट झाले",
      description: "तुमची माहिती आता सर्व फॉर्ममध्ये आपोआप भरली जाईल.",
    });
    setIsOpen(false);
    // Force a minor refresh for any open forms
    window.dispatchEvent(new Event('profile-updated'));
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container mx-auto px-2 md:px-4 flex h-16 items-center justify-between gap-1 md:gap-2">
        <Link href="/" className="flex items-center gap-1 md:gap-2 font-bold text-primary shrink-0">
          <div className="bg-primary/10 p-1 rounded-lg shrink-0">
            <CowIcon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
          </div>
          <span className="inline-block tracking-tight text-[11px] md:text-lg lg:text-xl truncate max-w-[100px] sm:max-w-none font-headline">Cattle Feed Survey App</span>
        </Link>
        <div className="flex items-center gap-0.5 md:gap-1 lg:gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link href="/brands">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm">
              <BookMarked className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Brands</span>
            </Button>
          </Link>
          <Link href="/suppliers">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm">
              <Truck className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </Button>
          </Link>
          <Link href="/surveys">
            <Button variant="ghost" size="sm" className="h-8 px-1.5 md:h-9 md:px-3 gap-1 text-[10px] md:text-sm bg-primary/5 text-primary">
              <ClipboardList className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Surveys</span>
            </Button>
          </Link>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9 shrink-0 ml-1">
                <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" /> सर्वेक्षक प्रोफाईल सेटिंग्स
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">सर्वे करणाऱ्याचे पूर्ण नाव</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="उदा. राहुल पाटील"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="id">आयडी नंबर / कर्मचारी क्रमांक</Label>
                  <Input
                    id="id"
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    placeholder="उदा. EMP123"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveProfile} className="w-full bg-primary">
                  <Save className="mr-2 h-4 w-4" /> माहिती सेव्ह करा
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
}