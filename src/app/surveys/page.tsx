
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

  const DataRow = ({ label, value, labelWidth = "68%" }: { label: string, value: any, labelWidth?: string }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <TableRow className="hover:bg-transparent border-b border-black">
        <TableHead className="font-black bg-gray-50 py-1.5 px-3 text-[10.5pt] h-auto border-r border-black leading-tight text-black print:font-black" style={{ width: labelWidth }}>
          {label}
        </TableHead>
        <TableCell className="py-2 px-3 text-[11pt] h-auto leading-tight text-black font-black">
          {translate(value)}
        </TableCell>
      </TableRow>
    );
  };

  const renderSurveyList = (filtered: SurveyRecord[]) => {
    if (filtered.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-10" />
          <p className="text-muted-foreground text-sm font-medium">कोणतेही सर्वेक्षण उपलब्ध नाही.</p>
        </div>
      );
    }

    return filtered.map(s => (
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
    ));
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-1 py-1 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-2 mb-2">
          <h2 className="text-[12pt] font-black uppercase tracking-tight">
            {isDairy ? "पशुखाद्य सर्वेक्षण अहवाल: दूध संकलन केंद्र / डेअरी" : "पशुखाद्य सर्वेक्षण अहवाल: शेतकरी ब्रँड सर्वेक्षण"}
          </h2>
          <div className="flex justify-between text-[10pt] font-black px-1 mt-1.5">
            <span className="flex items-center gap-1 font-black"><User className="h-4 w-4" /> सर्वेक्षक: {d.surveyorName || survey.surveyorName} ({d.surveyorId || survey.surveyorId})</span>
            <span className="font-black">तारीख: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
          </div>
        </div>

        {/* १. सामान्य माहिती */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            १. सामान्य व लोकेशन माहिती
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "दूध संकलन केंद्र / डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              {isDairy && <DataRow label="संपर्क क्रमांक" value={d.contact} />}
              <DataRow label="गाव" value={d.village} />
              <DataRow label="तालुका" value={d.taluka} />
              <DataRow label="जिल्हा" value={d.district} />
              <DataRow label="संपूर्ण पत्ता" value={d.address} />
              <DataRow label="जीपीएस लोकेशन" value={d.location} />
              {isDairy && <DataRow label="सध्याचे दूध संकलन (लिटर / दिवस)" value={d.milkCollection} />}
              {isDairy && <DataRow label="एकूण संलग्न शेतकरी संख्या" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        {/* २. पशुधन माहिती */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            २. पशुधन माहिती
          </h4>
          <div className="border border-black border-t-0">
            <div className="grid grid-cols-4 border-b border-black">
              <div className="p-2 border-r border-black bg-gray-50 font-black text-[10pt] flex gap-1">एकूण: <span className="font-black">{isDairy ? d.livestock?.totalAnimals : (parseInt(d.animalCount?.cows || '0') + parseInt(d.animalCount?.buffaloes || '0') + parseInt(d.animalCount?.calves || '0'))}</span></div>
              <div className="p-2 border-r border-black bg-gray-50 font-black text-[10pt] flex gap-1">गायी: <span className="font-black">{isDairy ? d.livestock?.cows : d.animalCount?.cows}</span></div>
              <div className="p-2 border-r border-black bg-gray-50 font-black text-[10pt] flex gap-1">म्हशी: <span className="font-black">{isDairy ? d.livestock?.buffaloes : d.animalCount?.buffaloes}</span></div>
              <div className="p-2 bg-gray-50 font-black text-[10pt] flex gap-1">वासरे: <span className="font-black">{isDairy ? d.livestock?.calves : d.animalCount?.calves}</span></div>
            </div>
            <Table className="table-fixed">
              <TableBody>
                <DataRow label="दूध देणारी जनावरे" value={isDairy ? d.livestock?.milkingAnimals : d.livestock?.milkingAnimals} />
                <DataRow label="सरासरी दूध उत्पादन (प्रति जनावर लिटर/दिवस)" value={isDairy ? d.livestock?.avgMilkPerAnimal : d.livestock?.avgMilkPerAnimal} />
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ३. पशुखाद्य वापर माहिती */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ३. पशुखाद्य वापर माहिती
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "कोणत्या प्रकारचे पशुखाद्य वापरता?" : "सध्या कोणत्या पशुखाद्य ब्रँडचा वापर करता?"} value={isDairy ? d.feedType : d.currentBrand} />
              {!isDairy && <DataRow label="हा ब्रँड तुम्ही किती काळापासून वापरत आहात?" value={d.usageDuration} />}
              <DataRow label={isDairy ? "पशुखाद्य दिवसातून किती वेळा देता?" : "दिवसातून किती वेळा देता?"} value={isDairy ? d.feedFrequency : d.frequency} />
              <DataRow label={isDairy ? "प्रति जनावर दररोज पशुखाद्य (किलो)" : "तुम्ही दिवसाला प्रति जनावर किती पशुखाद्य देता? (किलो)"} value={isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} />
              <DataRow label={isDairy ? "खालीलपैकी कोणते पूरक खाद्य वापरता?" : "पशुखाद्य सोबत इतर खाद्य देता का?"} value={isDairy ? d.supplements : d.otherFeeds} />
              <DataRow label={isDairy ? "इतर काही असल्यास" : "इतर"} value={isDairy ? d.otherSupplement : d.otherFeedText} />
            </TableBody>
          </Table>
        </section>

<<<<<<< HEAD
        {/* ४. पोषण विश्लेषण */}
=======
        {/* ४. ब्रँड व पोषण माहिती / ब्रँड निवड कारण */}
>>>>>>> 0a709a9 (Try fixing this error: `Build Error: Module not found: Can't resolve '@/)
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ४. पोषण विश्लेषण
          </h4>
          <Table className="border border-black table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b-2 border-black">
                <TableHead className="text-[9.5pt] font-black text-black border-r border-black">ब्रँड नाव</TableHead>
                <TableHead className="text-[9.5pt] font-black text-black border-r border-black">किंमत</TableHead>
                <TableHead className="text-[9.5pt] font-black text-black border-r border-black">प्रोटीन</TableHead>
                <TableHead className="text-[9.5pt] font-black text-black border-r border-black">फॅट</TableHead>
                <TableHead className="text-[9.5pt] font-black text-black border-r border-black">फायबर</TableHead>
                <TableHead className="text-[9.5pt] font-black text-black">कॅल्शियम</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isDairy ? (
                d.brandsInfo?.map((b: any, i: number) => (
                  <TableRow key={i} className="border-b border-black last:border-0">
                    <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{b.name}</TableCell>
                    <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">₹{b.price}</TableCell>
                    <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{b.protein}%</TableCell>
                    <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{b.fat}%</TableCell>
                    <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{b.fiber}%</TableCell>
                    <TableCell className="text-[9.5pt] py-1 px-2 font-black">{b.calcium}%</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{d.currentBrand}</TableCell>
                  <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">₹{d.bagPrice}</TableCell>
                  <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{d.packNutrition?.protein}%</TableCell>
                  <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{d.packNutrition?.fat}%</TableCell>
                  <TableCell className="text-[9.5pt] py-1 px-2 border-r border-black font-black">{d.packNutrition?.fiber}%</TableCell>
                  <TableCell className="text-[9.5pt] py-1 px-2 font-black">{d.packNutrition?.calcium}%</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

<<<<<<< HEAD
        {/* ५. खरेदी पद्धत / ब्रँड निवड कारण */}
=======
        {/* ५. खरेदी पद्धत / गुणवत्ता व परिणाम */}
>>>>>>> 0a709a9 (Try fixing this error: `Build Error: Module not found: Can't resolve '@/)
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ५. {isDairy ? "खरेदी पद्धत" : "ब्रँड निवड कारण"}
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="खरेदी पद्धत" value={d.purchaseMethod} />
                  <DataRow label="दिवसांची उधारी" value={d.creditDays} />
                </>
              ) : (
                <>
                  <DataRow label="हा ब्रँड निवडण्याचे मुख्य कारण काय?" value={d.selectionReason} />
                  <DataRow label="हा ब्रँड वापरायला सुरुवात कशी झाली?" value={d.startMethod} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ६. पुरवठा माहिती / गुणवत्ता व परिणाम */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ६. {isDairy ? "पुरवठा माहिती" : "गुणवत्ता व परिणाम"}
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="पुरवठा माहिती" value={d.suppliers?.map((s: any) => `${s.source}: ${s.name}`).join(", ")} />
                  <DataRow label="पुरवठा वेळेवर मिळतो का?" value={d.timelySupply} />
                </>
              ) : (
                <>
                  <DataRow label="या पशुखाद्याची गुणवत्ता कशी वाटते?" value={d.quality} />
                  <DataRow label="या फीडमुळे दूध उत्पादन वाढले का?" value={d.milkIncrease} />
                  <DataRow label="जनावरांचे आरोग्य सुधारले का?" value={d.healthImprovement} />
                  <DataRow label="जनावरांना हा फीड खायला आवडतो का?" value={d.likesFeed} />
                  <DataRow label="दूधातील फॅट मध्ये फरक जाणवला का?" value={d.fatDiff} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

<<<<<<< HEAD
        {/* ७. खर्च माहिती / किंमत व खरेदी */}
=======
        {/* ६. पुरवठा माहिती / किंमत व खरेदी */}
>>>>>>> 0a709a9 (Try fixing this error: `Build Error: Module not found: Can't resolve '@/)
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ७. {isDairy ? "खर्च माहिती" : "किंमत व खरेदी"}
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="महिन्याला एकूण खर्च (₹)" value={d.monthlyExp} />
                  <DataRow label="महिन्याला लागणाऱ्या पोत्यांची संख्या" value={d.monthlyBags} />
                </>
              ) : (
                <>
                  <DataRow label="एका पोत्याची किंमत (₹)" value={d.bagPrice} />
                  <DataRow label="पोत्याचे वजन (किग्रॅ)" value={d.bagWeight} />
                  <DataRow label="महिन्याला किती पोती लागतात?" value={d.monthlyBags} />
                  <DataRow label="हा ब्रँड कुठून खरेदी करता?" value={d.purchaseSource} />
                  <DataRow label="पुरवठादार" value={d.suppliers?.map((s: any) => s.name).join(", ")} />
                  <DataRow label="उधारी मिळते का?" value={d.hasCredit} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

<<<<<<< HEAD
        {/* ८. गुणवत्ता व समाधान / ब्रँड तुलना */}
=======
        {/* ७. खर्च माहिती / ब्रँड तुलना */}
>>>>>>> 0a709a9 (Try fixing this error: `Build Error: Module not found: Can't resolve '@/)
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ८. {isDairy ? "गुणवत्ता व समाधान" : "ब्रँड तुलना"}
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="सध्याच्या पशुखाद्याबद्दल तुम्ही समाधानी आहात का?" value={d.satisfaction} />
                  <DataRow label="पशुखाद्य बदलल्याने दूध उत्पादनात वाढ झाली का?" value={d.milkIncrease} />
                  <DataRow label="तुमच्या मते सर्वात चांगला ब्रँड कोणता?" value={d.bestBrand} />
                </>
              ) : (
                <>
                  <DataRow label="यापूर्वी कोणते ब्रँड वापरले आहेत?" value={d.previousBrands} />
                  <DataRow label="सध्याच्या ब्रँडपेक्षा चांगला ब्रँड कोणता वाटतो?" value={d.betterBrand} />
                  <DataRow label="हा ब्रँड वापरण्याचे कारण काय?" value={d.switchReason} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

<<<<<<< HEAD
        {/* ९. साठवणूक सुविधा / उपलब्धता व सेवा */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            ९. {isDairy ? "साठवणूक सुविधा (Storage)" : "उपलब्धता व सेवा"}
=======
        {/* ८. गुणवत्ता व समाधान / उपलब्धता व सेवा */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            {isDairy ? "८. गुणवत्ता व समाधान" : "७. उपलब्धता व सेवा"}
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="सध्याच्या पशुखाद्याबद्दल तुम्ही समाधानी आहात का?" value={d.satisfaction} />
                  <DataRow label="पशुखाद्य बदलल्याने दूध उत्पादनात वाढ झाली का?" value={d.milkIncrease} />
                  <DataRow label="तुमच्या मते सर्वात चांगला ब्रँड कोणता?" value={d.bestBrand} />
                </>
              ) : (
                <>
                  <DataRow label="बाजारात हा ब्रँड सहज मिळतो का?" value={d.easyAvailability} />
                  <DataRow label="कंपनी प्रतिनिधी गावात भेट देतात का?" value={d.repVisit} />
                  <DataRow label="कंपनीकडून सॅम्पल किंवा माहिती मिळते का?" value={d.samplesInfo} />
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* ९. साठवणूक सुविधा / घटक माहिती */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            {isDairy ? "९. साठवणूक सुविधा (Storage)" : "८. घटक माहिती"}
>>>>>>> 0a709a9 (Try fixing this error: `Build Error: Module not found: Can't resolve '@/)
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              {isDairy ? (
                <>
                  <DataRow label="गोदाम क्षमता (MT)" value={d.warehouseCapacity} />
                  <DataRow label="साठवणुकीसाठी पुरेशी जागा उपलब्ध आहे का?" value={d.hasStorage} />
                </>
              ) : (
                <>
<<<<<<< HEAD
                  <DataRow label="बाजारात हा ब्रँड सहज मिळतो का?" value={d.easyAvailability} />
                  <DataRow label="कंपनी प्रतिनिधी गावात भेट देतात का?" value={d.repVisit} />
                  <DataRow label="कंपनीकडून सॅम्पल किंवा माहिती मिळते का?" value={d.samplesInfo} />
=======
                  <DataRow label="तुम्हाला पशुखाद्यामधील घटक माहिती आहेत का?" value={d.knowsIngredients} />
                  <TableRow className="border-b border-black">
                    <TableHead className="font-black bg-gray-50 py-1 px-2 text-[9pt] border-r border-black" style={{ width: "32%" }}>घटक (%):</TableHead>
                    <TableCell className="py-1 px-2 text-[9pt] font-black">
                      प्रोटीन: {d.packNutrition?.protein}%, फॅट: {d.packNutrition?.fat}%, फायबर: {d.packNutrition?.fiber}%, 
                      कॅल्शियम: {d.packNutrition?.calcium}%, फॉस्फरस: {d.packNutrition?.phosphorus}%, 
                      मीठ: {d.packNutrition?.salt}%, मिनरल: {d.packNutrition?.mineralMix}%
                    </TableCell>
                  </TableRow>
>>>>>>> 0a709a9 (Try fixing this error: `Build Error: Module not found: Can't resolve '@/)
                </>
              )}
            </TableBody>
          </Table>
        </section>

        {/* १०. समस्या व सूचना */}
        <section className="break-inside-avoid">
          <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
            १०. समस्या व सूचना
          </h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "पशुखाद्याबाबत मुख्य समस्या काय आहे?" : "पशुखाद्य वापरताना कोणत्या समस्या येतात?"} value={isDairy ? d.mainProblem : d.problems} />
              {isDairy && <DataRow label="इतर समस्या" value={d.otherProblem} />}
              {!isDairy && <DataRow label="कंपनीने कोणत्या सुधारणा करायला हव्यात?" value={d.improvements} />}
              <DataRow label={isDairy ? "नवीन ब्रँडचे सॅम्पल मिळाले तर वापरून पाहाल का?" : "जर स्वस्त आणि चांगले फीड मिळाले तर ब्रँड बदलाल का?"} value={isDairy ? d.sampleTrial : d.switchIfCheaper} />
              <DataRow label={isDairy ? "तुमच्या मते आदर्श पशुखाद्यात काय वैशिष्ट्ये असावीत?" : "तुमच्या मते सर्वात चांगल्या पशुखाद्यामध्ये कोणते गुण असावेत?"} value={isDairy ? d.goodFeedOpinion : d.idealFeedQualities} />
              {!isDairy && <DataRow label="समाधान रेटिंग" value={`${d.rating}/५`} />}
            </TableBody>
          </Table>
        </section>

        {/* ११. ॲड पॉइंट्स */}
        {d.customPoints?.length > 0 && (
          <section className="break-inside-avoid">
            <h4 className="text-[10.5pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-gray-100 px-2">
              ११. ॲड पॉइंट्स (इतर मुद्दे)
            </h4>
            <div className="border border-black p-2 min-h-[40px] font-black text-[10pt]">
              {d.customPoints.map((p: any, idx: number) => (
                <div key={idx} className="mb-1">• {p.point}</div>
              ))}
            </div>
          </section>
        )}
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

          <TabsContent value="all" className="space-y-1 mt-0">
            {renderSurveyList(filterSurveys())}
          </TabsContent>
          <TabsContent value="dairy" className="space-y-1 mt-0">
            {renderSurveyList(filterSurveys('dairy'))}
          </TabsContent>
          <TabsContent value="farmer" className="space-y-1 mt-0">
            {renderSurveyList(filterSurveys('farmer'))}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[98vw] md:max-w-[210mm] max-h-[95vh] overflow-y-auto p-0 border-2 dialog-content-print shadow-none">
            <DialogHeader className="p-3 md:p-4 border-b bg-muted/30 no-print sticky top-0 z-50">
              <div className="flex items-center justify-between gap-2 w-full">
                <DialogTitle className="text-xs md:text-lg font-bold truncate flex-1">अहवाल</DialogTitle>
                <Button variant="default" size="sm" onClick={() => window.print()} className="bg-black text-white font-bold h-8 text-[10px] md:text-sm px-3 shrink-0">
                  <Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट अहवाल
                </Button>
              </div>
            </DialogHeader>
            <div className="p-3 md:p-6 bg-white">
              {selectedSurvey && renderDetailedReport(selectedSurvey)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
