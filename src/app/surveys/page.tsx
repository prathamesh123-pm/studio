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
  LayoutDashboard,
  Eye,
  Trash2,
  Edit2,
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

  const DataRow = ({ label, value }: { label: string, value: any }) => {
    if (value === undefined || value === null || value === "") return null;
    let displayValue = value;
    
    const translations: Record<string, string> = {
      'Yes': 'होय',
      'No': 'नाही',
      'ReadyMade': 'रेडीमेड पशुखाद्य (Ready Made)',
      'HomeMade': 'घरगुती मिश्रण',
      'Both': 'दोनोंही (रेडीमेड व घरगुती)',
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
      displayValue = value.map(v => (typeof v === 'string' ? translations[v] || v : JSON.stringify(v))).join(", ");
    } else if (typeof value === 'string') {
      displayValue = translations[value] || value;
    }

    return (
      <TableRow className="hover:bg-transparent border-b border-black">
        <TableHead className="w-[60%] font-black bg-gray-100/50 py-1 px-2 text-[9px] h-auto border-r border-black leading-tight text-black print:bg-gray-200/50">
          {label}
        </TableHead>
        <TableCell className="py-1 px-2 text-[9px] h-auto leading-tight text-black font-black">
          {displayValue}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-1.5 py-1 print:text-black w-full text-black print:m-0 print:p-0">
        <div className="text-center border-b-2 border-black pb-1 mb-2">
          <h2 className="text-sm font-black uppercase tracking-tight text-black">
            {isDairy ? "पशुखाद्य सर्वेक्षण अहवाल: दूध संकलन केंद्र / डेअरी" : "पशुखाद्य सर्वेक्षण अहवाल: शेतकरी ब्रँड सर्वेक्षण"}
          </h2>
          <p className="text-[8px] font-bold text-black">अहवाल दिनांक: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</p>
        </div>

        <section className="break-inside-avoid">
          <h4 className="text-[9px] font-black mb-0.5 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">
            १. सामान्य माहिती
          </h4>
          <Table className="border border-black">
            <TableBody>
              <DataRow label="लोकेशन टॅगिंग (GPS Location)" value={d.location} />
              <DataRow label={isDairy ? "दूध संकलन केंद्र / डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              {isDairy && <DataRow label="संपर्क क्रमांक" value={d.contact} />}
              <DataRow label="गाव (Village)" value={d.village} />
              <DataRow label="जिल्हा (District)" value={d.district} />
              <DataRow label="तालुका (Taluka)" value={d.taluka} />
              {isDairy && <DataRow label="सरासरी दूध उत्पादन (प्रति जनावर लिटर/दिवस)" value={d.livestock?.avgMilkPerAnimal} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9px] font-black mb-0.5 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">
            २-३. पशुधन व वापर माहिती
          </h4>
          <Table className="border border-black">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="एकूण जनावरे (गायी/म्हशी/वासरे)" value={`${d.livestock?.totalAnimals} (${d.livestock?.cows}/${d.livestock?.buffaloes}/${d.livestock?.calves})`} />
                  <DataRow label="कोणत्या प्रकारचे पशुखाद्य वापरता?" value={d.feedType} />
                </>
              ) : (
                <>
                  <DataRow label="एकूण जनावरे (गायी/म्हशी/वासरे)" value={`${parseInt(d.animalCount?.cows || 0) + parseInt(d.animalCount?.buffaloes || 0) + parseInt(d.animalCount?.calves || 0)} (${d.animalCount?.cows}/${d.animalCount?.buffaloes}/${d.animalCount?.calves})`} />
                  <DataRow label="सध्या कोणत्या पशुखाद्य ब्रँडचा वापर करता?" value={d.currentBrand} />
                </>
              )}
              <DataRow label={isDairy ? "पशुखाद्य दिवसातून किती वेळा देता?" : "दिवसातून किती वेळा देता?"} value={isDairy ? d.feedFrequency : d.frequency} />
              <DataRow label={isDairy ? "प्रति जनावर दररोज पशुखाद्य (किग्रॅ)" : "तुम्ही दिवसाला प्रति जनावर किती पशुखाद्य देता? (किलो)"} value={isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} />
              <DataRow label="पशुखाद्य सोबत इतर खाद्य देता का?" value={isDairy ? d.supplements : d.otherFeeds} />
            </TableBody>
          </Table>
        </section>

        {isDairy && d.brandsInfo && d.brandsInfo.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className="text-[9px] font-black mb-0.5 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">
              ४. ब्रँड व पोषण विश्लेषण
            </h4>
            <div className="border border-black overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 border-b border-black">
                    <TableHead className="font-black text-black border-r border-black h-5 text-[8px] py-0 px-1">ब्रँड</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-5 text-[8px] py-0 px-1">किंमत</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-5 text-[8px] py-0 px-1">प्रोटीन</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-5 text-[8px] py-0 px-1">फॅट</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-5 text-[8px] py-0 px-1">फायबर</TableHead>
                    <TableHead className="font-black text-black h-5 text-[8px] py-0 px-1">कॅल्शि.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.brandsInfo.slice(0, 3).map((b: any, i: number) => (
                    <TableRow key={i} className="border-b border-black last:border-0">
                      <TableCell className="font-black border-r border-black py-0.5 px-1 text-[8px]">{b.name}</TableCell>
                      <TableCell className="border-r border-black py-0.5 px-1 text-[8px] font-black">₹{b.price}</TableCell>
                      <TableCell className="border-r border-black py-0.5 px-1 text-[8px] font-black">{b.protein}%</TableCell>
                      <TableCell className="border-r border-black py-0.5 px-1 text-[8px] font-black">{b.fat}%</TableCell>
                      <TableCell className="border-r border-black py-0.5 px-1 text-[8px] font-black">{b.fiber}%</TableCell>
                      <TableCell className="py-0.5 px-1 text-[8px] font-black">{b.calcium}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {!isDairy && (
          <section className="break-inside-avoid">
            <h4 className="text-[9px] font-black mb-0.5 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">
              ४. गुणवत्ता व परिणाम विश्लेषण
            </h4>
            <Table className="border border-black">
              <TableBody>
                <DataRow label="हा ब्रँड निवडण्याचे मुख्य कारण काय?" value={d.selectionReason} />
                <DataRow label="या फीडमुळे दूध उत्पादन वाढले का?" value={d.milkIncrease} />
                <DataRow label="जनावरांचे आरोग्य सुधारले का?" value={d.healthImprovement} />
                <DataRow label="दूधातील फॅट किंवा SNF मध्ये फरक जाणवला का?" value={d.fatDiff} />
              </TableBody>
            </Table>
          </section>
        )}

        <section className="break-inside-avoid">
          <h4 className="text-[9px] font-black mb-0.5 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">
            ५-९. खरेदी, पुरवठा व साठवणूक
          </h4>
          <Table className="border border-black">
            <TableBody>
              <DataRow label="हा ब्रँड कुठून खरेदी करता?" value={isDairy ? d.purchaseMethod : d.purchaseSource} />
              {d.suppliers && d.suppliers.slice(0, 2).map((s: any, idx: number) => (
                <DataRow key={idx} label={`पुरवठादार ${idx + 1}`} value={s.name} />
              ))}
              <DataRow label="उधारी मिळते का? / वेळेवर पुरवठा?" value={isDairy ? d.timelySupply : d.hasCredit} />
              <DataRow label="महिन्याला किती पोती लागतात?" value={d.monthlyBags} />
              <DataRow label="साठवणुकीसाठी पुरेशी जागा / गोदाम क्षमता?" value={isDairy ? `${d.hasStorage} / ${d.warehouseCapacity}` : d.easyAvailability} />
              {!isDairy && <DataRow label="पॅकवर दिलेले मुख्य घटक (%)" value={`प्रोटि:${d.packNutrition?.protein}% / फॅट:${d.packNutrition?.fat}% / फायबर:${d.packNutrition?.fiber}%`} />}
              <DataRow label="समाधान रेटिंग" value={isDairy ? d.satisfaction : `${d.rating}/५ स्टार`} />
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9px] font-black mb-0.5 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">
            १०-११. समस्या, सूचना व अतिरिक्त मुद्दे
          </h4>
          <Table className="border border-black">
            <TableBody>
              <DataRow label="पशुखाद्याबाबत मुख्य समस्या काय आहे?" value={d.mainProblem || d.problems} />
              <DataRow label="नवीन ब्रँडचे सॅम्पल मिळाले तर वापरून पाहाल का?" value={d.sampleTrial || d.switchIfCheaper} />
              <DataRow label="तुमच्या मते आदर्श पशुखाद्यात काय वैशिष्ट्ये असावीत?" value={d.goodFeedOpinion || d.idealFeedQualities} />
              {d.customPoints && d.customPoints.length > 0 && (
                <DataRow label="इतर नोंदवलेले मुद्दे" value={d.customPoints.map((p: any) => p.point).join(", ")} />
              )}
            </TableBody>
          </Table>
        </section>

        <div className="mt-2 border-t border-black pt-1 grid grid-cols-2 text-[8px] font-black uppercase tracking-tight break-inside-avoid">
          <div>सर्वेक्षक: {survey.surveyorName} ({survey.surveyorId})</div>
          <div className="text-right">तारीख: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</div>
        </div>
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
          <DialogContent className="max-w-[95vw] md:max-w-[210mm] max-h-[90vh] overflow-y-auto p-0 border-2 dialog-content-print">
            <DialogHeader className="p-4 border-b bg-muted/30 no-print">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">अहवाल पाहणे</DialogTitle>
                <Button variant="default" size="sm" onClick={() => window.print()} className="bg-black hover:bg-black/90 text-white font-black px-6">
                  <Printer className="h-4 w-4 mr-2" /> प्रिंट अहवाल
                </Button>
              </div>
            </DialogHeader>
            <div className="p-6 md:p-10 print:p-0">
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
