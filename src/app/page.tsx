import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, BarChart3, LayoutDashboard, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5 border-b">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-primary font-headline">
                  Cattle Feed Survey App
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  महाराष्ट्र राज्यातील पशुखाद्य सर्वेक्षणासाठी आधुनिक आणि सोपे व्यासपीठ.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg gap-2">
                    <LayoutDashboard className="h-5 w-5" /> डॅशबोर्ड पहा
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Survey Cards */}
        <section className="py-16 container px-4 mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 font-headline">सर्वेक्षण सुरू करा</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-all border-primary/20 bg-white">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-full w-fit mb-2">
                  <ClipboardList className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-xl">गवळी/चिलिंग सेंटर सर्वेक्षण</CardTitle>
                <CardDescription>पशुखाद्य सर्वेक्षण फॉर्म (Dairy Survey Form)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  दूध संकलन केंद्राकडून पशुखाद्य वापर आणि खरेदी तपशील गोळा करा.
                </p>
                <Link href="/survey/dairy">
                  <Button className="w-full bg-primary shadow-sm">फॉर्म भरा</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-accent/20 bg-white">
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-full w-fit mb-2">
                  <Truck className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-headline text-xl">शेतकरी ब्रँड सर्वेक्षण</CardTitle>
                <CardDescription>पशुखाद्य वितरण व वापर सर्वे प्रश्नावली</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  शेतकऱ्यांकडून पशुखाद्य पुरवठा, ब्रँड निवड आणि गुणवत्तेबद्दल माहिती घ्या.
                </p>
                <Link href="/survey/farmer">
                  <Button className="w-full bg-accent hover:bg-accent/90 shadow-sm">सर्वेक्षण सुरू करा</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Cattle Feed Survey App. सर्व हक्क राखीव.</p>
        </div>
      </footer>
    </div>
  );
}
