"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  FileText, 
  Search, 
  Clock, 
  MapPin, 
  ClipboardList, 
  LayoutDashboard,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

export default function SurveysList() {
  const { getSurveys, deleteSurvey } = useSurveyStore();
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyRecord | null>(null);

  const loadSurveys = () => {
    const allSurveys = getSurveys().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSurveys(allSurveys);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("तुम्हाला खात्री आहे की तुम्ही हा रिपोर्ट हटवू इच्छिता?")) {
      deleteSurvey(id);
      loadSurveys();
      toast({ title: "यशस्वी", description: "रिपोर्ट हटवण्यात आला आहे." });
    }
  };

  const filterSurveys = (type?: 'dairy' | 'farmer') => {
    return surveys.filter(s => {
      const matchesType = type ? s.type === type : true;
      const matchesSearch = 
        (s.surveyorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data.dairyName || s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  };

  const renderDataAsTable = (data: any) => {
    const excludedKeys = ['brandsInfo', 'livestock', 'animalCount', 'packNutrition', 'supplements', 'selectionReason', 'problems', 'switchReason'];
    
    return (
      <Table>
        <TableBody>
          {Object.entries(data).map(([key, value]) => {
            if (excludedKeys.includes(key) || typeof value === 'object') return null;
            return (
              <TableRow key={key}>
                <TableHead className="w-1/3 font-bold bg-muted/20 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</TableHead>
                <TableCell>{String(value)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const SurveyItem = ({ survey }: { survey: SurveyRecord }) => (
    <Card key={survey.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden mb-4">
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
                <Badge variant={survey.type === 'dairy' ? 'default' : 'secondary'} className={`${survey.type === 'dairy' ? 'bg-primary' : 'bg-accent'} text-[10px]`}>
                  {survey.type === 'dairy' ? 'गवळी/चिलिंग सेंटर' : 'शेतकरी ब्रँड'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end no-print">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 gap-2 border-primary text-primary hover:bg-primary/10" onClick={() => setSelectedSurvey(survey)}>
                  <Eye className="h-4 w-4" /> <span className="hidden sm:inline">View</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {survey.type === 'dairy' ? <FileText className="text-primary" /> : <ClipboardList className="text-accent" />}
                    सविस्तर रिपोर्ट: {survey.data.dairyName || survey.data.farmerName}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-6">
                  <div>
                    <h4 className="font-bold text-primary mb-2 border-b">प्राथमिक माहिती</h4>
                    {renderDataAsTable(survey.data)}
                  </div>
                  
                  {survey.data.brandsInfo && survey.data.brandsInfo.length > 0 && (
                    <div>
                      <h4 className="font-bold text-primary mb-2 border-b">ब्रँड व पोषण माहिती</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>ब्रँड</TableHead>
                              <TableHead>किंमत</TableHead>
                              <TableHead>प्रोटीन</TableHead>
                              <TableHead>फॅट</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {survey.data.brandsInfo.map((b: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{b.name}</TableCell>
                                <TableCell>₹{b.price}</TableCell>
                                <TableCell>{b.protein}%</TableCell>
                                <TableCell>{b.fat}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" className="h-9 px-3 gap-2">
              <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
            </Button>
            
            <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDelete(survey.id)}>
              <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
            </Button>

            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9 px-3 gap-2">
              <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Report</span>
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

          <TabsContent value="all">
            {filterSurveys().length === 0 ? (
              <EmptyState />
            ) : (
              filterSurveys().map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="dairy">
            {filterSurveys('dairy').length === 0 ? (
              <EmptyState message="गवळी/चिलिंग सेंटर सर्वेक्षण रिपोर्ट उपलब्ध नाहीत." />
            ) : (
              filterSurveys('dairy').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="farmer">
            {filterSurveys('farmer').length === 0 ? (
              <EmptyState message="शेतकरी ब्रँड सर्वेक्षण रिपोर्ट उपलब्ध नाहीत." />
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

function EmptyState({ message = "कोणतेही सर्वेक्षण उपलब्ध नाही." }: { message?: string }) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-dashed">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
