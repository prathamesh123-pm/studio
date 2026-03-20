
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
import { Save, Printer, ArrowLeft, Trash2, MapPin, Loader2, PlusCircle, Check, Store, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const dairySchema = z.object({
  dairyName: z.string().min(1, "नाव आवश्यक आहे"),
  ownerName: z.string().min(1, "मालकाचे नाव आवश्यक आहे"),
  contact: z.string().min(10, "संपर्क क्रमांक किमान १० अंकी असावा"),
  district: z.string(),
  taluka: z.string(),
  village: z.string().min(1, "गावाचे नाव आवश्यक आहे"),
  address: z.string(),
  milkCollection: z.string(),
  farmerCount: z.string(),
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
  dailyFeedPerAnimal: z.string(),
  supplements: z.array(z.string()).default([]),
  otherSupplement: z.string().optional(),
  brandsInfo: z.array(z.object({
    name: z.string(),
    feedType: z.string(),
    bagWeight: z.string(),
    price: z.string(),
    protein: z.any(),
    fat: z.any(),
    fiber: z.any(),
    ash: z.any(),
    calcium: z.any(),
    totalPhosphorus: z.any(),
    availablePhosphorus: z.any(),
    aflatoxin: z.any(),
    urea: z.any(),
    moisture: z.any(),
    others: z.string().optional(),
  })).default([]),
  purchaseMethod: z.string().optional(),
  creditDays: z.string().optional(),
  suppliers: z.array(z.object({
    source: z.string(),
    name: z.string(),
    contact: z.string().optional(),
    address: z.string().optional(),
    otherSource: z.string().optional(),
  })).default([{ source: "", name: "" }]),
  timelySupply: z.enum(["Yes", "No"]).optional(),
  monthlyExp: z.string(),
  monthlyBags: z.string(),
  satisfaction: z.string().optional(),
  milkIncrease: z.string().optional(),
  bestBrand: z.string(),
  pelletQuality: z.string().optional(),
  dustContent: z.string().optional(),
  healthObservation: z.string().optional(),
  warehouseCapacity: z.string(),
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
      () => setLocating(false),
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
      router.push("/surveys");
    } catch (e) {
      toast({ variant: "destructive", title: "त्रुटी", description: "काहीतरी चूक झाली." });
    }
  };

  const supplementOptions = [
    { label: "सुक्या चारा", value: "DryFodder" },
    { label: "हिरवा चारा", value: "GreenFodder" },
    { label: "खळ", value: "Khala" },
    { label: "मका", value: "Maize" },
    { label: "खनिज मिश्रण", value: "MineralMix" },
  ];

  const complaintOptions = [
    { label: "दूध वाढ नाही", value: "NoMilkIncrease" },
    { label: "फॅट कमी लागते", value: "LowFat" },
    { label: "जनावर खात नाही", value: "AnimalDoesntLike" },
    { label: "किंमत जास्त आहे", value: "HighPrice" },
    { label: "पुरवठा उशिरा होतो", value: "LateSupply" },
    { label: "भेसळ वाटते", value: "Adulteration" },
    { label: "पचनाचे त्रास", value: "DigestionIssues" },
  ];

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-[95%]">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold font-headline text-primary">डेअरी सर्वेक्षण फॉर्म</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> लोकेशन टॅगिंग</h3>
            <Button type="button" onClick={handleGetLocation} disabled={locating} className="bg-primary">{locating ? <Loader2 className="animate-spin" /> : "लोकेशन मिळवा"}</Button>
            {form.watch("location") && <div className="mt-2 text-xs font-bold">नोंदवलेले लोकेशन: {form.watch("location")}</div>}
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. सामान्य माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1"><Label className="text-xs">डेअरी नाव</Label><Input {...form.register("dairyName")} /></div>
              <div className="space-y-1"><Label className="text-xs">मालकाचे नाव</Label><Input {...form.register("ownerName")} /></div>
              <div className="space-y-1"><Label className="text-xs">संपर्क</Label><Input {...form.register("contact")} maxLength={10} /></div>
              <div className="space-y-1"><Label className="text-xs">गाव</Label><Input {...form.register("village")} /></div>
            </div>
            <div className="mt-4"><LocationSelector onLocationChange={(d, t) => { form.setValue("district", d); form.setValue("taluka", t); }} defaultDistrict={form.getValues("district")} defaultTaluka={form.getValues("taluka")} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1"><Label className="text-xs">दूध संकलन (लिटर/दिवस)</Label><Input {...form.register("milkCollection")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">शेतकरी संख्या</Label><Input {...form.register("farmerCount")} type="number" /></div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">२. पशुधन माहिती</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1"><Label className="text-xs">एकूण</Label><Input {...form.register("livestock.totalAnimals")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">गायी</Label><Input {...form.register("livestock.cows")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">म्हशी</Label><Input {...form.register("livestock.buffaloes")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">वासरे</Label><Input {...form.register("livestock.calves")} type="number" /></div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३. पशुखाद्य वापर माहिती</h3>
            <div className="space-y-4">
              <RadioGroup onValueChange={(v) => form.setValue("feedType", v as any)} value={form.watch("feedType")} className="flex gap-4">
                <div className="flex items-center space-x-1"><RadioGroupItem value="ReadyMade" id="rd1" /><Label htmlFor="rd1">रेडीमेड</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="HomeMade" id="rd2" /><Label htmlFor="rd2">घरगुती</Label></div>
                <div className="flex items-center space-x-1"><RadioGroupItem value="Both" id="rd3" /><Label htmlFor="rd3">दोन्ही</Label></div>
              </RadioGroup>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">वारंवारता (वेळा/दिवस)</Label><Input {...form.register("feedFrequency")} type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">प्रति जनावर किलो</Label><Input {...form.register("dailyFeedPerAnimal")} type="number" /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">वापरत असलेले पूरक खाद्य</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {supplementOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox id={`dsupp-${opt.value}`} checked={form.watch("supplements").includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("supplements") || [];
                        form.setValue("supplements", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`dsupp-${opt.value}`} className="text-xs">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section overflow-x-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="text-lg font-bold text-primary">४. ब्रँड व पोषण माहिती</h3>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild><Button type="button" variant="outline" size="sm">मास्टर ब्रँड निवडा</Button></PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2"><div className="space-y-1 max-h-[200px] overflow-y-auto">{masterBrands.map(b => (
                    <div key={b.id} className="flex items-center gap-2 p-1 hover:bg-muted cursor-pointer" onClick={() => { setSelectedBrandIds(prev => prev.includes(b.id) ? prev.filter(i => i !== b.id) : [...prev, b.id]); }}>
                      <Checkbox checked={selectedBrandIds.includes(b.id)} /><span className="text-xs">{b.name}</span>
                    </div>
                  ))}<Button className="w-full mt-2 h-8 text-xs" onClick={handleAddSelectedBrands}>जोडा</Button></div></PopoverContent>
                </Popover>
              </div>
            </div>
            <Table className="min-w-[1000px]">
              <TableHeader><TableRow><TableHead>ब्रँड</TableHead><TableHead>किंमत (₹)</TableHead><TableHead>प्रोटीन (%)</TableHead><TableHead>फॅट (%)</TableHead><TableHead>फायबर (%)</TableHead><TableHead>Ash (%)</TableHead><TableHead>कृती</TableHead></TableRow></TableHeader>
              <TableBody>{brandFields.map((f, i) => (
                <TableRow key={f.id}>
                  <TableCell><Input {...form.register(`brandsInfo.${i}.name`)} className="h-8 text-xs" /></TableCell>
                  <TableCell><Input {...form.register(`brandsInfo.${i}.price`)} className="h-8 text-xs w-20" type="number" /></TableCell>
                  <TableCell><Input {...form.register(`brandsInfo.${i}.protein.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                  <TableCell><Input {...form.register(`brandsInfo.${i}.fat.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                  <TableCell><Input {...form.register(`brandsInfo.${i}.fiber.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                  <TableCell><Input {...form.register(`brandsInfo.${i}.ash.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                  <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeBrand(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">५-६. खरेदी व पुरवठा माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="font-bold">खरेदी पद्धत:</Label>
                <RadioGroup onValueChange={(v) => form.setValue("purchaseMethod", v)} value={form.watch("purchaseMethod")} className="flex gap-4">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Cash" id="pm1" /><Label htmlFor="pm1">रोखीने</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Credit" id="pm2" /><Label htmlFor="pm2">उधारीने</Label></div>
                </RadioGroup>
                <div className="flex items-center gap-2"><Label className="text-xs">उधारीचे दिवस:</Label><Input {...form.register("creditDays")} type="number" className="h-8 w-24" /></div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><Label className="font-bold">पुरवठादार:</Label><Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ source: "", name: "" })}>जोडा</Button></div>
                {supplierFields.map((f, i) => (
                  <div key={f.id} className="p-2 border rounded relative space-y-2">
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeSupplier(i)}><Trash2 className="h-3 w-3" /></Button>
                    <Select onValueChange={(v) => handleMasterSupplierSelect(i, v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="मास्टर लिस्टमधून निवडा" /></SelectTrigger>
                      <SelectContent>{masterSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.shopName}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input {...form.register(`suppliers.${i}.name`)} placeholder="नाव" className="h-8" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७-८-९-१०. समाधान व तक्रारी</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">मासिक खर्च (₹)</Label><Input {...form.register("monthlyExp")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">मासिक पोती संख्या</Label><Input {...form.register("monthlyBags")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">सर्वोत्तम ब्रँड</Label><Input {...form.register("bestBrand")} /></div>
              <div className="space-y-1"><Label className="text-xs">पशुखाद्याची कॉलिटी योग्य आहे का?</Label>
                <Select onValueChange={(v) => form.setValue("pelletQuality", v)} value={form.watch("pelletQuality")}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="होय">होय</SelectItem><SelectItem value="नाही">नाही</SelectItem><SelectItem value="मध्यम">मध्यम</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 mt-4 border-t pt-4">
              <Label className="text-sm font-bold">मुख्य तक्रारी</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {complaintOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox id={`dcomp-${opt.value}`} checked={form.watch("mainProblem").includes(opt.value)} onCheckedChange={(checked) => {
                      const cur = form.getValues("mainProblem") || [];
                      form.setValue("mainProblem", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                    }} />
                    <Label htmlFor={`dcomp-${opt.value}`} className="text-xs">{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1 mt-2"><Label className="text-xs">इतर तक्रारी</Label><Input {...form.register("otherProblem")} /></div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex justify-between">११. अ‍ॅड पॉइंट्स <Button type="button" variant="outline" size="sm" onClick={() => appendPoint({ point: "" })}>जोडा</Button></h3>
            {pointFields.map((f, i) => (
              <div key={f.id} className="relative mb-2"><Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removePoint(i)}><Trash2 className="h-3 w-3" /></Button><Textarea {...form.register(`customPoints.${i}.point` as const)} /></div>
            ))}
          </section>

          <section className="form-section bg-primary/5">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label className="text-xs">नाव</Label><Input {...form.register("surveyorName")} /></div>
              <div className="space-y-1"><Label className="text-xs">आयडी</Label><Input {...form.register("surveyorId")} /></div>
              <div className="space-y-1"><Label className="text-xs">दिनांक</Label><Input {...form.register("surveyDate")} type="date" /></div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print"><Button type="button" variant="outline" onClick={() => window.print()}>प्रिंट</Button><Button type="submit" className="bg-primary">जतन करा</Button></div>
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
