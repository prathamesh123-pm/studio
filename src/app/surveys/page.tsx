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
        <TableHead className="w-[50%] font-black bg-gray-50 py-1 px-2 text-[8.5pt] h-auto border-r border-black leading-tight text-black">
          {label}
        </TableHead>
        <TableCell className="py-1 px-2 text-[8.5pt] h-auto leading-tight text-black font-black">
          {translate(value)}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-0.5 py-1 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-1 mb-1">
          <h2 className="text-[12pt] font-black uppercase tracking-tight">
            {isDairy ? "पशुखाद्य सर्वेक्षण अहवाल: दूध संकलन केंद्र / डेअरी" : "पशुखाद्य सर्वेक्षण अहवाल: शेतकरी ब्रँड सर्वेक्षण"}
          </h2>
          <div className="flex justify-between text-[9pt] font-black px-1 mt-1">
            <span className="flex items-center gap-1 font-black"><User className="h-3.5 w-3.5" /> सर्वेक्षक: {d.surveyorName || survey.surveyorName} ({d.surveyorId || survey.surveyorId})</span>
            <span className="font-black">तारीख: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
          </div>
        </div>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            १. सामान्य व लोकेशन माहिती
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "दूध संकलन केंद्र / डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव व संपर्क" : "मोबाईल नंबर"} value={isDairy ? `${d.ownerName} / ${d.contact}` : d.mobile} />
              <TableRow className="border-b border-black">
                <TableCell className="p-0" colSpan={2}>
                  <Table className="border-0 table-fixed">
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-[8.5pt] py-1 px-2 border-r border-black font-black">गाव: {d.village}</TableCell>
                        <TableCell className="text-[8.5pt] py-1 px-2 border-r border-black font-black">तालुका: {d.taluka}</TableCell>
                        <TableCell className="text-[8.5pt] py-1 px-2 font-black">जिल्हा: {d.district}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
              <TableRow className="border-b border-black">
                <TableHead className="w-[50%] font-black bg-gray-50 py-1 px-2 text-[8.5pt] h-auto border-r border-black leading-tight text-black">संपूर्ण पत्ता</TableHead>
                <TableCell className="py-2 px-2 text-[8.5pt] h-auto leading-tight text-black font-black min-h-[40px] align-top">
                  {d.address || '-'}
                </TableCell>
              </TableRow>
              <DataRow label="जीपीएस लोकेशन" value={d.location} />
              {isDairy && <DataRow label="सध्याचे दूध संकलन (लिटर / दिवस)" value={d.milkCollection} />}
              {isDairy && <DataRow label="एकूण संलग्न शेतकरी संख्या" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            २. पशुधन माहिती
          </h4>
          <Table className="border border-black table-fixed w-full">
            <TableBody>
              <TableRow className="border-b border-black">
                <TableCell className="p-0" colSpan={2}>
                  <Table className="border-0 table-fixed w-full">
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-[8.5pt] py-1 px-2 border-r border-black font-black w-[40%]">एकूण जनावरे: <span className="text-[10pt] font-black">{isDairy ? d.livestock?.totalAnimals : (parseInt(d.animalCount?.cows || '0') + parseInt(d.animalCount?.buffaloes || '0') + parseInt(d.animalCount?.calves || '0'))}</span></TableCell>
                        <TableCell className="text-[8.5pt] py-1 px-2 border-r border-black font-black">गायी: {isDairy ? d.livestock?.cows : d.animalCount?.cows}</TableCell>
                        <TableCell className="text-[8.5pt] py-1 px-2 border-r border-black font-black">म्हशी: {isDairy ? d.livestock?.buffaloes : d.animalCount?.buffaloes}</TableCell>
                        <TableCell className="text-[8.5pt] py-1 px-2 font-black">वासरे: {isDairy ? d.livestock?.calves : d.animalCount?.calves}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
              {isDairy && (
                <TableRow>
                  <TableHead className="w-[50%] font-black bg-gray-50 py-1 px-2 text-[8.5pt] border-r border-black text-black">दूध देणारी जनावरे</TableHead>
                  <TableCell className="text-[8.5pt] py-1 px-2 font-black">{d.livestock?.milkingAnimals} (सरासरी: {d.livestock?.avgMilkPerAnimal} लिटर/दिवस)</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            ३-४. पशुखाद्य वापर व ब्रँड तपशील
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="कोणत्या प्रकारचे पशुखाद्य वापरता?" value={isDairy ? d.feedType : d.currentBrand} />
              {!isDairy && <DataRow label="हा ब्रँड तुम्ही किती काळापासून वापरत आहात?" value={d.usageDuration} />}
              <DataRow label="दिवसातून किती वेळा पशुखाद्य देता?" value={isDairy ? d.feedFrequency : d.frequency} />
              <DataRow label="प्रति जनावर दररोज पशुखाद्य (किलो)" value={isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} />
              <DataRow label="खालीलपैकी कोणते पूरक खाद्य वापरता?" value={isDairy ? d.supplements : d.otherFeeds} />
              <DataRow label="इतर पूरक खाद्य माहिती" value={d.otherSupplement || d.otherFeedText} />
              {!isDairy && <DataRow label="हा ब्रँड निवडण्याचे मुख्य कारण काय?" value={d.selectionReason} />}
              {!isDairy && <DataRow label="हा ब्रँड वापरायला सुरुवात कशी झाली?" value={d.startMethod} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            ५. पोषण मूल्ये आणि घटक विश्लेषण (%)
          </h4>
          <Table className="border border-black table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-black">
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">ब्रँड / कंपनी</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">किंमत</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">प्रोटीन</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">फॅट</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">फायबर</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black border-r border-black">कॅल्शियम</TableHead>
                <TableHead className="text-[8pt] h-6 py-0 px-1 font-black text-black">मिनरल</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDairy ? (
                d.brandsInfo?.length > 0 ? (
                  d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i} className="border-b border-black last:border-0">
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black truncate">{b.name}</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">₹{b.price}</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{b.protein}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{b.fat}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{b.fiber}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{b.calcium}%</TableCell>
                      <TableCell className="text-[7.5pt] py-0.5 px-1 font-black">{b.mineralMix}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center py-1 text-[8pt] font-black">माहिती उपलब्ध नाही</TableCell></TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black truncate">{d.currentBrand}</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">₹{d.bagPrice}</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{d.packNutrition?.protein}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{d.packNutrition?.fat}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{d.packNutrition?.fiber}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 border-r border-black font-black">{d.packNutrition?.calcium}%</TableCell>
                  <TableCell className="text-[7.5pt] py-0.5 px-1 font-black">{d.packNutrition?.mineralMix}%</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            ६-९. खरेदी, गुणवत्ता व साठवणूक तपशील
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="पशुखाद्य खरेदी पद्धत / स्त्रोत" value={isDairy ? d.purchaseMethod : d.purchaseSource} />
              <DataRow label="पुरवठादार माहिती" value={d.suppliers?.map((s: any) => `${s.name} (${translate(s.source)})`).join(", ")} />
              <DataRow label="पुरवठा वेळेवर मिळतो का? / उधारी सुविधा?" value={isDairy ? d.timelySupply : d.hasCredit} />
              <DataRow label="महिन्याला लागणाऱ्या पोत्यांची संख्या" value={d.monthlyBags} />
              <DataRow label="समाधान रेटिंग" value={isDairy ? d.satisfaction : `${d.rating}/५ (${translate(d.quality)})`} />
              <DataRow label="पशुखाद्य बदलल्याने दूध उत्पादनात वाढ झाली का?" value={d.milkIncrease} />
              <DataRow label="तुमच्या मते सर्वात चांगला ब्रँड कोणता?" value={d.bestBrand || d.betterBrand} />
              {isDairy && <DataRow label="गोदाम क्षमता (MT)" value={d.warehouseCapacity} />}
              {isDairy && <DataRow label="साठवणुकीसाठी पुरेशी जागा उपलब्ध आहे का?" value={d.hasStorage} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b border-black pb-0.5 uppercase bg-gray-100 px-1">
            १०. समस्या, सूचना व अभिप्राय
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="पशुखाद्याबाबत मुख्य समस्या काय आहे?" value={d.mainProblem || d.problems} />
              <DataRow label="नवीन ब्रँडचे सॅम्पल वापरून पाहाल का?" value={d.sampleTrial || d.switchIfCheaper} />
              <DataRow label="आदर्श पशुखाद्यात काय वैशिष्ट्ये असावीत?" value={d.goodFeedOpinion || d.idealFeedQualities} />
              {d.improvements && <DataRow label="कंपनीने कोणत्या सुधारणा करायला हव्यात?" value={d.improvements} />}
              {d.customPoints?.length > 0 && (
                <DataRow label="अतिरिक्त मुद्दे" value={d.customPoints.map((p: any) => p.point).join(", ")} />
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    );
  };

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
            {filterSurveys().length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-10" />
                <p className="text-muted-foreground text-sm font-medium">कोणतेही सर्वेक्षण उपलब्ध नाही.</p>
              </div>
            ) : filterSurveys().map(s => (
              <Card key={s.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden mb-3 group">
                <CardContent className="p-0">
                  <div className="p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex gap-3 items-center">
                      <div className={`p-2 rounded-full shrink-0 ${s.type === 'dairy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {s.type === 'dairy' ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base leading-tight">
                          {s.data.dairyName || s.data.farmerName}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {s.data.village}, {s.data.taluka}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(s.timestamp).toLocaleDateString('mr-IN')}</span>
                          <Badge variant={s.type === 'dairy' ? 'default' : 'secondary'} className={`${s.type === 'dairy' ? 'bg-primary' : 'bg-accent'} text-[8px] h-4 px-1.5`}>
                            {s.type === 'dairy' ? 'संकलन केंद्र' : 'शेतकरी'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end no-print">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 gap-1 border-primary text-primary hover:bg-primary/10 text-xs" 
                        onClick={() => {
                          setSelectedSurvey(s);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" /> पहा
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 gap-1 border-primary text-primary hover:bg-primary/10 text-xs" 
                        onClick={() => handleEdit(s)}
                      >
                        <Edit2 className="h-3.5 w-3.5" /> अपडेट
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 gap-1 text-destructive border-destructive hover:bg-destructive/10 text-xs" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> हटवा
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[98vw] md:max-w-[210mm] max-h-[95vh] overflow-y-auto p-0 border-2 dialog-content-print shadow-none">
            <DialogHeader className="p-2 md:p-4 border-b bg-muted/30 no-print sticky top-0 z-50 dialog-header-print">
              <div className="flex items-center justify-between gap-2 w-full">
                <DialogTitle className="text-xs md:text-lg font-bold truncate flex-1">अहवाल</DialogTitle>
                <Button variant="default" size="sm" onClick={() => window.print()} className="bg-black text-white font-bold h-8 text-[10px] md:text-sm px-3 shrink-0">
                  <Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट अहवाल
                </Button>
              </div>
            </DialogHeader>
            <div className="p-2 md:p-6 bg-white">
              {selectedSurvey && renderDetailedReport(selectedSurvey)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}