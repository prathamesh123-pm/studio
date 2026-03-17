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
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    if (confirm("तुमच्या खात्रीने तुम्ही हा रिपोर्ट हटवू इच्छिता?")) {
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
    let displayValue = value;
    
    if (value === 'Yes') displayValue = 'होय';
    if (value === 'No') displayValue = 'नाही';
    if (value === 'ReadyMade') displayValue = 'रेडीमेड पशुखाद्य';
    if (value === 'HomeMade') displayValue = 'घरगुती मिश्रण';
    if (value === 'Both') displayValue = 'दोन्ही (रेडीमेड व घरगुती)';
    if (value === 'DryFodder') displayValue = 'सुका चारा';
    if (value === 'GreenFodder') displayValue = 'हिरवा चारा';

    return (
      <TableRow className="hover:bg-transparent border-b">
        <TableHead className="w-[45%] font-bold bg-muted/5 py-1 px-2 text-[10px] md:text-xs h-auto border-r leading-tight">{label}</TableHead>
        <TableCell className="py-1 px-2 text-[10px] md:text-xs h-auto leading-tight">
          {Array.isArray(displayValue) ? (
            <div className="flex flex-wrap gap-1">
              {displayValue.map((v, i) => <Badge key={i} variant="outline" className="text-[8px] px-1 h-3">{v}</Badge>)}
            </div>
          ) : (
            String(displayValue)
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-3 py-1 print:space-y-1">
        <section className="break-inside-avoid">
          <h4 className={`text-[11px] font-bold mb-1 border-b pb-0.5 ${isDairy ? 'text-primary' : 'text-accent'}`}>१. सामान्य माहिती</h4>
          <Table className="border rounded-sm">
            <TableBody>
              <DataRow label={isDairy ? "दूध संकलन केंद्र / डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              {isDairy && <DataRow label="संपर्क क्रमांक" value={d.contact} />}
              <DataRow label="गाव / तालुका / जिल्हा" value={`${d.village || '-'}, ${d.taluka || '-'}, ${d.district || '-'}`} />
              <DataRow label="लोकेशन (GPS)" value={d.location} />
              {isDairy && <DataRow label="संपूर्ण पत्ता" value={d.address} />}
              {isDairy && <DataRow label="दूध संकलन / शेतकरी संख्या" value={`${d.milkCollection || '-'} लिटर / ${d.farmerCount || '-'} शेतकरी`} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className={`text-[11px] font-bold mb-1 border-b pb-0.5 ${isDairy ? 'text-primary' : 'text-accent'}`}>२. पशुधन माहिती</h4>
          <Table className="border rounded-sm">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="एकूण जनावरे / दूध देणारी" value={`${d.livestock?.totalAnimals || 0} / ${d.livestock?.milkingAnimals || 0}`} />
                  <DataRow label="गायी / म्हशी / वासरे" value={`${d.livestock?.cows || 0} / ${d.livestock?.buffaloes || 0} / ${d.livestock?.calves || 0}`} />
                  <DataRow label="सरासरी दूध उत्पादन" value={d.livestock?.avgMilkPerAnimal} />
                </>
              ) : (
                <>
                  <DataRow label="गायी / म्हशी / वासरे" value={`${d.animalCount?.cows || 0} / ${d.animalCount?.buffaloes || 0} / ${d.animalCount?.calves || 0}`} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className={`text-[11px] font-bold mb-1 border-b pb-0.5 ${isDairy ? 'text-primary' : 'text-accent'}`}>३. पशुखाद्य वापर माहिती</h4>
          <Table className="border rounded-sm">
            <TableBody>
              <DataRow label="खाद्य प्रकार" value={d.feedType || d.currentBrand} />
              {!isDairy && <DataRow label="वापर कालावधी" value={d.usageDuration} />}
              <DataRow label="वारंवारता / दैनिक प्रमाण" value={`${d.feedFrequency || d.frequency || '-'} वेळा / ${d.dailyFeedPerAnimal || d.dailyQtyPerAnimal || '-'} किलो`} />
              <DataRow label="पूरक खाद्य वापर" value={d.supplements || d.otherFeeds} />
              {(d.otherSupplement || d.otherFeedText) && <DataRow label="इतर पूरक खाद्य" value={d.otherSupplement || d.otherFeedText} />}
            </TableBody>
          </Table>
        </section>

        {isDairy && d.brandsInfo && d.brandsInfo.length > 0 ? (
          <section className="break-inside-avoid">
            <h4 className="text-[11px] font-bold text-primary mb-1 border-b pb-0.5">४. ब्रँड व पोषण माहिती</h4>
            <div className="overflow-x-auto border rounded-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 h-7">
                    <TableHead className="text-[9px] font-bold px-2 py-0">ब्रँड</TableHead>
                    <TableHead className="text-[9px] font-bold px-2 py-0">किंमत</TableHead>
                    <TableHead className="text-[9px] font-bold px-2 py-0">प्रोटीन</TableHead>
                    <TableHead className="text-[9px] font-bold px-2 py-0">फॅट</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i} className="h-6">
                      <TableCell className="text-[9px] font-medium px-2 py-0 leading-tight">{b.name}</TableCell>
                      <TableCell className="text-[9px] px-2 py-0">₹{b.price}</TableCell>
                      <TableCell className="text-[9px] px-2 py-0">{b.protein}%</TableCell>
                      <TableCell className="text-[9px] px-2 py-0">{b.fat}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ) : !isDairy ? (
          <section className="break-inside-avoid">
            <h4 className="text-[11px] font-bold text-accent mb-1 border-b pb-0.5">४. गुणवत्ता व परिणाम</h4>
            <Table className="border rounded-sm">
              <TableBody>
                <DataRow label="निवड कारणे" value={d.selectionReason} />
                <DataRow label="सुरुवात / गुणवत्ता" value={`${d.startMethod || '-'} / ${d.quality || '-'}`} />
                <DataRow label="दूध वाढ / आरोग्य / फॅट फरक" value={`${d.milkIncrease === 'Yes' ? 'होय' : 'नाही'} / ${d.healthImprovement === 'Yes' ? 'होय' : 'नाही'} / ${d.fatDiff === 'Yes' ? 'होय' : 'नाही'}`} />
              </TableBody>
            </Table>
          </section>
        ) : null}

        <section className="break-inside-avoid">
          <h4 className={`text-[11px] font-bold mb-1 border-b pb-0.5 ${isDairy ? 'text-primary' : 'text-accent'}`}>५-८. खरेदी, पुरवठा व खर्च</h4>
          <Table className="border rounded-sm">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="खरेदी / पुरवठा स्त्रोत" value={`${d.purchaseMethod || '-'} / ${d.supplySource === 'Other' ? d.otherSupplySource : d.supplySource}`} />
                  <DataRow label="पुरवठादार / वेळेवर?" value={`${d.supplierName || '-'} / ${d.timelySupply === 'Yes' ? 'होय' : 'नाही'}`} />
                  <DataRow label="मासिक खर्च / पोती" value={`₹${d.monthlyExp} / ${d.monthlyBags} पोती`} />
                </>
              ) : (
                <>
                  <DataRow label="किंमत / वजन / पोती" value={`₹${d.bagPrice} / ${d.bagWeight} किग्रॅ / ${d.monthlyBags} महिना`} />
                  <DataRow label="स्त्रोत / उधारी / मागील ब्रँड्स" value={`${d.purchaseSource || '-'} / ${d.hasCredit === 'Yes' ? 'मिळते' : 'नाही'} / ${d.previousBrands || '-'}`} />
                  <DataRow label="चांगला ब्रँड / कारण" value={`${d.betterBrand || '-'} / ${d.switchReason}`} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className={`text-[11px] font-bold mb-1 border-b pb-0.5 ${isDairy ? 'text-primary' : 'text-accent'}`}>९-१०. समस्या व सूचना</h4>
          <Table className="border rounded-sm">
            <TableBody>
              <DataRow label="मुख्य समस्या" value={d.mainProblem || d.problems} />
              <DataRow label="सूचना / आदर्श वैशिष्ट्ये" value={d.goodFeedOpinion || d.idealFeedQualities} />
            </TableBody>
          </Table>
        </section>

        {d.customPoints && d.customPoints.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className={`text-[11px] font-bold mb-1 border-b pb-0.5 ${isDairy ? 'text-primary' : 'text-accent'}`}>११. ॲड पॉइंट्स</h4>
            <Table className="border rounded-sm">
              <TableBody>
                {d.customPoints.map((pt: any, idx: number) => (
                  <DataRow key={idx} label={`मुद्दा ${idx + 1}`} value={pt.point} />
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        <section className="bg-muted/10 p-2 rounded-sm border border-dashed print:mt-2 break-inside-avoid">
          <div className="grid grid-cols-2 text-[10px] gap-2 leading-tight">
            <div><span className="font-bold">सर्वेक्षक:</span> {survey.surveyorName} ({survey.surveyorId})</div>
            <div className="text-right"><span className="font-bold">दिनांक:</span> {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</div>
          </div>
        </section>
      </div>
    );
  };

  const SurveyItem = ({ survey }: { survey: SurveyRecord }) => (
    <Card key={survey.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden mb-3 group">
      <CardContent className="p-0">
        <div className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex gap-3 items-center">
            <div className={`p-2 rounded-full shrink-0 ${survey.type === 'dairy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {survey.type === 'dairy' ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {survey.data.dairyName || survey.data.farmerName}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {survey.data.village}, {survey.data.taluka}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
                <Badge variant={survey.type === 'dairy' ? 'default' : 'secondary'} className={`${survey.type === 'dairy' ? 'bg-primary' : 'bg-accent'} text-[8px] h-4 px-1.5`}>
                  {survey.type === 'dairy' ? 'दूध संकलन केंद्र' : 'शेतकरी ब्रँड'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end no-print opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 gap-1 border-primary text-primary hover:bg-primary/10 text-xs" 
              onClick={() => {
                setSelectedSurvey(survey);
                setIsDialogOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5" /> पहा
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-2 gap-1 text-destructive border-destructive hover:bg-destructive/10 text-xs" onClick={() => handleDelete(survey.id)}>
              <Trash2 className="h-3.5 w-3.5" /> हटवा
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">माझी सर्वेक्षणे (My Surveys)</h1>
            <p className="text-muted-foreground text-xs">तुमच्याद्वारे पूर्ण केलेल्या सर्वेक्षणांची यादी.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="शोध (नाव, गाव...)" 
              className="pl-9 h-9 text-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full no-print">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-10 bg-muted/50 p-1">
            <TabsTrigger value="all" className="text-xs gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5 hidden sm:inline" /> सर्व
            </TabsTrigger>
            <TabsTrigger value="dairy" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5 hidden sm:inline" /> संकलन केंद्र
            </TabsTrigger>
            <TabsTrigger value="farmer" className="text-xs gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 hidden sm:inline" /> शेतकरी ब्रँड
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-1">
            {filterSurveys().length === 0 ? (
              <EmptyState />
            ) : (
              filterSurveys().map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="dairy" className="space-y-1">
            {filterSurveys('dairy').length === 0 ? (
              <EmptyState message="दूध संकलन केंद्र रिपोर्ट उपलब्ध नाहीत." />
            ) : (
              filterSurveys('dairy').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>

          <TabsContent value="farmer" className="space-y-1">
            {filterSurveys('farmer').length === 0 ? (
              <EmptyState message="शेतकरी ब्रँड रिपोर्ट उपलब्ध नाहीत." />
            ) : (
              filterSurveys('farmer').map(survey => <SurveyItem key={survey.id} survey={survey} />)
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[95vh] overflow-y-auto p-3">
            <DialogHeader className="mb-2">
              <div className="flex justify-between items-center border-b pb-1">
                <DialogTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                  {selectedSurvey?.type === 'dairy' ? <FileText className="text-primary h-4 w-4" /> : <ClipboardList className="text-accent h-4 w-4" />}
                  रिपोर्ट: {selectedSurvey?.data.dairyName || selectedSurvey?.data.farmerName}
                </DialogTitle>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 px-2 text-[10px] gap-1 no-print">
                  <Printer className="h-3 w-3" /> प्रिंट
                </Button>
              </div>
            </DialogHeader>
            {selectedSurvey && renderDetailedReport(selectedSurvey)}
          </DialogContent>
        </Dialog>

        <div className="hidden print:block text-black bg-white">
          <style dangerouslySetInnerHTML={{ __html: `
            @page { size: A4; margin: 10mm; }
            body { font-size: 10pt; line-height: 1.2; }
          ` }} />
          <div className="print-report-container w-full">
            {selectedSurvey ? (
              <div className="border p-3 rounded-sm mb-4 break-inside-avoid shadow-none">
                <div className="text-center border-b pb-1 mb-2">
                  <h2 className="text-lg font-bold">पशुखाद्य सर्वेक्षण रिपोर्ट</h2>
                  <p className="text-[10px]">{selectedSurvey.type === 'dairy' ? 'दूध संकलन केंद्र' : 'शेतकरी ब्रँड'} सर्वेक्षण</p>
                </div>
                {renderDetailedReport(selectedSurvey)}
              </div>
            ) : (
              surveys.map(survey => (
                <div key={survey.id} className="border p-3 rounded-sm mb-4 break-inside-avoid shadow-none">
                  <div className="text-center border-b pb-1 mb-2 bg-muted/5">
                    <h2 className="text-md font-bold">पशुखाद्य सर्वेक्षण रिपोर्ट</h2>
                    <p className="text-[9px]">{survey.type === 'dairy' ? 'दूध संकलन केंद्र' : 'शेतकरी ब्रँड'}</p>
                  </div>
                  {renderDetailedReport(survey)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message = "कोणतेही सर्वेक्षण उपलब्ध नाही." }: { message?: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-10" />
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
}
