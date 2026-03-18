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
    
    const translations: Record<string, string> = {
      'Yes': 'होय',
      'No': 'नाही',
      'ReadyMade': 'रेडीमेड पशुखाद्य (Ready Made)',
      'HomeMade': 'घरगुती मिश्रण',
      'Both': 'दोन्ही (रेडीमेड व घरगुती)',
      'DryFodder': 'सुका चारा',
      'GreenFodder': 'हिरवा चारा',
      'Khala': 'खळ',
      'Maize': 'मका',
      'MineralMix': 'खनिज मिश्रण (Mineral Mix)',
      'Cash': 'रोखीने (Cash)',
      'Credit': 'उधारीने (Credit)',
      'Weekly': 'साप्ताहिक',
      'Fortnightly': 'पंधरवड्याने',
      'Monthly': 'मासिक',
      'LocalShop': 'स्थानिक दुकान',
      'Dealer': 'कंपनी डीलर',
      'Dairy': 'डेअरी / संकलन केंद्र',
      'Local': 'स्थानिक दुकान',
      'VeryGood': 'खूप चांगले / उत्कृष्ट',
      'Okay': 'ठीक आहे / समाधानकारक',
      'NotSatisfied': 'समाधानी नाही',
      'Bad': 'खराब / निकृष्ट',
      '6m': '६ महिने',
      '1y': '१ वर्ष',
      '2y+': '२ वर्षांपेक्षा जास्त',
      'Retailer': 'किरकोळ विक्रेता (Retailer)',
      'Wholesaler': 'घाऊक विक्रेता (Wholesaler)',
      'Distributor': 'वितरक (Distributor)',
      'Shop': 'दुकानदार',
      'CompanyRep': 'कंपनी प्रतिनिधी',
      'Friend': 'मित्र / शेतकरी',
      'Ad': 'जाहिरात',
      'Pellet': 'पेलेट (Pellet)',
      'Mesh': 'मेश (Mesh)',
      'Crumb': 'क्रंब (Crumb)',
      'Cubes': 'क्यूब्स (Cubes)'
    };

    if (Array.isArray(value)) {
      displayValue = value.map(v => translations[v] || v).join(", ");
    } else if (typeof value === 'string') {
      displayValue = translations[value] || value;
    }

    return (
      <TableRow className="hover:bg-transparent border-b border-black">
        <TableHead className="w-[50%] font-black bg-gray-50 py-2.5 px-3 text-[12px] md:text-sm h-auto border-r border-black leading-tight text-black print:bg-gray-100 print:text-black">
          {label}
        </TableHead>
        <TableCell className="py-2.5 px-3 text-[12px] md:text-sm h-auto leading-tight text-black font-semibold print:text-black">
          {displayValue}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-4 py-2 print:space-y-3 print:text-black">
        <section className="break-inside-avoid">
          <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
            १. सामान्य माहिती (General Info)
          </h4>
          <Table className="border-2 border-black rounded-none">
            <TableBody>
              <DataRow label={isDairy ? "डेअरी / संकलन केंद्राचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              {isDairy && <DataRow label="संपर्क क्रमांक" value={d.contact} />}
              <DataRow label="गाव / तालुका / जिल्हा" value={`${d.village || '-'}, ${d.taluka || '-'}, ${d.district || '-'}`} />
              <DataRow label="लोकेशन (GPS)" value={d.location} />
              {isDairy && <DataRow label="संपूर्ण पत्ता" value={d.address} />}
              {isDairy && <DataRow label="दैनिक दूध संकलन (लिटर)" value={d.milkCollection} />}
              {isDairy && <DataRow label="एकूण शेतकरी संख्या" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
            २. पशुधन तपशील (Livestock)
          </h4>
          <Table className="border-2 border-black rounded-none">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="एकूण जनावरे / दूध देणारी" value={`${d.livestock?.totalAnimals || 0} / ${d.livestock?.milkingAnimals || 0}`} />
                  <DataRow label="गाय / म्हैस / वासरे" value={`गायी: ${d.livestock?.cows || 0}, म्हशी: ${d.livestock?.buffaloes || 0}, वासरे: ${d.livestock?.calves || 0}`} />
                  <DataRow label="सरासरी दूध (प्रति जनावर)" value={d.livestock?.avgMilkPerAnimal} />
                </>
              ) : (
                <DataRow label="जनावरांची संख्या" value={`गायी: ${d.animalCount?.cows || 0}, म्हशी: ${d.animalCount?.buffaloes || 0}, वासरे: ${d.animalCount?.calves || 0}`} />
              )}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
            ३. पशुखाद्य वापर (Feed Info)
          </h4>
          <Table className="border-2 border-black rounded-none">
            <TableBody>
              <DataRow label="पशुखाद्याचा प्रकार / ब्रँड" value={isDairy ? d.feedType : d.currentBrand} />
              {!isDairy && <DataRow label="वापर कालावधी" value={d.usageDuration} />}
              <DataRow label="दिवसातून किती वेळा देता?" value={d.feedFrequency || d.frequency} />
              <DataRow label="प्रति जनावर दैनिक प्रमाण (किग्रॅ)" value={d.dailyFeedPerAnimal || d.dailyQtyPerAnimal} />
              <DataRow label="इतर पूरक खाद्य" value={d.supplements || d.otherFeeds} />
              {(d.otherSupplement || d.otherFeedText) && <DataRow label="विशेष टिपणी" value={d.otherSupplement || d.otherFeedText} />}
            </TableBody>
          </Table>
        </section>

        {isDairy && d.brandsInfo && d.brandsInfo.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
              ४. ब्रँड व पोषण विश्लेषण
            </h4>
            <div className="border-2 border-black">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 border-b border-black">
                    <TableHead className="font-black text-black border-r border-black h-8 text-[11px]">ब्रँड</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-8 text-[11px]">किंमत</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-8 text-[11px]">प्रोटीन</TableHead>
                    <TableHead className="font-black text-black h-8 text-[11px]">फॅट</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i} className="border-b border-black last:border-0">
                      <TableCell className="font-bold border-r border-black py-1.5 text-[11px]">{b.name}</TableCell>
                      <TableCell className="border-r border-black py-1.5 text-[11px]">₹{b.price}</TableCell>
                      <TableCell className="border-r border-black py-1.5 text-[11px]">{b.protein}%</TableCell>
                      <TableCell className="py-1.5 text-[11px]">{b.fat}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {!isDairy && (
          <section className="break-inside-avoid">
            <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
              ४. गुणवत्ता व निकाल
            </h4>
            <Table className="border-2 border-black rounded-none">
              <TableBody>
                <DataRow label="निवडीचे कारण" value={d.selectionReason} />
                <DataRow label="सुरुवात कशी झाली?" value={d.startMethod} />
                <DataRow label="गुणवत्तेबद्दल मत" value={d.quality} />
                <DataRow label="दूध वाढ / आरोग्य फरक?" value={`दूध वाढ: ${d.milkIncrease === 'Yes' ? 'होय' : 'नाही'}, आरोग्य: ${d.healthImprovement === 'Yes' ? 'सुधारले' : 'नाही'}`} />
                <DataRow label="फॅटमध्ये फरक जाणवला का?" value={d.fatDiff} />
              </TableBody>
            </Table>
          </section>
        )}

        <section className="break-inside-avoid">
          <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
            ५-८. खरेदी, खर्च व साठवणूक
          </h4>
          <Table className="border-2 border-black rounded-none">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="खरेदी पद्धत / स्रोत" value={`${d.purchaseMethod || '-'} / ${d.supplySource}`} />
                  <DataRow label="पुरवठादार / वेळेवर पुरवठा?" value={`${d.supplierName || '-'} / ${d.timelySupply === 'Yes' ? 'होय' : 'नाही'}`} />
                  <DataRow label="मासिक खर्च / पोती संख्या" value={`₹${d.monthlyExp} / ${d.monthlyBags} पोती`} />
                  <DataRow label="गोदाम क्षमता / पुरेशी जागा?" value={`${d.warehouseCapacity || '-'} / ${d.hasStorage === 'Yes' ? 'होय' : 'नाही'}`} />
                </>
              ) : (
                <>
                  <DataRow label="किंमत / वजन / मासिक गरज" value={`₹${d.bagPrice} / ${d.bagWeight} किग्रॅ / ${d.monthlyBags} पोती`} />
                  <DataRow label="खरेदी स्रोत / उधारी सुविधा?" value={`${d.purchaseSource || '-'} / ${d.hasCredit === 'Yes' ? 'होय' : 'नाही'}`} />
                  <DataRow label="मागील ब्रँड्स / तुलना" value={`${d.previousBrands || '-'} / चांगला ब्रँड: ${d.betterBrand || '-'}`} />
                  <DataRow label="ब्रँड तुलना कारण" value={d.switchReason} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
            ९-१०. समस्या व अभिप्राय
          </h4>
          <Table className="border-2 border-black rounded-none">
            <TableBody>
              <DataRow label="मुख्य समस्या" value={d.mainProblem || d.problems} />
              <DataRow label="आदर्श खाद्यात काय असावे?" value={d.goodFeedOpinion || d.idealFeedQualities} />
              <DataRow label="सुधारणा / सॅम्पल ट्रायल?" value={`${d.improvements || '-'} / ट्रायल: ${d.sampleTrial || 'नाही'}`} />
            </TableBody>
          </Table>
        </section>

        {d.customPoints && d.customPoints.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className="text-[14px] font-black mb-2 border-b-2 border-black pb-0.5 text-black uppercase">
              ११. अतिरिक्त मुद्दे
            </h4>
            <Table className="border-2 border-black rounded-none">
              <TableBody>
                {d.customPoints.map((pt: any, idx: number) => (
                  <DataRow key={idx} label={`मुद्दा क्रमांक ${idx + 1}`} value={pt.point} />
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        <div className="mt-6 border-t-4 border-black pt-4 grid grid-cols-2 text-[12px] font-black uppercase tracking-tight">
          <div>सर्वेक्षक: {survey.surveyorName} ({survey.surveyorId})</div>
          <div className="text-right">दिनांक: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</div>
        </div>
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
          <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[95vh] overflow-y-auto p-4 border-2">
            <DialogHeader className="mb-4 no-print">
              <div className="flex justify-between items-center border-b pb-2">
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  {selectedSurvey?.type === 'dairy' ? <FileText className="text-primary h-5 w-5" /> : <ClipboardList className="text-accent h-5 w-5" />}
                  सर्वेक्षण अहवाल: {selectedSurvey?.data.dairyName || selectedSurvey?.data.farmerName}
                </DialogTitle>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9 px-4 text-sm gap-2 border-black font-bold">
                  <Printer className="h-4 w-4" /> प्रिंट अहवाल
                </Button>
              </div>
            </DialogHeader>
            <div className="print-report-container">
              {selectedSurvey && renderDetailedReport(selectedSurvey)}
            </div>
          </DialogContent>
        </Dialog>

        <div className="hidden print:block text-black bg-white">
          <div className="print-only-report w-full">
            {selectedSurvey ? (
              <div className="p-4 mb-4">
                <div className="text-center border-b-4 border-black pb-2 mb-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight">पशुखाद्य सर्वेक्षण अहवाल</h2>
                  <p className="text-[14px] font-black mt-1">({selectedSurvey.type === 'dairy' ? 'दूध संकलन केंद्र' : 'शेतकरी ब्रँड'} सर्वेक्षण)</p>
                </div>
                {renderDetailedReport(selectedSurvey)}
              </div>
            ) : (
              surveys.map(survey => (
                <div key={survey.id} className="p-4 mb-8 border-b-4 border-black break-inside-avoid">
                  <div className="text-center border-b-4 border-black pb-2 mb-4">
                    <h2 className="text-2xl font-black uppercase">पशुखाद्य सर्वेक्षण अहवाल</h2>
                    <p className="text-[14px] font-black mt-1">{survey.type === 'dairy' ? 'दूध संकलन केंद्र' : 'शेतकरी ब्रँड'}</p>
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
