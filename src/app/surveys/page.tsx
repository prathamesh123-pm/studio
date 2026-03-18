"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Eye,
  Trash2,
  Edit2,
  User,
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
import { cn } from "@/lib/utils";

export default function SurveysList() {
  const router = useRouter();
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

  const handleEdit = (survey: SurveyRecord) => {
    const path = survey.type === 'dairy' ? '/survey/dairy' : '/survey/farmer';
    router.push(`${path}?id=${survey.id}`);
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

  const translations: Record<string, string> = {
    'Yes': 'होय',
    'No': 'नाही',
    'ReadyMade': 'रेडीमेड पशुखाद्य',
    'HomeMade': 'घरगुती मिश्रण',
    'Both': 'दोन्ही',
    'DryFodder': 'सुका चारा',
    'GreenFodder': 'हिरवा चारा',
    'Khala': 'खळ',
    'Maize': 'मका',
    'MineralMix': 'खनिज मिश्रण',
    'Cash': 'रोखीने',
    'Credit': 'उधारीने',
    'Weekly': 'साप्ताहिक',
    'Fortnightly': 'पंधरवड्याने',
    'Monthly': 'मासिक',
    'LocalShop': 'स्थानिक दुकान',
    'Dealer': 'कंपनी डीलर',
    'Dairy': 'डेअरी / संकलन केंद्र',
    'Local': 'स्थानिक दुकान',
    'VeryGood': 'खूप चांगले',
    'Okay': 'ठीक आहे',
    'NotSatisfied': 'समाधानी नाही',
    'Bad': 'खराब',
    '6m': '६ महिने',
    '1y': '१ वर्ष',
    '2y+': '२ वर्षांपेक्षा जास्त',
    'Shop': 'दुकानदार',
    'CompanyRep': 'प्रतिनिधी',
    'Friend': 'मित्र',
    'Ad': 'जाहिरात',
  };

  const translate = (val: any) => {
    if (Array.isArray(val)) return val.map(v => translations[v] || v).join(", ");
    return translations[val] || val;
  };

  const DataRow = ({ label, value }: { label: string, value: any }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <TableRow className="hover:bg-transparent border-b border-black">
        <TableHead className="w-[45%] font-black bg-gray-50 py-1 px-2 text-[9pt] h-auto border-r border-black leading-tight text-black">
          {label}
        </TableHead>
        <TableCell className="py-1 px-2 text-[9pt] h-auto leading-tight text-black font-medium">
          {translate(value)}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-1 py-1 text-black print:m-0 print:p-0">
        <div className="text-center border-b-2 border-black pb-1 mb-2">
          <h2 className="text-base font-black uppercase tracking-tight">
            {isDairy ? "पशुखाद्य सर्वेक्षण अहवाल: दूध संकलन केंद्र / डेअरी" : "पशुखाद्य सर्वेक्षण अहवाल: शेतकरी ब्रँड सर्वेक्षण"}
          </h2>
          <div className="flex justify-between text-[8pt] font-black px-1 mt-1">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> सर्वेक्षक: {survey.surveyorName} ({survey.surveyorId})</span>
            <span>तारीख: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
          </div>
        </div>

        {/* १. सामान्य व लोकेशन */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            १. सामान्य व लोकेशन माहिती
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव व संपर्क" : "मोबाईल नंबर"} value={isDairy ? `${d.ownerName} / ${d.contact}` : d.mobile} />
              <TableRow className="border-b border-black">
                <TableCell className="p-0" colSpan={2}>
                  <Table className="border-0 table-fixed">
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-[8pt] py-1 px-2 border-r border-black font-bold">गाव: {d.village}</TableCell>
                        <TableCell className="text-[8pt] py-1 px-2 border-r border-black font-bold">तालुका: {d.taluka}</TableCell>
                        <TableCell className="text-[8pt] py-1 px-2 font-bold">जिल्हा: {d.district}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
              <DataRow label="संपूर्ण पत्ता" value={d.address} />
              <DataRow label="जीपीएस लोकेशन" value={d.location} />
            </TableBody>
          </Table>
        </section>

        {/* २. पशुधन माहिती - हॉरिझॉन्टल */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            २. पशुधन माहिती
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <TableRow className="border-b border-black">
                <TableCell className="p-0" colSpan={2}>
                  <Table className="border-0 table-fixed">
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-[8pt] py-1 px-2 border-r border-black font-bold">एकूण: {isDairy ? d.livestock?.totalAnimals : (parseInt(d.animalCount?.cows || 0) + parseInt(d.animalCount?.buffaloes || 0) + parseInt(d.animalCount?.calves || 0))}</TableCell>
                        <TableCell className="text-[8pt] py-1 px-2 border-r border-black font-bold">गायी: {isDairy ? d.livestock?.cows : d.animalCount?.cows}</TableCell>
                        <TableCell className="text-[8pt] py-1 px-2 border-r border-black font-bold">म्हशी: {isDairy ? d.livestock?.buffaloes : d.animalCount?.buffaloes}</TableCell>
                        <TableCell className="text-[8pt] py-1 px-2 font-bold">वासरे: {isDairy ? d.livestock?.calves : d.animalCount?.calves}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
              {isDairy && (
                <TableRow>
                  <TableCell className="text-[8pt] py-1 px-2 border-r border-black font-bold">दूध देणारी जनावरे: {d.livestock?.milkingAnimals}</TableCell>
                  <TableCell className="text-[8pt] py-1 px-2 font-bold" colSpan={2}>सरासरी दूध उत्पादन: {d.livestock?.avgMilkPerAnimal} लि./दिवस</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ३. पशुखाद्य वापर */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            ३. पशुखाद्य वापर माहिती
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "पशुखाद्य प्रकार" : "सध्याचा ब्रँड"} value={isDairy ? d.feedType : d.currentBrand} />
              <DataRow label="दिवसातून किती वेळा देता?" value={isDairy ? d.feedFrequency : d.frequency} />
              <DataRow label="प्रति जनावर दररोज पशुखाद्य (किलो)" value={isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} />
              <DataRow label="पूरक खाद्य वापर" value={isDairy ? d.supplements : d.otherFeeds} />
              <DataRow label="इतर खाद्य माहिती" value={d.otherSupplement || d.otherFeedText} />
            </TableBody>
          </Table>
        </section>

        {/* ४. पोषण तक्ता - कॉम्पॅक्ट */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            ४. ब्रँड व पोषण विश्लेषण
          </h4>
          <Table className="border border-black table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-black">
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">ब्रँड</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">किंमत</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">प्रोटीन</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">फॅट</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">फायबर</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black">कॅल्शियम</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDairy ? (
                d.brandsInfo?.length > 0 ? (
                  d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i} className="border-b border-black last:border-0">
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-bold truncate">{b.name}</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-bold">₹{b.price}</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black">{b.protein}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black">{b.fat}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black">{b.fiber}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1">{b.calcium}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={6} className="text-center py-1 text-[8pt]">माहिती उपलब्ध नाही</TableCell></TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-bold truncate">{d.currentBrand}</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-bold">₹{d.bagPrice}</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black">{d.packNutrition?.protein}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black">{d.packNutrition?.fat}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black">{d.packNutrition?.fiber}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1">{d.packNutrition?.calcium}%</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ५-९. खरेदी व गुणवत्ता */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            ५-९. खरेदी, गुणवत्ता व समाधान
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="खरेदी स्त्रोत / पद्धत" value={isDairy ? d.purchaseMethod : d.purchaseSource} />
              <DataRow label="पुरवठादार माहिती" value={d.suppliers?.map((s: any) => `${s.name} (${translate(s.source)})`).join(", ")} />
              <DataRow label="महिन्याला लागणारी पोती" value={d.monthlyBags} />
              <DataRow label="दूध उत्पादनात वाढ झाली का?" value={d.milkIncrease} />
              <DataRow label="समाधान रेटिंग / फीड गुणवत्ता" value={isDairy ? d.satisfaction : `${d.rating}/५ स्टार (${translate(d.quality)})`} />
              <DataRow label="उधारी मिळते का? / वेळेवर पुरवठा?" value={isDairy ? d.timelySupply : d.hasCredit} />
              {isDairy && <DataRow label="गोदाम क्षमता (MT)" value={d.warehouseCapacity} />}
            </TableBody>
          </Table>
        </section>

        {/* १०-११. समस्या व सूचना */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            १०-११. समस्या, सूचना व अभिप्राय
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="पशुखाद्याबाबत मुख्य समस्या" value={d.mainProblem || d.problems} />
              <DataRow label="सॅम्पल मिळाल्यास ट्राय कराल का?" value={d.sampleTrial || d.switchIfCheaper} />
              <DataRow label="आदर्श पशुखाद्याबद्दल मते" value={d.goodFeedOpinion || d.idealFeedQualities} />
              {d.customPoints?.length > 0 && (
                <DataRow label="अतिरिक्त मुद्दे" value={d.customPoints.map((p: any) => p.point).join(", ")} />
              )}
            </TableBody>
          </Table>
        </section>

        {/* १२. सर्वेक्षक तपशील */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            १२. सर्वेक्षक तपशील
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <TableRow>
                <TableCell className="w-[45%] font-black bg-gray-50 py-1 px-2 text-[9pt] border-r border-black text-black">सर्वेक्षकाचे नाव</TableCell>
                <TableCell className="py-1 px-2 text-[9pt] font-black text-black uppercase">{survey.surveyorName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-[45%] font-black bg-gray-50 py-1 px-2 text-[9pt] border-r border-black text-black">आयडी नंबर</TableCell>
                <TableCell className="py-1 px-2 text-[9pt] font-black text-black">{survey.surveyorId}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </div>
    );
  };

  const EmptyState = ({ message = "कोणतेही सर्वेक्षण उपलब्ध नाही." }: { message?: string }) => (
    <div className="text-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-10" />
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );

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
                  {survey.type === 'dairy' ? 'संकलन केंद्र' : 'शेतकरी'}
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 gap-1 border-primary text-primary hover:bg-primary/10 text-xs" 
              onClick={() => handleEdit(survey)}
            >
              <Edit2 className="h-3.5 w-3.5" /> अपडेट
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
            <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">माझी सर्वेक्षणे</h1>
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
            <TabsTrigger value="all" className="text-xs gap-1.5">सर्व</TabsTrigger>
            <TabsTrigger value="dairy" className="text-xs gap-1.5">संकलन केंद्र</TabsTrigger>
            <TabsTrigger value="farmer" className="text-xs gap-1.5">शेतकरी ब्रँड</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-1">
            {filterSurveys().length === 0 ? <EmptyState /> : filterSurveys().map(s => <SurveyItem key={s.id} survey={s} />)}
          </TabsContent>
          <TabsContent value="dairy" className="space-y-1">
            {filterSurveys('dairy').length === 0 ? <EmptyState message="संकलन केंद्र रिपोर्ट नाहीत." /> : filterSurveys('dairy').map(s => <SurveyItem key={s.id} survey={s} />)}
          </TabsContent>
          <TabsContent value="farmer" className="space-y-1">
            {filterSurveys('farmer').length === 0 ? <EmptyState message="शेतकरी ब्रँड रिपोर्ट नाहीत." /> : filterSurveys('farmer').map(s => <SurveyItem key={s.id} survey={s} />)}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-[210mm] max-h-[95vh] overflow-y-auto p-0 border-2 dialog-content-print">
            <DialogHeader className="p-4 border-b bg-muted/30 no-print">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">अहवाल पाहणे</DialogTitle>
                <Button variant="default" size="sm" onClick={() => window.print()} className="bg-black hover:bg-black/90 text-white font-black px-6">
                  <Printer className="h-4 w-4 mr-2" /> प्रिंट अहवाल
                </Button>
              </div>
            </DialogHeader>
            <div className="p-4 md:p-6 print:p-0">
              {selectedSurvey && renderDetailedReport(selectedSurvey)}
            </div>
          </DialogContent>
        </Dialog>

        <div className="hidden print:block">
          <div className="print-only-report">
            {selectedSurvey && renderDetailedReport(selectedSurvey)}
          </div>
        </div>
      </div>
    </div>
  );
}
