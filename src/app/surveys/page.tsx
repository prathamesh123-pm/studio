"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Loader2,
  Check
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
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import React from "react";

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

  useEffect(() => { loadSurveys(); }, []);

  const handleDelete = (id: string) => {
    if (confirm("तुम्ही हा सर्वे रिपोर्ट कायमचा हटवू इच्छिता का?")) {
      deleteSurvey(id);
      loadSurveys();
      toast({ title: "यशस्वी", description: "रिपोर्ट हटवण्यात आला आहे." });
    }
  };

  const handleEdit = (survey: SurveyRecord) => {
    const path = survey.type === 'dairy' ? '/survey/dairy' : '/survey/farmer';
    router.push(`${path}?id=${survey.id}`);
  };

  const translations: Record<string, string> = {
    'Yes': 'होय', 'No': 'नाही', 'ReadyMade': 'रेडीमेड', 'HomeMade': 'घरगुती मिश्रण', 'Both': 'दोन्ही',
    'DryFodder': 'सुका चारा', 'GreenFodder': 'हिरवा चारा', 'Khala': 'खळ (पेंड)', 'Maize': 'मका', 'MineralMix': 'खनिज मिश्रण',
    'Cash': 'रोखीने', 'Credit': 'उधारीने', 'VeryGood': 'उत्कृष्ट', 'Okay': 'ठीक आहे', 'NotSatisfied': 'समाधानी नाही',
    'LocalShop': 'स्थानिक दुकान', 'Dealer': 'डीलर', 'Other': 'इतर', 'होय': 'होय', 'नाही': 'नाही',
    'कधीकधी': 'कधीकधी', 'थोड्या प्रमाणात': 'थोड्या प्रमाणात', 'मध्यम': 'मध्यम', 'Quality': 'चांगली गुणवत्ता',
    'MilkIncrease': 'दूध उत्पादन वाढ', 'PeerAdvice': 'इतर शेतकरी सल्ला', 'LowPrice': 'कमी किंमत', 'Availability': 'उपलब्धता',
    'Price': 'किंमत', 'Milk': 'दूध उत्पादन', 'NoMilkIncrease': 'दूध वाढ नाही', 'LowFat': 'फॅट कमी लागते',
    'AnimalDoesntLike': 'जनावर खात नाही', 'HighPrice': 'किंमत जास्त आहे', 'LateSupply': 'पुरवठा उशिरा होतो',
    'Adulteration': 'भेसळ वाटते', 'DigestionIssues': 'पचनाचे त्रास'
  };

  const translate = (val: any) => {
    if (Array.isArray(val)) return val.map(v => translations[v] || v).join(", ");
    if (val === undefined || val === null || val === "") return "-";
    return translations[val] || val;
  };

  const DataRow = ({ label, value, labelWidth = "68%" }: { label: string, value: any, labelWidth?: string }) => (
    <TableRow className="hover:bg-transparent border-b border-black">
      <TableHead className="font-bold bg-slate-50/50 py-1.5 px-2 text-[8.5pt] h-auto border-r border-black leading-tight text-black" style={{ width: labelWidth }}>{label}</TableHead>
      <TableCell className="py-1.5 px-2 text-[9pt] h-auto leading-tight text-black font-semibold">{translate(value)}</TableCell>
    </TableRow>
  );

  const NutrientRow = ({ desc, data }: { desc: string, data: any }) => {
    if (!data || (typeof data === 'object' && !data.value)) return null;
    const limit = data.limit || (desc.toLowerCase().includes('fiber') || desc.toLowerCase().includes('ash') || desc.toLowerCase().includes('aflatoxin') || desc.toLowerCase().includes('urea') || desc.toLowerCase().includes('moisture') ? 'Max' : 'Min');
    return (
      <TableRow className="border-b border-black">
        <TableCell className="py-1 px-2 text-[8pt] font-semibold border-r border-black" style={{ width: '40%' }}>{desc}</TableCell>
        <TableCell className="py-1 px-2 text-[8pt] font-semibold border-r border-black text-center" style={{ width: '20%' }}>{limit}</TableCell>
        <TableCell className="py-1 px-2 text-[8pt] font-semibold border-r border-black text-center" style={{ width: '20%' }}>{desc.toLowerCase().includes('aflatoxin') ? 'ppb' : '%'}</TableCell>
        <TableCell className="py-1 px-2 text-[8pt] font-semibold text-center" style={{ width: '20%' }}>{data.value || '-'}</TableCell>
      </TableRow>
    );
  };

  const NutrientTable = ({ nutrition }: { nutrition: any }) => {
    if (!nutrition) return <div className="p-2 text-[8pt] italic border border-black border-t-0">पोषक घटकांची माहिती उपलब्ध नाही</div>;
    return (
      <Table className="border border-black table-fixed border-t-0">
        <TableBody>
          <NutrientRow desc="Crude protein" data={nutrition.protein} />
          <NutrientRow desc="Crude fat" data={nutrition.fat} />
          <NutrientRow desc="Crude fiber" data={nutrition.fiber} />
          <NutrientRow desc="Acid insoluble ash" data={nutrition.ash} />
          <NutrientRow desc="Calcium" data={nutrition.calcium} />
          <NutrientRow desc="Total phosphorus" data={nutrition.totalPhosphorus} />
          <NutrientRow desc="Available phosphorus" data={nutrition.availablePhosphorus} />
          <NutrientRow desc="Aflatoxin B1" data={nutrition.aflatoxin} />
          <NutrientRow desc="Urea" data={nutrition.urea} />
          <NutrientRow desc="Moisture" data={nutrition.moisture} />
        </TableBody>
      </Table>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-1 py-1 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-1 mb-1">
          <h2 className="text-[10.5pt] font-black uppercase leading-tight">
            {isDairy ? "पशुखाद्य सर्वेक्षण अहवाल: दूध संकलन केंद्र / डेअरी" : "पशुखाद्य सर्वेक्षण अहवाल: शेतकरी ब्रँड सर्वेक्षण"}
          </h2>
          <div className="flex justify-between text-[8pt] font-bold px-1 mt-1">
            <span>सर्वेक्षक: {d.surveyorName} ({d.surveyorId})</span>
            <span>तारीख: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
          </div>
        </div>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">१. सामान्य व लोकेशन माहिती</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "तुमच्या दूध संकलन केंद्राचे (डेअरी) नाव काय आहे?" : "तुमचे (शेतकऱ्याचे) पूर्ण नाव काय आहे?"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "डेअरी मालकाचे पूर्ण नाव काय आहे?" : "तुमचा संपर्क मोबाईल नंबर काय आहे?"} value={isDairy ? d.ownerName : (d.mobile || d.contact)} />
              <DataRow label="तुमचे गाव / तालुका / जिल्हा कोणते आहे?" value={`${d.village}, ${d.taluka}, ${d.district}`} />
              <DataRow label="सर्वेक्षणाचे नोंदवलेले जीपीएस लोकेशन (GPS)" value={d.location} />
              {isDairy && <DataRow label="दिवसाचे एकूण दूध संकलन किती लिटर होते?" value={d.milkCollection} />}
              {isDairy && <DataRow label="तुमच्या केंद्राशी एकूण किती शेतकरी जोडले आहेत?" value={d.farmerCount} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">२. पशुधन माहिती</h4>
          <div className="border border-black border-t-0">
            <div className="grid grid-cols-4 border-b border-black">
              <div className="p-1.5 border-r border-black bg-slate-50/50 flex flex-col items-center">
                <span className="text-[7pt] font-bold uppercase">एकूण जनावरे</span>
                <span className="font-black text-[10pt]">{isDairy ? d.livestock?.totalAnimals : (parseInt(d.animalCount?.cows || '0') + parseInt(d.animalCount?.buffaloes || '0') + parseInt(d.animalCount?.calves || '0'))}</span>
              </div>
              <div className="p-1.5 border-r border-black bg-slate-50/50 flex flex-col items-center">
                <span className="text-[7pt] font-bold uppercase">गायी</span>
                <span className="font-black text-[10pt]">{isDairy ? d.livestock?.cows : d.animalCount?.cows}</span>
              </div>
              <div className="p-1.5 border-r border-black bg-slate-50/50 flex flex-col items-center">
                <span className="text-[7pt] font-bold uppercase">म्हशी</span>
                <span className="font-black text-[10pt]">{isDairy ? d.livestock?.buffaloes : d.animalCount?.buffaloes}</span>
              </div>
              <div className="p-1.5 bg-slate-50/50 flex flex-col items-center">
                <span className="text-[7pt] font-bold uppercase">वासरे</span>
                <span className="font-black text-[10pt]">{isDairy ? d.livestock?.calves : d.animalCount?.calves}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">३. पशुखाद्य वापर माहिती</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "तुमच्या केंद्रात तुम्ही कोणत्या प्रकारचे पशुखाद्य वापरता?" : "सध्या तुम्ही कोणत्या ब्रँडचे पशुखाद्य वापरता?"} value={isDairy ? d.feedType : d.currentBrand} />
              {!isDairy && <DataRow label="तुम्ही हा ब्रँड किती काळापासून वापरत आहात?" value={d.usageDuration} />}
              <DataRow label="दिवसातून किती वेळा पशुखाद्य देता?" value={isDairy ? d.feedFrequency : d.frequency} />
              <DataRow label="प्रत्येक जनावराला दररोज साधारणपणे किती किलो पशुखाद्य देता?" value={isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} />
              <DataRow label="वापरत असलेले इतर पूरक खाद्य (सुका चारा, खळ इ.)" value={isDairy ? d.supplements : d.otherFeeds} />
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">४. ब्रँड व पोषण विश्लेषण</h4>
          <div className="border border-black border-t-0">
            {isDairy ? (d.brandsInfo && d.brandsInfo.length > 0 ? d.brandsInfo.map((b: any, i: number) => (
              <div key={i} className="border-b last:border-0 border-black">
                <div className="bg-slate-50/50 p-1 font-black text-center text-[8.5pt] border-b border-black">{i+1}. {b.name} (किंमत: ₹{b.price})</div>
                <NutrientTable nutrition={b} />
              </div>
            )) : <div className="p-2 text-[8pt] italic border-b border-black">ब्रँडची माहिती उपलब्ध नाही</div>) : (
              <div>
                <div className="bg-slate-50/50 p-1 font-black text-center text-[8.5pt] border-b border-black">{d.currentBrand} (पोषण तपशील)</div>
                <NutrientTable nutrition={d.packNutrition} />
              </div>
            )}
            {!isDairy && <Table className="border-t border-black"><TableBody>
              <DataRow label="तुम्ही हाच ब्रँड निवडण्याचे मुख्य कारण काय आहे?" value={d.selectionReason} />
              <DataRow label="हा ब्रँड सुरू करण्यासाठी तुम्हाला कोणाचे मार्गदर्शन मिळाले?" value={d.startMethod} />
              <DataRow label="तुम्हाला सध्याच्या पशुखाद्याची गुणवत्ता कशी वाटते?" value={d.quality} />
            </TableBody></Table>}
          </div>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">५-७. खरेदी, खर्च व पुरवठा माहिती</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "तुमची खरेदी करण्याची पद्धत काय आहे (रोख/उधारी)?" : "एका पोत्याची सध्याची किंमत किती आहे (₹)?"} value={isDairy ? d.purchaseMethod : d.bagPrice} />
              {isDairy && <DataRow label="जर उधारीने असेल, तर किती दिवसांची उधारी मिळते?" value={d.creditDays} />}
              {!isDairy && <DataRow label="एका पोत्याचे एकूण वजन किती किलो आहे?" value={d.bagWeight} />}
              <DataRow label="महिन्याला साधारणपणे किती पोती पशुखाद्य लागते?" value={isDairy ? d.monthlyBags : d.monthlyBags} />
              <DataRow label="पशुखाद्य पुरवठादार माहिती (नाव, मोबाईल व पत्ता)" value={d.suppliers?.map((s: any) => `${s.name}${s.contact ? ` (मोबाईल: ${s.contact})` : ''}${s.address ? `, पत्ता: ${s.address}` : ''}`).join(" | ")} />
              {!isDairy && <DataRow label="तुमचा पशुखाद्य खरेदीचा मुख्य स्त्रोत कोणता आहे?" value={d.purchaseSource} />}
              {!isDairy && <DataRow label="तुम्हाला खरेदीमध्ये उधारीची सुविधा उपलब्ध आहे का?" value={d.hasCredit} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">८-९. गुणवत्ता, समाधान व तुलना</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="पशुखाद्याची कॉलिटी योग्य आहे का?" value={d.pelletQuality} />
              <DataRow label="पोत्यामध्ये धुळीचे (Powder) प्रमाण जास्त असते का?" value={d.dustContent} />
              <DataRow label="खाद्य सुरू केल्यावर जनावरांच्या आरोग्यात किंवा स्फूर्तीत फरक जाणवला का?" value={d.healthObservation} />
              <DataRow label="पशुखाद्यामुळे जनावरांच्या दूध उत्पादनात वाढ झाली का?" value={d.milkIncrease} />
              {!isDairy && <DataRow label="जनावरांच्या आरोग्यात किंवा स्फूर्तीत सुधारणा झाली का?" value={d.healthImprovement} />}
              {!isDairy && <DataRow label="दुधाच्या फॅटमध्ये (Fat) काही फरक जाणवला का?" value={d.fatDiff} />}
              <DataRow label="तुम्ही सध्या वापरत असलेल्या ब्रँडवर पूर्णपणे समाधानी आहात का?" value={isDairy ? d.satisfaction : d.likesFeed} />
              <DataRow label="तुमच्या मते सध्या बाजारात सर्वात चांगला ब्रँड कोणता आहे?" value={isDairy ? d.bestBrand : d.betterBrand} />
              {!isDairy && <DataRow label="तुम्ही यापूर्वी कोणकोणत्या ब्रँडचे पशुखाद्य वापरले आहे?" value={d.previousBrands} />}
              {!isDairy && <DataRow label="भविष्यात ब्रँड बदलण्याचा विचार केला तर मुख्य कारण काय असेल?" value={d.switchReason} />}
              {!isDairy && <DataRow label="तुमचे सध्याच्या ब्रँडसाठी एकंदरीत रेटिंग (1 ते 5)" value={`${d.rating}/5`} />}
              {!isDairy && <DataRow label="पशुखाद्य तुमच्या गावात सहजरीत्या उपलब्ध होते का?" value={d.easyAvailability} />}
              {!isDairy && <DataRow label="कंपनीचे प्रतिनिधी तुम्हाला नियमितपणे भेट देतात का?" value={d.repVisit} />}
            </TableBody>
          </Table>
        </section>

        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 bg-slate-100 px-2 uppercase">१०-११. समस्या, सूचना व अ‍ॅड पॉइंट्स</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="पशुखाद्याबाबत तुमच्या मुख्य तक्रारी / समस्या कोणत्या आहेत?" value={isDairy ? d.mainProblem : d.problems} />
              <DataRow label="इतर काही विशेष तक्रार असल्यास येथे नमूद करा" value={d.otherProblem} />
              <DataRow label="तुमच्या मते पशुखाद्यात काही सुधारणा सुचवू इच्छिता का?" value={d.improvements} />
              <DataRow label="तुमच्या मते एका आदर्श पशुखाद्यात कोणते गुण असावेत?" value={isDairy ? d.goodFeedOpinion : d.idealFeedQualities} />
              {!isDairy && <DataRow label="तुम्हाला स्वस्त दरात चांगला ब्रँड मिळाल्यास तुम्ही बदलणार का?" value={d.switchIfCheaper} />}
              <DataRow label="नवीन ब्रँडचे नमुना ट्रायल (Sample) घेऊन पाहायला आवडेल का?" value={d.sampleTrial} />
              {d.customPoints?.length > 0 && <DataRow label="इतर महत्त्वाचे मुद्दे (अ‍ॅड पॉइंट्स)" value={d.customPoints.map((p: any) => p.point).join(", ")} />}
            </TableBody>
          </Table>
        </section>
      </div>
    );
  };

  const renderSurveyCard = (s: SurveyRecord) => (
    <Card key={s.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden mb-3">
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex gap-3 items-center">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {s.type === 'dairy' ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base text-primary truncate">{s.data.dairyName || s.data.farmerName}</h3>
            <div className="flex gap-3 text-[11px] text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.data.village}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(s.timestamp).toLocaleDateString('mr-IN')}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${s.type === 'dairy' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.type === 'dairy' ? 'डेअरी' : 'शेतकरी'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 border-primary text-primary" onClick={() => { setSelectedSurvey(s); setIsDialogOpen(true); }}><Eye className="h-3.5 w-3.5" /> पहा</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 border-primary text-primary" onClick={() => handleEdit(s)}><Edit2 className="h-3.5 w-3.5" /> अपडेट</Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-destructive border-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5" /> हटवा</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-primary">माझी सर्वेक्षणे</h1>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="नाव किंवा गाव शोधा..." 
              className="pl-8 h-10 w-full" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-primary/5">
            <TabsTrigger value="all">सर्व सर्वेक्षणे</TabsTrigger>
            <TabsTrigger value="dairy">डेअरी</TabsTrigger>
            <TabsTrigger value="farmer">शेतकरी</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-1">
            {surveys.filter(s => (s.data.dairyName || s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              surveys.filter(s => (s.data.dairyName || s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase())).map(renderSurveyCard)
            ) : <div className="text-center py-20 text-muted-foreground italic">कोणतीही माहिती उपलब्ध नाही.</div>}
          </TabsContent>
          
          <TabsContent value="dairy" className="space-y-1">
            {surveys.filter(s => s.type === 'dairy' && ((s.data.dairyName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase()))).length > 0 ? (
              surveys.filter(s => s.type === 'dairy' && ((s.data.dairyName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase()))).map(renderSurveyCard)
            ) : <div className="text-center py-20 text-muted-foreground italic">डेअरी सर्वेक्षण उपलब्ध नाही.</div>}
          </TabsContent>
          
          <TabsContent value="farmer" className="space-y-1">
            {surveys.filter(s => s.type === 'farmer' && ((s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase()))).length > 0 ? (
              surveys.filter(s => s.type === 'farmer' && ((s.data.farmerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (s.data.village || "").toLowerCase().includes(searchTerm.toLowerCase()))).map(renderSurveyCard)
            ) : <div className="text-center py-20 text-muted-foreground italic">शेतकरी सर्वेक्षण उपलब्ध नाही.</div>}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[210mm] max-h-[95vh] overflow-y-auto p-0 border-2 dialog-content-print shadow-none">
            <div className="sticky top-0 z-50 p-3 bg-slate-50 border-b flex justify-between items-center no-print">
              <DialogTitle className="text-primary font-bold">अहवाल पूर्वावलोकन (A4 PDF Preview)</DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="bg-primary hover:bg-primary/90 shadow-md">
                <Printer className="h-4 w-4 mr-2" /> प्रिंट अहवाल / PDF
              </Button>
            </div>
            <div className="p-4 md:p-8 bg-white report-container-print">
              {selectedSurvey && renderDetailedReport(selectedSurvey)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
