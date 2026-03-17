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
  Trash2,
  CheckCircle2
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

  const DataRow = ({ label, value }: { label: string, value: any }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <TableRow>
        <TableHead className="w-1/2 font-bold bg-muted/20 py-2 text-xs md:text-sm">{label}</TableHead>
        <TableCell className="py-2 text-xs md:text-sm">
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1">
              {value.map((v, i) => <Badge key={i} variant="outline" className="text-[10px]">{v}</Badge>)}
            </div>
          ) : (
            String(value)
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-6 py-4">
        {/* १. सामान्य माहिती */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>१. सामान्य माहिती</h4>
          <Table>
            <TableBody>
              <DataRow label={isDairy ? "डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल"} value={isDairy ? d.ownerName : d.mobile} />
              <DataRow label="संपर्क" value={d.contact || d.mobile} />
              <DataRow label="गाव" value={d.village} />
              <DataRow label="तालुका" value={d.taluka} />
              <DataRow label="जिल्हा" value={d.district} />
              {isDairy && <DataRow label="दूध संकलन (लिटर)" value={d.milkCollection} />}
              {isDairy && <DataRow label="शेतकरी संख्या" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        {/* २. पशुधन माहिती */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>२. पशुधन माहिती</h4>
          <Table>
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="एकूण जनावरे" value={d.livestock?.totalAnimals} />
                  <DataRow label="गायी" value={d.livestock?.cows} />
                  <DataRow label="म्हशी" value={d.livestock?.buffaloes} />
                  <DataRow label="वासरे" value={d.livestock?.calves} />
                  <DataRow label="दूध देणारी" value={d.livestock?.milkingAnimals} />
                </>
              ) : (
                <>
                  <DataRow label="गायी" value={d.animalCount?.cows} />
                  <DataRow label="म्हशी" value={d.animalCount?.buffaloes} />
                  <DataRow label="वासरे" value={d.animalCount?.calves} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ३. पशुखाद्य वापर */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>३. पशुखाद्य वापर</h4>
          <Table>
            <TableBody>
              <DataRow label="खाद्य प्रकार" value={d.feedType || d.currentBrand} />
              <DataRow label="वापर कालावधी" value={d.usageDuration} />
              <DataRow label="वारंवारता" value={d.feedFrequency || d.frequency} />
              <DataRow label="प्रति जनावर प्रमाण (किलो)" value={d.dailyFeedPerAnimal || d.dailyQtyPerAnimal} />
              <DataRow label="पूरक खाद्य" value={d.supplements || d.otherFeeds} />
            </TableBody>
          </Table>
        </section>

        {/* ४. ब्रँड व पोषण (फक्त डेअरीसाठी) */}
        {isDairy && d.brandsInfo && d.brandsInfo.length > 0 && (
          <section>
            <h4 className="font-bold text-primary mb-2 border-b pb-1">४. ब्रँड व पोषण माहिती</h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-[10px] font-bold">ब्रँड</TableHead>
                    <TableHead className="text-[10px] font-bold">किंमत</TableHead>
                    <TableHead className="text-[10px] font-bold">प्रोटीन</TableHead>
                    <TableHead className="text-[10px] font-bold">फॅट</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-[10px] font-medium">{b.name}</TableCell>
                      <TableCell className="text-[10px]">₹{b.price}</TableCell>
                      <TableCell className="text-[10px]">{b.protein}%</TableCell>
                      <TableCell className="text-[10px]">{b.fat}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {/* शेतकरी ब्रँड विशेष विभाग */}
        {!isDairy && (
          <>
            <section>
              <h4 className="font-bold text-accent mb-2 border-b pb-1">४. ब्रँड निवड व गुणवत्ता</h4>
              <Table>
                <TableBody>
                  <DataRow label="निवड कारण" value={d.selectionReason} />
                  <DataRow label="सुरुवात कशी झाली" value={d.startMethod} />
                  <DataRow label="गुणवत्ता" value={d.quality} />
                  <DataRow label="दूध वाढले का" value={d.milkIncrease} />
                  <DataRow label="आरोग्य सुधारले का" value={d.healthImprovement} />
                </TableBody>
              </Table>
            </section>
            <section>
              <h4 className="font-bold text-accent mb-2 border-b pb-1">५. किंमत व उपलब्धता</h4>
              <Table>
                <TableBody>
                  <DataRow label="पोत्याची किंमत" value={d.bagPrice} />
                  <DataRow label="पोत्याचे वजन" value={d.bagWeight} />
                  <DataRow label="मासिक पोती" value={d.monthlyBags} />
                  <DataRow label="खरेदी स्त्रोत" value={d.purchaseSource} />
                  <DataRow label="उधारी मिळते का" value={d.hasCredit} />
                </TableBody>
              </Table>
            </section>
          </>
        )}

        {/* ९. रेटिंग व समस्या */}
        <section>
          <h4 className={`font-bold mb-2 border-b pb-1 ${isDairy ? 'text-primary' : 'text-accent'}`}>समस्या व सूचना</h4>
          <Table>
            <TableBody>
              {!isDairy && <DataRow label="रेटिंग" value={`${d.rating}/5`} />}
              <DataRow label="मुख्य समस्या" value={isDairy ? d.mainProblem : d.problems} />
              <DataRow label="सुधारणा" value={d.improvements || d.goodFeedOpinion} />
              <DataRow label="आदर्श खाद्य गुण" value={d.idealFeedQualities} />
            </TableBody>
          </Table>
        </section>

        {/* १०. सर्वेक्षक तपशील */}
        <section className="bg-muted/30 p-3 rounded-lg border border-dashed">
          <h4 className="font-bold mb-2 text-xs uppercase tracking-wider text-muted-foreground">सर्वेक्षक तपशील</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><span className="font-semibold">नाव:</span> {survey.surveyorName}</p>
            <p><span className="font-semibold">ID:</span> {survey.surveyorId}</p>
            <p><span className="font-semibold">तारीख:</span> {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</p>
          </div>
        </section>
      </div>
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
              <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {survey.type === 'dairy' ? <FileText className="text-primary" /> : <ClipboardList className="text-accent" />}
                    सविस्तर रिपोर्ट: {survey.data.dairyName || survey.data.farmerName}
                  </DialogTitle>
                </DialogHeader>
                {selectedSurvey && renderDetailedReport(selectedSurvey)}
                <div className="flex justify-end gap-2 mt-4 no-print">
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1">
                    <Printer className="h-4 w-4" /> प्रिंट
                  </Button>
                  <Button variant="default" size="sm" className="bg-primary" onClick={() => toast({title: "लवकरच येत आहे", description: "Edit सुविधा पुढील अपडेट मध्ये उपलब्ध होईल."})}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDelete(survey.id)}>
              <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
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
          <h1 className="text-2xl font-bold text-center border-b pb-4 mb-8">Cattle Feed Survey Report</h1>
          {surveys.map(survey => (
            <div key={survey.id} className="border p-4 rounded-lg mb-8 break-inside-avoid shadow-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-4 bg-muted/10 p-2">
                <span className="font-bold text-lg">{survey.type === 'dairy' ? 'गवळी/चिलिंग सेंटर' : 'शेतकरी ब्रँड'} सर्वेक्षण</span>
                <span className="text-sm">तारीख: {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
              </div>
              {renderDetailedReport(survey)}
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
