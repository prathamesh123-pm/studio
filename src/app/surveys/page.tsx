"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Search, Clock, MapPin, ClipboardList, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SurveysList() {
  const { getSurveys } = useSurveyStore();
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Sort surveys by date descending (newest first)
    const allSurveys = getSurveys().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSurveys(allSurveys);
  }, []);

  const filterSurveys = (type?: 'dairy' | 'farmer') => {
    return surveys.filter(s => {
      const matchesType = type ? s.type === type : true;
      const matchesSearch = s.surveyorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data.dairyName || s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  };

  const SurveyItem = ({ survey }: { survey: SurveyRecord }) => (
    <Card key={survey.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className={`p-3 rounded-full shrink-0 ${survey.type === 'dairy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {survey.type === 'dairy' ? <FileText className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {survey.data.dairyName || survey.data.farmerName}
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {survey.data.village}, {survey.data.taluka}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
                <span className="hidden sm:inline">ID: {survey.surveyorId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <Badge variant={survey.type === 'dairy' ? 'default' : 'secondary'} className={`${survey.type === 'dairy' ? 'bg-primary' : 'bg-accent'} text-[10px] md:text-xs`}>
              {survey.type === 'dairy' ? 'गवळी/चिलिंग सेंटर' : 'शेतकरी ब्रँड'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 h-8 px-2 md:h-9 md:px-3">
              <Printer className="h-3.5 w-3.5" /> <span className="text-xs md:text-sm">रिपोर्ट</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">माझी सर्वेक्षणे (My Surveys)</h1>
            <p className="text-muted-foreground text-sm">तुमच्याद्वारे पूर्ण केलेल्या सर्वेक्षणांची यादी.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="शोध (नाव, गाव...)" 
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full no-print">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs md:text-sm gap-2">
              <LayoutDashboard className="h-4 w-4 hidden sm:inline" /> सर्व रिपोर्ट
            </TabsTrigger>
            <TabsTrigger value="dairy" className="text-xs md:text-sm gap-2">
              <FileText className="h-4 w-4 hidden sm:inline" /> गवळी/चिलिंग सेंटर
            </TabsTrigger>
            <TabsTrigger value="farmer" className="text-xs md:text-sm gap-2">
              <ClipboardList className="h-4 w-4 hidden sm:inline" /> शेतकरी ब्रँड
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filterSurveys().length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">कोणतेही सर्वेक्षण उपलब्ध नाही.</p>
              </div>
            ) : (
              filterSurveys().map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="dairy" className="space-y-4">
            {filterSurveys('dairy').length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">गवळी/चिलिंग सेंटर सर्वेक्षण रिपोर्ट उपलब्ध नाहीत.</p>
              </div>
            ) : (
              filterSurveys('dairy').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="farmer" className="space-y-4">
            {filterSurveys('farmer').length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">शेतकरी ब्रँड सर्वेक्षण रिपोर्ट उपलब्ध नाहीत.</p>
              </div>
            ) : (
              filterSurveys('farmer').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>
        </Tabs>

        {/* Print view only */}
        <div className="hidden print:block space-y-8">
          <h1 className="text-2xl font-bold text-center border-b pb-4 mb-8">सर्वेक्षण रिपोर्ट यादी</h1>
          {surveys.map(survey => (
            <div key={survey.id} className="border p-4 rounded-lg mb-4 break-inside-avoid">
              <div className="flex justify-between border-b pb-2 mb-2">
                <span className="font-bold">{survey.type === 'dairy' ? 'गवळी/चिलिंग सेंटर' : 'शेतकरी ब्रँड'} सर्वेक्षण</span>
                <span>दिनांक: {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>नाव: {survey.data.dairyName || survey.data.farmerName}</div>
                <div>गाव: {survey.data.village}</div>
                <div>तालुका: {survey.data.taluka}</div>
                <div>जिल्हा: {survey.data.district}</div>
                <div>सर्वेक्षक: {survey.surveyorName} (ID: {survey.surveyorId})</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
