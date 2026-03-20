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
    'VeryGood': 'खूप चांगले',
    'Okay': 'ठीक आहे',
    'NotSatisfied': 'समाधानी नाही',
  };

  const translate = (val: any) => {
    if (Array.isArray(val)) return val.map(v => translations[v] || v).join(", ");
    if (val === undefined || val === null || val === "") return "-";
    return translations[val] || val;
  };

  const DataRow = ({ label, value, labelWidth = "60%" }: { label: string, value: any, labelWidth?: string }) => (
    <TableRow className="hover:bg-transparent border-b border-black">
      <TableHead className="font-black bg-slate-50 py-1 px-2 text-[8.5pt] h-auto border-r border-black leading-tight text-black" style={{ width: labelWidth }}>
        {label}
      </TableHead>
      <TableCell className="py-1 px-2 text-[9pt] h-auto leading-tight text-black font-black">
        {translate(value)}
      </TableCell>
    </TableRow>
  );

  const NutrientRow = ({ desc, data }: { desc: string, data: any }) => {
    const limit = data?.limit || (desc.toLowerCase().includes('fiber') || desc.toLowerCase().includes('ash') || desc.toLowerCase().includes('aflatoxin') || desc.toLowerCase().includes('urea') || desc.toLowerCase().includes('moisture') ? 'Max' : 'Min');
    const val = typeof data === 'object' ? data?.value : data;
    
    return (
      <TableRow className="border-b border-black">
        <TableCell className="py-1 px-2 text-[8.5pt] font-black border-r border-black" style={{ width: '40%' }}>{desc}</TableCell>
        <TableCell className="py-1 px-2 text-[8.5pt] font-black border-r border-black text-center" style={{ width: '20%' }}>{limit}</TableCell>
        <TableCell className="py-1 px-2 text-[8.5pt] font-black border-r border-black text-center" style={{ width: '20%' }}>{desc.toLowerCase().includes('aflatoxin') ? 'ppb' : '%'}</TableCell>
        <TableCell className="py-1 px-2 text-[8.5pt] font-black text-center" style={{ width: '20%' }}>{val || '-'}</TableCell>
      </TableRow>
    );
  };

  const renderDetailedReport = (survey: SurveyRecord) => {
    const d = survey.data;
    const isDairy = survey.type === 'dairy';

    return (
      <div className="space-y-1 py-1 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-1 mb-1">
          <h2 className="text-[10pt] font-black uppercase text-black leading-tight">
            {isDairy ? "पशुखाद्य सर्वेक्षण अहवाल: दूध संकलन केंद्र / डेअरी" : "पशुखाद्य सर्वेक्षण अहवाल: शेतकरी ब्रँड सर्वेक्षण"}
          </h2>
          <div className="flex justify-between text-[8pt] font-black px-1 text-black">
            <span>सर्वेक्षक: {d.surveyorName || survey.surveyorName}</span>
            <span>तारीख: {d.surveyDate || new Date(survey.timestamp).toLocaleDateString('mr-IN')}</span>
          </div>
        </div>

        {/* १. सामान्य माहिती */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">१. सामान्य व लोकेशन माहिती</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "डेअरीचे नाव" : "शेतकऱ्याचे नाव"} value={isDairy ? d.dairyName : d.farmerName} />
              <DataRow label={isDairy ? "मालकाचे नाव" : "मोबाईल नंबर"} value={isDairy ? d.ownerName : d.mobile} />
              <DataRow label="गाव / तालुका / जिल्हा" value={`${d.village}, ${d.taluka}, ${d.district}`} />
              <DataRow label="जीपीएस लोकेशन" value={d.location} />
              {isDairy && <DataRow label="दूध संकलन / शेतकरी संख्या" value={`${d.milkCollection} लिटर / ${d.farmerCount} शेतकरी`} />}
            </TableBody>
          </Table>
        </section>

        {/* २. पशुधन माहिती */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">२. पशुधन माहिती</h4>
          <div className="border border-black border-t-0">
            <div className="grid grid-cols-4 border-b border-black">
              <div className="p-1 border-r border-black bg-slate-50 flex flex-col items-center">
                <span className="text-[7pt] text-black">एकूण जनावरे</span>
                <span className="font-black text-[9pt] text-black">{isDairy ? d.livestock?.totalAnimals : (parseInt(d.animalCount?.cows || '0') + parseInt(d.animalCount?.buffaloes || '0') + parseInt(d.animalCount?.calves || '0'))}</span>
              </div>
              <div className="p-1 border-r border-black bg-slate-50 flex flex-col items-center">
                <span className="text-[7pt] text-black">गायी</span>
                <span className="font-black text-[9pt] text-black">{isDairy ? d.livestock?.cows : d.animalCount?.cows}</span>
              </div>
              <div className="p-1 border-r border-black bg-slate-50 flex flex-col items-center">
                <span className="text-[7pt] text-black">म्हशी</span>
                <span className="font-black text-[9pt] text-black">{isDairy ? d.livestock?.buffaloes : d.animalCount?.buffaloes}</span>
              </div>
              <div className="p-1 bg-slate-50 flex flex-col items-center">
                <span className="text-[7pt] text-black">वासरे</span>
                <span className="font-black text-[9pt] text-black">{isDairy ? d.livestock?.calves : d.animalCount?.calves}</span>
              </div>
            </div>
            <Table className="table-fixed">
              <TableBody>
                <DataRow label="दूध देणारी जनावरे / सरासरी दूध" value={`${isDairy ? d.livestock?.milkingAnimals : d.livestock?.milkingAnimals || '-'} / ${isDairy ? d.livestock?.avgMilkPerAnimal : d.livestock?.avgMilkPerAnimal || '-'} लिटर`} />
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ३. पशुखाद्य वापर */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">३. पशुखाद्य वापर माहिती</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "खाद्य प्रकार" : "सध्याचा ब्रँड"} value={isDairy ? d.feedType : d.currentBrand} />
              <DataRow label="खाद्य वारंवारता / प्रति जनावर किलो" value={`${isDairy ? d.feedFrequency : d.frequency} वेळा / ${isDairy ? d.dailyFeedPerAnimal : d.dailyQtyPerAnimal} किलो`} />
              <DataRow label="पूरक खाद्य" value={isDairy ? d.supplements : d.otherFeeds} />
            </TableBody>
          </Table>
        </section>

        {/* ४-८. ब्रँड व पोषण विश्लेषण */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">
            {isDairy ? "४. ब्रँड व पोषण माहिती" : "४-८. ब्रँड गुणवत्ता व पोषण विश्लेषण"}
          </h4>
          <div className="border border-black border-t-0">
            {isDairy ? (
              d.brandsInfo?.length > 0 ? d.brandsInfo.map((b: any, i: number) => (
                <div key={i} className="border-b last:border-0 border-black">
                  <div className="bg-slate-50 p-1 font-black text-center text-[8.5pt] border-b border-black">{b.name} (₹{b.price})</div>
                  <Table className="table-fixed">
                    <TableBody>
                      <NutrientRow desc="Crude protein" data={b.protein} />
                      <NutrientRow desc="Crude fat" data={b.fat} />
                      <NutrientRow desc="Crude fiber" data={b.fiber} />
                      <NutrientRow desc="Calcium / Phos" data={`${b.calcium?.value || '-'} / ${b.totalPhosphorus?.value || '-'}`} />
                    </TableBody>
                  </Table>
                </div>
              )) : <div className="p-1 text-center text-[8pt]">माहिती नाही</div>
            ) : (
              <Table className="table-fixed">
                <TableBody>
                  <DataRow label="निवड कारण / गुणवत्ता" value={`${translate(d.selectionReason)} / ${translate(d.quality)}`} />
                  <DataRow label="दूध वाढ / आरोग्य सुधार" value={`${translate(d.milkIncrease)} / ${translate(d.healthImprovement)}`} />
                  <NutrientRow desc="Crude protein" data={d.packNutrition?.protein} />
                  <NutrientRow desc="Crude fat" data={d.packNutrition?.fat} />
                  <NutrientRow desc="Crude fiber" data={d.packNutrition?.fiber} />
                  <NutrientRow desc="Calcium" data={d.packNutrition?.calcium} />
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        {/* ५-७. खरेदी व खर्च */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">५-७. खरेदी, खर्च व सेवा</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "खरेदी पद्धत / उधारी" : "किंमत / मासिक पोती"} value={isDairy ? `${translate(d.purchaseMethod)} (${d.creditDays} दिवस)` : `₹${d.bagPrice} / ${d.monthlyBags} पोती`} />
              <DataRow label="पुरवठादार" value={d.suppliers?.map((s: any) => s.name).filter(Boolean).join(", ")} />
              <DataRow label={isDairy ? "मासिक खर्च / पोती" : "उपलब्धता / प्रतिनिधी भेट"} value={isDairy ? `₹${d.monthlyExp} / ${d.monthlyBags} पोती` : `${translate(d.easyAvailability)} / ${translate(d.repVisit)}`} />
            </TableBody>
          </Table>
        </section>

        {/* ८-९. गुणवत्ता व रेटिंग */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">८-९. समाधान व रेटिंग</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label={isDairy ? "समाधान / सर्वोत्तम ब्रँड" : "तुलनात्मक ब्रँड / रेटिंग"} value={isDairy ? `${translate(d.satisfaction)} / ${d.bestBrand}` : `${d.betterBrand} / (${d.rating}/5)`} />
              {isDairy && <DataRow label="गोदाम क्षमता / उपलब्धता" value={`${d.warehouseCapacity} MT / ${translate(d.hasStorage)}`} />}
            </TableBody>
          </Table>
        </section>

        {/* १०-११. समस्या व अ‍ॅड पॉइंट्स */}
        <section className="break-inside-avoid">
          <h4 className="text-[9pt] font-black mb-0 border-b-2 border-black pb-0.5 uppercase bg-slate-100 px-2 text-black">१०-११. समस्या, सूचना व अ‍ॅड पॉइंट्स</h4>
          <Table className="border border-black table-fixed">
            <TableBody>
              <DataRow label="मुख्य समस्या" value={isDairy ? d.mainProblem : d.problems} />
              <DataRow label="आदर्श पशुखाद्य मत" value={isDairy ? d.goodFeedOpinion : d.idealFeedQualities} />
              {d.customPoints?.length > 0 && <DataRow label="इतर अ‍ॅड पॉइंट्स" value={d.customPoints.map((p: any) => p.point).join(", ")} />}
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
            <p className="text-muted-foreground text-xs">सर्वेक्षण अहवाल व्यवस्थापित करा.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="नाव, गाव..." 
              className="pl-9 h-9 text-sm bg-white border-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <Tabs defaultValue="all" className="w-full no-print">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-10 bg-primary/5 p-1 border border-primary/10">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">सर्व</TabsTrigger>
            <TabsTrigger value="dairy" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">डेअरी</TabsTrigger>
            <TabsTrigger value="farmer" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-white">शेतकरी</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-0">
            {filterSurveys().length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed shadow-sm">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-10" />
                <p className="text-muted-foreground text-sm font-medium">कोणतेही सर्वेक्षण उपलब्ध नाही.</p>
              </div>
            ) : filterSurveys().map(s => (
              <Card key={s.id} className="bg-white hover:shadow-md transition-all border-primary/10 overflow-hidden group">
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {s.type === 'dairy' ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight text-primary">
                        {s.data.dairyName || s.data.farmerName}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {s.data.village}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(s.timestamp).toLocaleDateString('mr-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button variant="outline" size="sm" className="h-8 px-2 gap-1 border-primary text-primary text-xs" onClick={() => { setSelectedSurvey(s); setIsDialogOpen(true); }}>
                      <Eye className="h-3.5 w-3.5" /> पहा
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 gap-1 border-primary text-primary text-xs" onClick={() => handleEdit(s)}>
                      <Edit2 className="h-3.5 w-3.5" /> अपडेट
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 gap-1 text-destructive border-destructive text-xs" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> हटवा
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="dairy">
            {/* Similar structure for dairy tab */}
            {filterSurveys('dairy').map(s => (
              <Card key={s.id} className="bg-white border-primary/10 mb-2">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="font-bold text-primary">{s.data.dairyName} ({s.data.village})</div>
                  <Button size="sm" onClick={() => { setSelectedSurvey(s); setIsDialogOpen(true); }}>पहा</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="farmer">
             {/* Similar structure for farmer tab */}
             {filterSurveys('farmer').map(s => (
              <Card key={s.id} className="bg-white border-primary/10 mb-2">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="font-bold text-primary">{s.data.farmerName} ({s.data.village})</div>
                  <Button size="sm" onClick={() => { setSelectedSurvey(s); setIsDialogOpen(true); }}>पहा</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[98vw] md:max-w-[210mm] max-h-[95vh] overflow-y-auto p-0 border-2 dialog-content-print shadow-none">
            <DialogHeader className="p-3 border-b bg-muted/30 no-print sticky top-0 z-50">
              <div className="flex items-center justify-between w-full">
                <DialogTitle className="text-lg font-bold text-primary truncate">अहवाल पूर्वावलोकन</DialogTitle>
                <Button variant="default" size="sm" onClick={() => window.print()} className="bg-primary text-white h-8">
                  <Printer className="h-3.5 w-3.5 mr-1" /> प्रिंट / PDF
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