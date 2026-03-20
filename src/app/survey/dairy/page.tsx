"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { LocationSelector } from "@/components/forms/LocationSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSurveyStore } from "@/lib/survey-store";
import { useBrandStore, MasterBrand } from "@/lib/brand-store";
import { useSupplierStore, Supplier } from "@/lib/supplier-store";
import { Save, Printer, ArrowLeft, Trash2, MapPin, Loader2, PlusCircle, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const dairySchema = z.object({
  dairyName: z.string().min(1, "नाव आवश्यक आहे"),
  ownerName: z.string().min(1, "मालकाचे नाव आवश्यक आहे"),
  contact: z.string().min(10, "संपर्क क्रमांक किमान १० अंकी असावा"),
  district: z.string().min(1, "जिल्हा निवडा"),
  taluka: z.string().min(1, "तालुका निवडा"),
  village: z.string().min(1, "गावाचे नाव आवश्यक आहे"),
  address: z.string().optional(),
  milkCollection: z.string().optional(),
  farmerCount: z.string().optional(),
  location: z.string().optional(),
  livestock: z.object({
    totalAnimals: z.string().default("0"),
    cows: z.string().default("0"),
    buffaloes: z.string().default("0"),
    calves: z.string().default("0"),
    milkingAnimals: z.string().default("0"),
    avgMilkPerAnimal: z.string().default("0"),
  }),
  feedType: z.enum(["ReadyMade", "HomeMade", "Both"]).optional(),
  feedFrequency: z.string().optional(),
  dailyFeedPerAnimal: z.string().optional(),
  supplements: z.array(z.string()).default([]),
  otherSupplement: z.string().optional(),
  brandsInfo: z.array(z.object({
    name: z.string(),
    feedType: z.string(),
    bagWeight: z.string(),
    price: z.string(),
    protein: z.any().optional(),
    fat: z.any().optional(),
    fiber: z.any().optional(),
    ash: z.any().optional(),
    calcium: z.any().optional(),
    totalPhosphorus: z.any().optional(),
    availablePhosphorus: z.any().optional(),
    aflatoxin: z.any().optional(),
    urea: z.any().optional(),
    moisture: z.any().optional(),
    others: z.string().optional(),
  })).default([]),
  purchaseMethod: z.string().optional(),
  creditDays: z.string().optional(),
  suppliers: z.array(z.object({
    source: z.string().optional(),
    name: z.string(),
    contact: z.string().optional(),
    address: z.string().optional(),
  })).default([{ source: "", name: "" }]),
  timelySupply: z.enum(["Yes", "No"]).optional(),
  monthlyExp: z.string().optional(),
  monthlyBags: z.string().optional(),
  satisfaction: z.string().optional(),
  milkIncrease: z.string().optional(),
  bestBrand: z.string().optional(),
  pelletQuality: z.string().optional(),
  dustContent: z.string().optional(),
  healthObservation: z.string().optional(),
  warehouseCapacity: z.string().optional(),
  hasStorage: z.string().optional(),
  mainProblem: z.array(z.string()).default([]),
  otherProblem: z.string().optional(),
  sampleTrial: z.string().optional(),
  goodFeedOpinion: z.string().optional(),
  customPoints: z.array(z.object({
    point: z.string(),
  })).default([]),
  surveyorName: z.string().min(1, "सर्वेक्षकाचे नाव आवश्यक आहे"),
  surveyorId: z.string().min(1, "आयडी आवश्यक आहे"),
  surveyDate: z.string().optional(),
});

type DairyFormValues = z.infer<typeof dairySchema>;

function DairySurveyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('id');
  const { addSurvey, updateSurvey, getSurveyById } = useSurveyStore();
  const { getBrands } = useBrandStore();
  const { getSuppliers } = useSupplierStore();
  const [masterBrands, setMasterBrands] = useState<MasterBrand[]>([]);
  const [masterSuppliers, setMasterSuppliers] = useState<Supplier[]>([]);
  const [locating, setLocating] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  
  const form = useForm<DairyFormValues>({
    resolver: zodResolver(dairySchema),
    defaultValues: {
      livestock: { totalAnimals: "0", cows: "0", buffaloes: "0", calves: "0", milkingAnimals: "0", avgMilkPerAnimal: "0" },
      supplements: [],
      district: "",
      taluka: "",
      brandsInfo: [],
      suppliers: [{ source: "", name: "", contact: "", address: "" }],
      customPoints: [],
      mainProblem: [],
      surveyDate: new Date().toISOString().split('T')[0],
      location: "",
      surveyorName: "",
      surveyorId: "",
    }
  });

  const { fields: brandFields, append: appendBrand, remove: removeBrand, replace: replaceBrands } = useFieldArray({
    control: form.control,
    name: "brandsInfo",
  });

  const { fields: supplierFields, append: appendSupplier, remove: removeSupplier } = useFieldArray({
    control: form.control,
    name: "suppliers",
  });

  const { fields: pointFields, append: appendPoint, remove: removePoint, replace: replacePoints } = useFieldArray({
    control: form.control,
    name: "customPoints",
  });

  useEffect(() => {
    setMasterBrands(getBrands());
    setMasterSuppliers(getSuppliers());

    const savedName = localStorage.getItem('last_surveyor_name') || "";
    const savedId = localStorage.getItem('last_surveyor_id') || "";
    
    if (surveyId) {
      const existing = getSurveyById(surveyId);
      if (existing && existing.type === 'dairy') {
        form.reset(existing.data);
        if (existing.data.brandsInfo) replaceBrands(existing.data.brandsInfo);
        if (existing.data.customPoints) replacePoints(existing.data.customPoints);
      }
    } else {
      form.setValue("surveyorName", savedName);
      form.setValue("surveyorId", savedId);
    }
  }, [surveyId]);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "त्रुटी", description: "जीपीएस सपोर्ट नाही." });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        form.setValue("location", coords);
        setLocating(false);
      },
      () => {
        toast({ variant: "destructive", title: "त्रुटी", description: "लोकेशन मिळवण्यात अडचण आली." });
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleAddSelectedBrands = () => {
    selectedBrandIds.forEach(id => {
      const selected = masterBrands.find(b => b.id === id);
      if (selected) {
        const isAlreadyAdded = brandFields.some(f => f.name === selected.name);
        if (!isAlreadyAdded) {
          appendBrand({
            name: selected.name,
            feedType: selected.feedType,
            bagWeight: selected.bagWeight,
            price: selected.price,
            protein: selected.nutrition.protein,
            fat: selected.nutrition.fat,
            fiber: selected.nutrition.fiber,
            ash: selected.nutrition.ash,
            calcium: selected.nutrition.calcium,
            totalPhosphorus: selected.nutrition.totalPhosphorus,
            availablePhosphorus: selected.nutrition.availablePhosphorus,
            aflatoxin: selected.nutrition.aflatoxin,
            urea: selected.nutrition.urea,
            moisture: selected.nutrition.moisture,
            others: selected.nutrition.others,
          });
        }
      }
    });
    setSelectedBrandIds([]);
  };

  const handleMasterSupplierSelect = (index: number, supplierId: string) => {
    const selected = masterSuppliers.find(s => s.id === supplierId);
    if (selected) {
      form.setValue(`suppliers.${index}.name`, selected.shopName);
      form.setValue(`suppliers.${index}.contact`, selected.contact);
      form.setValue(`suppliers.${index}.address`, `${selected.address}, ${selected.taluka}, ${selected.district}`);
    }
  };

  const onSubmit = async (data: DairyFormValues) => {
    try {
      localStorage.setItem('last_surveyor_name', data.surveyorName);
      localStorage.setItem('last_surveyor_id', data.surveyorId);
      if (surveyId) {
        updateSurvey(surveyId, { type: "dairy", surveyorName: data.surveyorName, surveyorId: data.surveyorId, data });
      } else {
        addSurvey({ type: "dairy", surveyorName: data.surveyorName, surveyorId: data.surveyorId, data });
      }
      toast({ title: "यशस्वी", description: "डेअरी सर्वेक्षण रिपोर्ट जतन झाला आहे." });
      router.push("/surveys");
    } catch (e) {
      toast({ variant: "destructive", title: "त्रुटी", description: "माहिती जतन करताना अडचण आली." });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const supplementOptions = [
    { label: "सुका चारा", value: "DryFodder" },
    { label: "हिरवा चारा", value: "GreenFodder" },
    { label: "खळ (पेंड)", value: "Khala" },
    { label: "मका", value: "Maize" },
    { label: "खनिज मिश्रण", value: "MineralMix" },
  ];

  const complaintOptions = [
    { label: "दूध उत्पादन वाढ नाही", value: "NoMilkIncrease" },
    { label: "दुधाचे फॅट कमी लागते", value: "LowFat" },
    { label: "जनावर पशुखाद्य खात नाही", value: "AnimalDoesntLike" },
    { label: "पशुखाद्याची किंमत जास्त आहे", value: "HighPrice" },
    { label: "पशुखाद्याचा पुरवठा उशिरा होतो", value: "LateSupply" },
    { label: "पशुखाद्यात भेसळ वाटते", value: "Adulteration" },
    { label: "जनावरांना पचनाचे त्रास होतात", value: "DigestionIssues" },
  ];

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-[95%]">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9"><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">गवळी संकलन केंद्र (डेअरी) सर्वेक्षण फॉर्म</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> लोकेशन टॅगिंग (GPS Location)</h3>
            <p className="text-xs text-muted-foreground mb-3 font-bold">सर्वेक्षणाचे अचूक लोकेशन मिळवण्यासाठी खालील बटण दाबा.</p>
            <Button type="button" onClick={handleGetLocation} disabled={locating} className="bg-primary h-10">{locating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />}लोकेशन मिळवा</Button>
            {form.watch("location") && <div className="mt-2 text-xs font-bold text-green-700 bg-green-50 p-2 rounded border border-green-200">नोंदवलेले लोकेशन: {form.watch("location")}</div>}
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. सामान्य व संकलन माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्या दूध संकलन केंद्राचे (डेअरी) नाव काय आहे?</Label><Input {...form.register("dairyName")} placeholder="डेअरीचे नाव" className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">डेअरी मालकाचे पूर्ण नाव काय आहे?</Label><Input {...form.register("ownerName")} placeholder="मालकाचे नाव" className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुमचा मोबाईल नंबर किंवा संपर्क क्रमांक काय आहे?</Label><Input {...form.register("contact")} placeholder="मोबाईल नंबर" maxLength={10} className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्या गावाचे नाव काय आहे?</Label><Input {...form.register("village")} placeholder="गावाचे नाव" className="h-10 border-primary/20" /></div>
            </div>
            <div className="mt-4">
              <Label className="text-sm font-bold block mb-2 text-primary">तुमचा जिल्हा व तालुका निवडा:</Label>
              <LocationSelector 
                onLocationChange={(d, t) => { 
                  form.setValue("district", d); 
                  form.setValue("taluka", t); 
                }} 
                defaultDistrict={form.getValues("district")} 
                defaultTaluka={form.getValues("taluka")} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1"><Label className="text-xs font-bold">दिवसाचे एकूण दूध संकलन किती लिटर होते?</Label><Input {...form.register("milkCollection")} placeholder="लिटर/दिवस" className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्या केंद्राशी एकूण किती शेतकरी जोडले आहेत?</Label><Input {...form.register("farmerCount")} placeholder="शेतकरी संख्या" className="h-10 border-primary/20" /></div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">२. पशुधन माहिती (Livestock Data)</h3>
            <p className="text-xs text-muted-foreground mb-3 font-bold">तुमच्या केंद्राशी जोडलेल्या शेतकऱ्यांकडे सध्या उपलब्ध असलेल्या जनावरांची एकूण संख्या लिहा:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1"><Label className="text-xs font-bold">एकूण जनावरांची संख्या किती आहे?</Label><Input {...form.register("livestock.totalAnimals")} className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">गायींची संख्या किती आहे?</Label><Input {...form.register("livestock.cows")} className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">म्हशींची संख्या किती आहे?</Label><Input {...form.register("livestock.buffaloes")} className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">वासरांची संख्या किती आहे?</Label><Input {...form.register("livestock.calves")} className="h-10 border-primary/20" /></div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३. पशुखाद्य वापर व पद्धत</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">तुमच्या दूध संकलन केंद्रात तुम्ही कोणत्या प्रकारचे पशुखाद्य वापरता?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("feedType", v as any)} value={form.watch("feedType")} className="flex gap-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="ReadyMade" id="rd1" /><Label htmlFor="rd1" className="font-bold">रेडीमेड (Ready Made)</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="HomeMade" id="rd2" /><Label htmlFor="rd2" className="font-bold">घरगुती मिश्रण (Home Made)</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Both" id="rd3" /><Label htmlFor="rd3" className="font-bold">दोन्ही प्रकारचे</Label></div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs font-bold">दिवसातून किती वेळा पशुखाद्य देता?</Label><Input {...form.register("feedFrequency")} placeholder="उदा. २ वेळा" className="h-10 border-primary/20" /></div>
                <div className="space-y-1"><Label className="text-xs font-bold">प्रत्येक जनावराला दररोज किती किलो पशुखाद्य देता?</Label><Input {...form.register("dailyFeedPerAnimal")} placeholder="उदा. ४ किलो" className="h-10 border-primary/20" /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">वापरत असलेले इतर पूरक खाद्य (Additives) कोणते आहेत?</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {supplementOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox id={`dsupp-${opt.value}`} checked={form.watch("supplements").includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("supplements") || [];
                        form.setValue("supplements", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`dsupp-${opt.value}`} className="text-xs font-bold">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section overflow-x-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">४. वापरत असलेल्या ब्रँडची व पोषणाची माहिती</h3>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild><Button type="button" variant="outline" size="sm" className="bg-primary/5 border-primary text-primary h-9"><PlusCircle className="mr-2 h-4 w-4" />मास्टर ब्रँड निवडा</Button></PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2">
                    <p className="text-[10px] font-bold text-primary uppercase mb-2">खालीलपैकी ब्रँड निवडा:</p>
                    <div className="space-y-1 max-h-[250px] overflow-y-auto">
                      {masterBrands.map(b => (
                        <div key={b.id} className="flex items-center gap-2 p-1.5 hover:bg-muted cursor-pointer rounded border border-transparent hover:border-primary/20" onClick={() => { setSelectedBrandIds(prev => prev.includes(b.id) ? prev.filter(i => i !== b.id) : [...prev, b.id]); }}>
                          <Checkbox checked={selectedBrandIds.includes(b.id)} /><span className="text-xs font-medium">{b.name}</span>
                        </div>
                      ))}
                      {masterBrands.length === 0 && <p className="text-[10px] text-muted-foreground p-2">अद्याप कोणताही मास्टर ब्रँड उपलब्ध नाही.</p>}
                      <Button className="w-full mt-2 h-9 text-xs bg-primary" onClick={handleAddSelectedBrands}>निवडलेले ब्रँड्स जोडा</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Table className="min-w-[1000px] border border-black">
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-black">
                  <TableHead className="font-bold text-black border-r border-black">ब्रँडचे नाव</TableHead>
                  <TableHead className="font-bold text-black border-r border-black">किंमत (₹)</TableHead>
                  <TableHead className="font-bold text-black border-r border-black">प्रोटीन (%)</TableHead>
                  <TableHead className="font-bold text-black border-r border-black">फॅट (%)</TableHead>
                  <TableHead className="font-bold text-black border-r border-black">फायबर (%)</TableHead>
                  <TableHead className="font-bold text-black border-r border-black">Ash (%)</TableHead>
                  <TableHead className="w-20 font-bold text-black">कृती</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandFields.map((f, i) => (
                  <TableRow key={f.id} className="hover:bg-muted/20 border-b border-black">
                    <TableCell className="border-r border-black"><Input {...form.register(`brandsInfo.${i}.name`)} className="h-9 text-xs border-primary/10" /></TableCell>
                    <TableCell className="border-r border-black"><Input {...form.register(`brandsInfo.${i}.price`)} className="h-9 text-xs w-20 border-primary/10" /></TableCell>
                    <TableCell className="border-r border-black"><Input {...form.register(`brandsInfo.${i}.protein.value` as any)} className="h-9 text-xs w-14 border-primary/10" /></TableCell>
                    <TableCell className="border-r border-black"><Input {...form.register(`brandsInfo.${i}.fat.value` as any)} className="h-9 text-xs w-14 border-primary/10" /></TableCell>
                    <TableCell className="border-r border-black"><Input {...form.register(`brandsInfo.${i}.fiber.value` as any)} className="h-9 text-xs w-14 border-primary/10" /></TableCell>
                    <TableCell className="border-r border-black"><Input {...form.register(`brandsInfo.${i}.ash.value` as any)} className="h-9 text-xs w-14 border-primary/10" /></TableCell>
                    <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeBrand(i)} className="text-destructive h-9 w-9 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
                {brandFields.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic text-xs">अद्याप कोणताही ब्रँड जोडलेला नाही. मास्टर लिस्टमधून निवडा किंवा नवीन जोडा.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">५-६. खरेदी पद्धत व पुरवठादार माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="font-bold text-sm block border-b pb-1">५. तुमची खरेदी करण्याची पद्धत काय आहे?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("purchaseMethod", v)} value={form.watch("purchaseMethod")} className="flex gap-6 py-2">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Cash" id="pm1" /><Label htmlFor="pm1" className="text-sm font-bold">रोखीने (Cash)</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Credit" id="pm2" /><Label htmlFor="pm2" className="text-sm font-bold">उधारीने (Credit)</Label></div>
                </RadioGroup>
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded border">
                  <Label className="text-xs font-bold text-primary">जर उधारीने असेल, तर साधारण किती दिवसांची उधारी मिळते?</Label>
                  <Input {...form.register("creditDays")} className="h-9 w-24 bg-white border-primary/20" placeholder="दिवस" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-1">
                  <Label className="font-bold text-sm">६. तुमचे पशुखाद्य पुरवठादार (Suppliers) कोण आहेत?</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ source: "", name: "" })} className="h-8 text-[10px]"><Plus className="h-3 w-3 mr-1" />नवीन जोडा</Button>
                </div>
                <div className="space-y-3">
                  {supplierFields.map((f, i) => (
                    <div key={f.id} className="p-3 border rounded-lg relative space-y-3 bg-white shadow-sm border-primary/10">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => removeSupplier(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-primary uppercase tracking-wider">मास्टर लिस्टमधून निवडा:</Label>
                        <Select onValueChange={(v) => handleMasterSupplierSelect(i, v)}>
                          <SelectTrigger className="h-9 text-xs border-primary/20"><SelectValue placeholder="पुरवठादार निवडा" /></SelectTrigger>
                          <SelectContent>{masterSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.shopName} ({s.name})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><Label className="text-[10px] font-bold">पुरवठादाराचे नाव काय आहे?</Label><Input {...form.register(`suppliers.${i}.name`)} placeholder="नाव" className="h-9 text-xs border-primary/10" /></div>
                        <div className="space-y-1"><Label className="text-[10px] font-bold">त्यांचा मोबाईल नंबर काय आहे?</Label><Input {...form.register(`suppliers.${i}.contact`)} placeholder="संपर्क" className="h-9 text-xs border-primary/10" /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-[10px] font-bold">पुरवठादाराचा पूर्ण पत्ता काय आहे?</Label><Input {...form.register(`suppliers.${i}.address`)} placeholder="पत्ता" className="h-9 text-xs border-primary/10" /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७-८-९-१०. समाधान, गुणवत्ता व तक्रारी</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1"><Label className="text-xs font-bold">पशुखाद्यावर होणारा तुमचा एकूण मासिक खर्च किती आहे (₹)?</Label><Input {...form.register("monthlyExp")} placeholder="₹ दर महा" className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">महिन्याला साधारणपणे किती पोती पशुखाद्य लागते?</Label><Input {...form.register("monthlyBags")} placeholder="पोती संख्या" className="h-10 border-primary/20" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्या मते सध्या बाजारातील सर्वोत्तम ब्रँड कोणता आहे?</Label><Input {...form.register("bestBrand")} placeholder="ब्रँडचे नाव" className="h-10 border-primary/20" /></div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">पशुखाद्याची गुणवत्ता (कॉलिटी) तुम्हाला योग्य वाटते का?</Label>
                <Select onValueChange={(v) => form.setValue("pelletQuality", v)} value={form.watch("pelletQuality")}>
                  <SelectTrigger className="h-10 border-primary/20"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="होय">होय, उत्तम आहे</SelectItem><SelectItem value="नाही">नाही, समाधानकारक नाही</SelectItem><SelectItem value="मध्यम">मध्यम स्वरूपाची आहे</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">पशुखाद्याच्या पोत्यामध्ये धुळीचे (Powder) प्रमाण जास्त असते का?</Label>
                <Select onValueChange={(v) => form.setValue("dustContent", v)} value={form.watch("dustContent")}>
                  <SelectTrigger className="h-10 border-primary/20"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="होय">होय, जास्त असते</SelectItem><SelectItem value="नाही">नाही, कमी असते</SelectItem><SelectItem value="कधीकधी">कधीकधी असते</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">हे खाद्य सुरू केल्यावर जनावरांच्या आरोग्यात किंवा स्फूर्तीत काही फरक जाणवला का?</Label>
                <Select onValueChange={(v) => form.setValue("healthObservation", v)} value={form.watch("healthObservation")}>
                  <SelectTrigger className="h-10 border-primary/20"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="होय">होय, चांगला फरक आहे</SelectItem><SelectItem value="नाही">नाही, काहीच बदल नाही</SelectItem><SelectItem value="थोड्या प्रमाणात">थोड्या प्रमाणात जाणवतो</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 mt-6 border-t pt-4">
              <Label className="text-sm font-bold text-primary">पशुखाद्याबाबत तुमच्या मुख्य तक्रारी कोणत्या आहेत?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-muted/10 p-4 rounded-lg border border-dashed border-primary/20">
                {complaintOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 bg-white p-2 rounded shadow-sm border border-transparent hover:border-primary/20 transition-all">
                    <Checkbox id={`dcomp-${opt.value}`} checked={form.watch("mainProblem").includes(opt.value)} onCheckedChange={(checked) => {
                      const cur = form.getValues("mainProblem") || [];
                      form.setValue("mainProblem", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                    }} />
                    <Label htmlFor={`dcomp-${opt.value}`} className="text-xs cursor-pointer font-bold">{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1 mt-4"><Label className="text-xs font-bold">इतर काही विशेष तक्रार असल्यास येथे माहिती लिहा:</Label><Textarea {...form.register("otherProblem")} placeholder="तपशील लिहा..." className="h-16 border-primary/20" /></div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">११. अ‍ॅड पॉइंट्स (इतर महत्त्वाचे मुद्दे)</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendPoint({ point: "" })} className="h-8 text-xs bg-primary/5 text-primary border-primary">नवीन मुद्दा जोडा</Button>
            </div>
            <div className="space-y-3">
              {pointFields.map((f, i) => (
                <div key={f.id} className="relative group">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePoint(i)}><Trash2 className="h-4 w-4" /></Button>
                  <Label className="text-[10px] font-bold text-primary uppercase mb-1 block">मुद्दा क्र. {i+1}:</Label>
                  <Textarea {...form.register(`customPoints.${i}.point` as const)} placeholder="येथे अतिरिक्त माहिती लिहा..." className="bg-white border-primary/20" />
                </div>
              ))}
            </div>
          </section>

          <section className="form-section bg-primary/5 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1"><Label className="text-xs font-bold text-primary uppercase">सर्वे करणाऱ्याचे पूर्ण नाव काय आहे?</Label><Input {...form.register("surveyorName")} placeholder="नाव लिहा" className="bg-white border-primary/30 h-10" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-primary uppercase">तुमचा सर्वेक्षण आयडी (Surveyor ID) काय आहे?</Label><Input {...form.register("surveyorId")} placeholder="ID लिहा" className="bg-white border-primary/30 h-10" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-primary uppercase">सर्वेक्षणाची तारीख कोणती आहे?</Label><Input {...form.register("surveyDate")} type="date" className="bg-white border-primary/30 h-10" /></div>
            </div>
          </section>

          <div className="flex justify-center md:justify-end gap-3 no-print pt-6 border-t">
            <Button type="button" variant="outline" onClick={handlePrint} className="h-10 px-4 md:px-6 border-primary text-primary hover:bg-primary/5 text-xs md:text-sm">
              <Printer className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />अहवाल प्रिंट करा
            </Button>
            <Button type="submit" className="bg-primary h-10 px-6 md:px-8 shadow-lg hover:bg-primary/90 text-xs md:text-sm font-bold">
              <Save className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />माहिती जतन करा
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DairySurvey() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <DairySurveyForm />
    </Suspense>
  );
}
