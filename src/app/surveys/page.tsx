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
      <TableRow className="hover:bg-transparent border-b border-black print:border-black">
        <TableHead className="w-[55%] font-black bg-gray-50 py-3 px-3 text-[13px] h-auto border-r border-black leading-tight text-black print:bg-gray-100 print:font-black print:text-black">
          {label}
        </TableHead>
        <TableCell className="py-3 px-3 text-[13px] h-auto leading-tight text-black font-bold print:text-black print:font-black">
          {displayValue}
        </TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-6 py-2 print:space-y-8 print:text-black">
        <section className="break-inside-avoid">
          <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
            १. सामान्य माहिती (General Information)
          </h4>
          <Table className="border-2 border-black">
            <TableBody>
              <DataRow label="लोकेशन टॅगिंग (GPS Location)" value={d.location} />
              <DataRow label={isDairy ? "दूध संकलन केंद्र / डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              {isDairy && <DataRow label="संपर्क क्रमांक" value={d.contact} />}
              <DataRow label="गाव (Village)" value={d.village} />
              <DataRow label="जिल्हा (District)" value={d.district} />
              <DataRow label="तालुका (Taluka)" value={d.taluka} />
              {isDairy && <DataRow label="संपूर्ण पत्ता" value={d.address} />}
              {isDairy && <DataRow label="सध्याचे दूध संकलन (लिटर / दिवस)" value={d.milkCollection} />}
              {isDairy && <DataRow label="एकूण संलग्न शेतकरी संख्या" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
            २. पशुधन माहिती (Livestock Details)
          </h4>
          <Table className="border-2 border-black">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="एकूण जनावरे" value={d.livestock?.totalAnimals} />
                  <DataRow label="गायी" value={d.livestock?.cows} />
                  <DataRow label="म्हशी" value={d.livestock?.buffaloes} />
                  <DataRow label="वासरे" value={d.livestock?.calves} />
                  <DataRow label="दूध देणारी जनावरे" value={d.livestock?.milkingAnimals} />
                  <DataRow label="सरासरी दूध उत्पादन (प्रति जनावर लिटर/दिवस)" value={d.livestock?.avgMilkPerAnimal} />
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

        <section className="break-inside-avoid">
          <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
            ३. पशुखाद्य वापर माहिती (Feed Usage)
          </h4>
          <Table className="border-2 border-black">
            <TableBody>
              <DataRow label={isDairy ? "कोणत्या प्रकारचे पशुखाद्य वापरता?" : "सध्या कोणत्या पशुखाद्य ब्रँडचा वापर करता?"} value={isDairy ? d.feedType : d.currentBrand} />
              {!isDairy && <DataRow label="हा ब्रँड तुम्ही किती काळापासून वापरत आहात?" value={d.usageDuration} />}
              <DataRow label={isDairy ? "पशुखाद्य दिवसातून किती वेळा देता?" : "दिवसातून किती वेळा देता?"} value={isDairy ? d.feedFrequency : d.frequency} />
              <DataRow label={isDairy ? "प्रति जनावर दररोज पशुखाद्य (किग्रॅ)" : "तुम्ही दिवसाला प्रति जनावर किती पशुखाद्य देता? (किलो)"} value={isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} />
              <DataRow label={isDairy ? "खालीलपैकी कोणते पूरक खाद्य वापरता?" : "पशुखाद्य सोबत इतर खाद्य देता का?"} value={isDairy ? d.supplements : d.otherFeeds} />
              {(d.otherSupplement || d.otherFeedText) && <DataRow label="इतर पूरक माहिती" value={d.otherSupplement || d.otherFeedText} />}
            </TableBody>
          </Table>
        </section>

        {!isDairy && (
          <section className="break-inside-avoid">
            <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
              ४. ब्रँड निवड व गुणवत्ता विश्लेषण
            </h4>
            <Table className="border-2 border-black">
              <TableBody>
                <DataRow label="हा ब्रँड निवडण्याचे मुख्य कारण काय?" value={d.selectionReason} />
                <DataRow label="हा ब्रँड वापरायला सुरुवात कशी झाली?" value={d.startMethod} />
                <DataRow label="या पशुखाद्याची गुणवत्ता कशी वाटते?" value={d.quality} />
                <DataRow label="या फीडमुळे दूध उत्पादन वाढले का?" value={d.milkIncrease} />
                <DataRow label="जनावरांचे आरोग्य सुधारले का?" value={d.healthImprovement} />
                <DataRow label="जनावरांना हा फीड खायला आवडतो का?" value={d.likesFeed} />
                <DataRow label="दूधातील फॅट किंवा SNF मध्ये फरक जाणवला का?" value={d.fatDiff} />
              </TableBody>
            </Table>
          </section>
        )}

        {isDairy && d.brandsInfo && d.brandsInfo.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
              ४. ब्रँड व पोषण विश्लेषण तक्ता
            </h4>
            <div className="border-2 border-black overflow-hidden mb-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 border-b border-black">
                    <TableHead className="font-black text-black border-r border-black h-11 text-[12px] uppercase">ब्रँड</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-11 text-[12px] uppercase">किंमत</TableHead>
                    <TableHead className="font-black text-black border-r border-black h-11 text-[12px] uppercase">प्रोटीन</TableHead>
                    <TableHead className="font-black text-black h-11 text-[12px] uppercase">फॅट</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {d.brandsInfo.map((b: any, i: number) => (
                    <TableRow key={i} className="border-b border-black last:border-0">
                      <TableCell className="font-black border-r border-black py-2 text-[12px]">{b.name}</TableCell>
                      <TableCell className="border-r border-black py-2 text-[12px] font-bold">₹{b.price}</TableCell>
                      <TableCell className="border-r border-black py-2 text-[12px] font-bold">{b.protein}%</TableCell>
                      <TableCell className="py-2 text-[12px] font-bold">{b.fat}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        <section className="break-inside-avoid">
          <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
            ५. खरेदी व खर्च माहिती (Purchasing)
          </h4>
          <Table className="border-2 border-black">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="खरेदी पद्धत" value={d.purchaseMethod} />
                  <DataRow label="पशुखाद्य कुठून खरेदी करता?" value={d.supplySource} />
                  <DataRow label="पुरवठादाराचे नाव" value={d.supplierName} />
                  <DataRow label="पुरवठा वेळेवर मिळतो का?" value={d.timelySupply} />
                  <DataRow label="महिन्याला एकूण खर्च (₹)" value={d.monthlyExp} />
                  <DataRow label="महिन्याला लागणाऱ्या पोत्यांची संख्या" value={d.monthlyBags} />
                </>
              ) : (
                <>
                  <DataRow label="एका पोत्याची किंमत (₹)" value={d.bagPrice} />
                  <DataRow label="पोत्याचे वजन (किग्रॅ)" value={d.bagWeight} />
                  <DataRow label="महिन्याला किती पोती लागतात?" value={d.monthlyBags} />
                  <DataRow label="हा ब्रँड कुठून खरेदी करता?" value={d.purchaseSource} />
                  <DataRow label="उधारी मिळते का?" value={d.hasCredit} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {!isDairy && (
          <section className="break-inside-avoid">
            <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
              ६-९. तुलनात्मक विश्लेषण व घटक
            </h4>
            <Table className="border-2 border-black">
              <TableBody>
                <DataRow label="यापूर्वी कोणते ब्रँड वापरले आहेत?" value={d.previousBrands} />
                <DataRow label="सध्याच्या ब्रँडपेक्षा चांगला ब्रँड कोणता वाटतो?" value={d.betterBrand} />
                <DataRow label="हा ब्रँड वापरण्याचे कारण काय?" value={d.switchReason} />
                <DataRow label="बाजारात हा ब्रँड सहज मिळतो का?" value={d.easyAvailability} />
                <DataRow label="कंपनी प्रतिनिधी गावात भेट देतात का?" value={d.repVisit} />
                <DataRow label="कंपनीकडून सॅम्पल किंवा माहिती मिळते का?" value={d.samplesInfo} />
                <DataRow label="तुम्हाला पशुखाद्यामधील घटक माहिती आहेत का?" value={d.knowsIngredients} />
                <DataRow label="पॅकवर दिलेले मुख्य घटक (प्रोटीन, फॅट, फायबर...)" value={`P: ${d.packNutrition?.protein}%, F: ${d.packNutrition?.fat}%, Fiber: ${d.packNutrition?.fiber}%, Ca: ${d.packNutrition?.calcium}%, P: ${d.packNutrition?.phosphorus}%`} />
                <DataRow label="समाधान रेटिंग" value={`${d.rating}/५ स्टार`} />
              </TableBody>
            </Table>
          </section>
        )}

        {isDairy && (
          <section className="break-inside-avoid">
            <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
              ६-९. गुणवत्ता व साठवणूक तपशील
            </h4>
            <Table className="border-2 border-black">
              <TableBody>
                <DataRow label="सध्याच्या पशुखाद्याबद्दल तुम्ही समाधानी आहात का?" value={d.satisfaction} />
                <DataRow label="पशुखाद्य बदलल्याने दूध उत्पादनात वाढ झाली का?" value={d.milkIncrease} />
                <DataRow label="तुमच्या मते सर्वात चांगला ब्रँड कोणता?" value={d.bestBrand} />
                <DataRow label="गोदाम क्षमता (MT)" value={d.warehouseCapacity} />
                <DataRow label="साठवणुकीसाठी पुरेशी जागा उपलब्ध आहे का?" value={d.hasStorage} />
              </TableBody>
            </Table>
          </section>
        )}

        <section className="break-inside-avoid">
          <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
            १०. समस्या, सूचना व अभिप्राय
          </h4>
          <Table className="border-2 border-black">
            <TableBody>
              <DataRow label={isDairy ? "पशुखाद्याबाबत मुख्य समस्या काय आहे?" : "पशुखाद्य वापरताना कोणत्या समस्या येतात?"} value={d.mainProblem || d.problems} />
              <DataRow label={isDairy ? "नवीन ब्रँडचे सॅम्पल मिळाले तर वापरून पाहाल का?" : "जर दुसऱ्या कंपनीचे स्वस्त आणि चांगले फीड मिळाले तर ब्रँड बदलाल का?"} value={d.sampleTrial || d.switchIfCheaper} />
              <DataRow label={isDairy ? "तुमच्या मते आदर्श पशुखाद्यात काय वैशिष्ट्ये असावीत?" : "तुमच्या मते सर्वात चांगल्या पशुखाद्यामध्ये कोणते गुण असावेत?"} value={d.goodFeedOpinion || d.idealFeedQualities} />
              {!isDairy && <DataRow label="कंपनीने कोणत्या सुधारणा करायला हव्यात?" value={d.improvements} />}
            </TableBody>
          </Table>
        </section>

        {d.customPoints && d.customPoints.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className="text-[15px] font-black mb-3 border-b-2 border-black pb-1 text-black uppercase">
              ११. अतिरिक्त नोंदवलेले मुद्दे (ॲड पॉइंट्स)
            </h4>
            <Table className="border-2 border-black">
              <TableBody>
                {d.customPoints.map((pt: any, idx: number) => (
                  <DataRow key={idx} label={`नोंदवलेला मुद्दा क्रमांक ${idx + 1}`} value={pt.point} />
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        <div className="mt-12 border-t-4 border-black pt-5 grid grid-cols-2 text-[14px] font-black uppercase tracking-tight print:font-black">
          <div>सर्वेक्षक स्वाक्षरी: {survey.surveyorName} ({survey.surveyorId})</div>
          <div className="text-right">अहवाल दिनांक: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</div>
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
          <DialogContent className="max-w-[95vw] md:max-w-[210mm] max-h-[95vh] overflow-y-auto p-0 border-2">
            <DialogHeader className="p-6 border-b bg-muted/30 no-print">
              <div className="flex justify-between items-center">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  {selectedSurvey?.type === 'dairy' ? <FileText className="text-primary h-5 w-5" /> : <ClipboardList className="text-accent h-5 w-5" />}
                  सर्वेक्षण अहवाल: {selectedSurvey?.data.dairyName || selectedSurvey?.data.farmerName}
                </DialogTitle>
                <Button variant="default" size="sm" onClick={() => window.print()} className="h-9 px-6 text-sm gap-2 font-black shadow-md">
                  <Printer className="h-4 w-4" /> प्रिंट अहवाल (A4)
                </Button>
              </div>
            </DialogHeader>
            <div className="p-8 print:p-0">
              {selectedSurvey && renderDetailedReport(selectedSurvey)}
            </div>
          </DialogContent>
        </Dialog>

        <div className="hidden print:block">
          <div className="print-only-report">
            {selectedSurvey ? (
              <div className="w-full">
                <div className="text-center border-b-4 border-black pb-3 mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tight">पशुखाद्य सर्वेक्षण अहवाल</h2>
                  <p className="text-[16px] font-black mt-1">({selectedSurvey.type === 'dairy' ? 'दूध संकलन केंद्र / डेअरी' : 'शेतकरी ब्रँड'} सर्वेक्षण)</p>
                </div>
                {renderDetailedReport(selectedSurvey)}
              </div>
            ) : (
              surveys.map((survey, index) => (
                <div key={survey.id} className={`${index > 0 ? 'mt-20' : ''} w-full break-inside-avoid`}>
                  <div className="text-center border-b-4 border-black pb-3 mb-8">
                    <h2 className="text-3xl font-black uppercase">पशुखाद्य सर्वेक्षण अहवाल</h2>
                    <p className="text-[16px] font-black mt-1">{survey.type === 'dairy' ? 'दूध संकलन केंद्र' : 'शेतकरी ब्रँड'}</p>
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