
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { useSurveyStore } from "@/lib/survey-store";
import { useBrandStore, MasterBrand } from "@/lib/brand-store";
import { useSupplierStore, Supplier } from "@/lib/supplier-store";
import { Save, Printer, ArrowLeft, Star, MapPin, Loader2, PlusCircle, Trash2, Search, Store, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const farmerSchema = z.object({
  farmerName: z.string().min(1, "नाव आवश्यक आहे"),
  mobile: z.string().min(10, "क्रमांक चुकीचा आहे"),
  district: z.string(),
  taluka: z.string(),
  village: z.string().min(1, "गाव आवश्यक आहे"),
  location: z.string().optional(),
  animalCount: z.object({
    cows: z.string().default("0"),
    buffaloes: z.string().default("0"),
    calves: z.string().default("0"),
  }),
  currentBrand: z.string().min(1, "ब्रँड नाव आवश्यक आहे"),
  usageDuration: z.string().optional(),
  dailyQtyPerAnimal: z.string(),
  frequency: z.string().optional(),
  otherFeeds: z.array(z.string()).default([]),
  otherFeedText: z.string().optional(),
  selectionReason: z.array(z.string()).default([]),
  startMethod: z.string().optional(),
  quality: z.string().optional(),
  milkIncrease: z.string().optional(),
  healthImprovement: z.string().optional(),
  likesFeed: z.string().optional(),
  fatDiff: z.string().optional(),
  pelletQuality: z.string().optional(),
  dustContent: z.string().optional(),
  healthObservation: z.string().optional(),
  bagPrice: z.string(),
  bagWeight: z.string(),
  monthlyBags: z.string(),
  purchaseSource: z.string().optional(),
  suppliers: z.array(z.object({
    name: z.string(),
    contact: z.string().optional(),
    address: z.string().optional(),
    source: z.string().optional(),
  })).default([{ name: "" }]),
  hasCredit: z.string().optional(),
  previousBrands: z.string(),
  betterBrand: z.string(),
  switchReason: z.array(z.string()).default([]),
  easyAvailability: z.string().optional(),
  repVisit: z.string().optional(),
  samplesInfo: z.string().optional(),
  knowsIngredients: z.string().optional(),
  packNutrition: z.any(),
  rating: z.string(),
  problems: z.array(z.string()).default([]),
  otherProblem: z.string().optional(),
  improvements: z.string(),
  switchIfCheaper: z.string().optional(),
  idealFeedQualities: z.string(),
  customPoints: z.array(z.object({
    point: z.string(),
  })).default([]),
  surveyorName: z.string().min(1, "सर्वे करणाऱ्याचे नाव आवश्यक आहे"),
  surveyorId: z.string().min(1, "आयडी आवश्यक आहे"),
  surveyDate: z.string().optional(),
  sampleTrial: z.string().optional(),
});

type FarmerFormValues = z.infer<typeof farmerSchema>;

function FarmerSurveyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('id');
  const { addSurvey, updateSurvey, getSurveyById } = useSurveyStore();
  const { getBrands } = useBrandStore();
  const { getSuppliers } = useSupplierStore();
  const [masterBrands, setMasterBrands] = useState<MasterBrand[]>([]);
  const [masterSuppliers, setMasterSuppliers] = useState<Supplier[]>([]);
  const [locating, setLocating] = useState(false);
  
  const form = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      rating: "3",
      animalCount: { cows: "0", buffaloes: "0", calves: "0" },
      otherFeeds: [],
      selectionReason: [],
      switchReason: [],
      problems: [],
      suppliers: [{ name: "", contact: "", address: "" }],
      customPoints: [],
      packNutrition: null,
      surveyDate: new Date().toISOString().split('T')[0],
      location: "",
      surveyorName: "",
      surveyorId: "",
    }
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
      if (existing && existing.type === 'farmer') {
        form.reset(existing.data);
        if (existing.data.customPoints) replacePoints(existing.data.customPoints);
      }
    } else {
      form.setValue("surveyorName", savedName);
      form.setValue("surveyorId", savedId);
    }
  }, [surveyId]);

  const handleMasterBrandSelect = (brandId: string) => {
    const selected = masterBrands.find(b => b.id === brandId);
    if (!selected) return;

    form.setValue("currentBrand", selected.name);
    form.setValue("bagPrice", selected.price);
    form.setValue("bagWeight", selected.bagWeight);
    form.setValue("packNutrition", selected.nutrition);
    toast({ title: "ब्रँड माहिती अपडेट झाली", description: `${selected.name} चे सर्व घटक आपोआप भरले गेले आहेत.` });
  };

  const handleMasterSupplierSelect = (index: number, supplierId: string) => {
    const selected = masterSuppliers.find(s => s.id === supplierId);
    if (selected) {
      form.setValue(`suppliers.${index}.name`, selected.shopName);
      form.setValue(`suppliers.${index}.contact`, selected.contact);
      form.setValue(`suppliers.${index}.address`, `${selected.address}, ${selected.taluka}, ${selected.district}`);
    }
  };

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

  const onSubmit = async (data: FarmerFormValues) => {
    try {
      localStorage.setItem('last_surveyor_name', data.surveyorName);
      localStorage.setItem('last_surveyor_id', data.surveyorId);
      if (surveyId) {
        updateSurvey(surveyId, { type: "farmer", surveyorName: data.surveyorName, surveyorId: data.surveyorId, data });
      } else {
        addSurvey({ type: "farmer", surveyorName: data.surveyorName, surveyorId: data.surveyorId, data });
      }
      router.push("/surveys");
    } catch (e) {
      toast({ variant: "destructive", title: "त्रुटी", description: "काहीतरी चूक झाली." });
    }
  };

  const selectionOptions = [
    { label: "चांगली गुणवत्ता", value: "Quality" },
    { label: "दूध उत्पादन वाढ", value: "MilkIncrease" },
    { label: "इतर शेतकरी सल्ला", value: "PeerAdvice" },
    { label: "कमी किंमत", value: "LowPrice" },
    { label: "सहज उपलब्धता", value: "Availability" },
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

  const switchOptions = [
    { label: "किंमत", value: "Price" },
    { label: "उपलब्धता", value: "Availability" },
    { label: "गुणवत्ता", value: "Quality" },
    { label: "दूध उत्पादन", value: "Milk" },
  ];

  const supplementOptions = [
    { label: "सुक्या चारा", value: "DryFodder" },
    { label: "हिरवा चारा", value: "GreenFodder" },
    { label: "खळ", value: "Khala" },
    { label: "मका", value: "Maize" },
    { label: "खनिज मिश्रण", value: "MineralMix" },
  ];

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold font-headline text-primary">शेतकरी ब्रँड सर्वेक्षण</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> लोकेशन टॅगिंग</h3>
            <Button type="button" onClick={handleGetLocation} disabled={locating} className="bg-primary">{locating ? <Loader2 className="animate-spin" /> : "लोकेशन मिळवा"}</Button>
            {form.watch("location") && <div className="mt-2 text-xs font-bold">नोंदवलेले लोकेशन: {form.watch("location")}</div>}
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. शेतकरी माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">शेतकऱ्याचे नाव</Label><Input {...form.register("farmerName")} placeholder="नाव" /></div>
              <div className="space-y-1"><Label className="text-xs">मोबाईल</Label><Input {...form.register("mobile")} placeholder="मोबाईल" maxLength={10} /></div>
              <div className="space-y-1"><Label className="text-xs">गाव</Label><Input {...form.register("village")} placeholder="गाव" /></div>
            </div>
            <div className="mt-4"><LocationSelector onLocationChange={(d, t) => { form.setValue("district", d); form.setValue("taluka", t); }} defaultDistrict={form.getValues("district")} defaultTaluka={form.getValues("taluka")} /></div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="space-y-1"><Label className="text-xs">गायी</Label><Input {...form.register("animalCount.cows")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">म्हशी</Label><Input {...form.register("animalCount.buffaloes")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs">वासरे</Label><Input {...form.register("animalCount.calves")} type="number" /></div>
            </div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="text-lg font-bold text-primary">२. पशुखाद्य वापर</h3>
              <Select onValueChange={handleMasterBrandSelect}><SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="ब्रँड निवडा" /></SelectTrigger><SelectContent>{masterBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">सध्या वापरत असलेला ब्रँड</Label><Input {...form.register("currentBrand")} placeholder="ब्रँड नाव" /></div>
              <div className="space-y-1"><Label className="text-xs">किती काळापासून वापरत आहात?</Label><Input {...form.register("usageDuration")} placeholder="उदा. ६ महिने" /></div>
              <div className="space-y-1"><Label className="text-xs">दिवसातून किती वेळा देता?</Label>
                <Select onValueChange={(v) => form.setValue("frequency", v)} value={form.watch("frequency")}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="1">१ वेळ</SelectItem><SelectItem value="2">२ वेळा</SelectItem><SelectItem value="3">३ वेळा</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">प्रति जनावर दररोज पशुखाद्य (किलो)</Label><Input {...form.register("dailyQtyPerAnimal")} type="number" /></div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-bold">वापरत असलेले इतर खाद्य</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {supplementOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox id={`supp-${opt.value}`} checked={form.watch("otherFeeds").includes(opt.value)} onCheckedChange={(checked) => {
                      const cur = form.getValues("otherFeeds") || [];
                      form.setValue("otherFeeds", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                    }} />
                    <Label htmlFor={`supp-${opt.value}`} className="text-xs">{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३-४-५. ब्रँड निवड व गुणवत्ता</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">ब्रँड निवडण्याचे मुख्य कारण</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectionOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox id={`sel-${opt.value}`} checked={form.watch("selectionReason").includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("selectionReason") || [];
                        form.setValue("selectionReason", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`sel-${opt.value}`} className="text-xs">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">मार्गदर्शन कोणाचे घेतले?</Label><Input {...form.register("startMethod")} placeholder="उदा. शेजारी, जाहिरात" /></div>
                <div className="space-y-1"><Label className="text-xs">सध्याच्या पशुखाद्याची गुणवत्ता कशी वाटते?</Label><Input {...form.register("quality")} /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="space-y-1"><Label className="text-xs">दूध वाढले का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("milkIncrease", v)} value={form.watch("milkIncrease")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="mi1" /><Label htmlFor="mi1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="mi2" /><Label htmlFor="mi2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs">आरोग्य सुधारले का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("healthImprovement", v)} value={form.watch("healthImprovement")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="hi1" /><Label htmlFor="hi1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="hi2" /><Label htmlFor="hi2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs">फॅटमध्ये फरक?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("fatDiff", v)} value={form.watch("fatDiff")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="fd1" /><Label htmlFor="fd1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="fd2" /><Label htmlFor="fd2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs">समाधानी आहात का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("likesFeed", v)} value={form.watch("likesFeed")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="lf1" /><Label htmlFor="lf1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="lf2" /><Label htmlFor="lf2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-1"><Label className="text-xs">पोत्याची किंमत (₹)</Label><Input {...form.register("bagPrice")} type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">पोत्याचे वजन (किग्रॅ)</Label><Input {...form.register("bagWeight")} type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">मासिक पोती संख्या</Label><Input {...form.register("monthlyBags")} type="number" /></div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="text-lg font-bold text-primary">६. पुरवठा माहिती</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ name: "", contact: "", address: "" })}>जोडा</Button>
            </div>
            <div className="space-y-4">
              {supplierFields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-lg relative bg-muted/5 space-y-3">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeSupplier(index)}><Trash2 className="h-4 w-4" /></Button>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-primary uppercase">मास्टर लिस्टमधून निवडा</Label>
                    <Select onValueChange={(v) => handleMasterSupplierSelect(index, v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="पुरवठादार निवडा" /></SelectTrigger>
                      <SelectContent>{masterSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.shopName} ({s.name})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Input {...form.register(`suppliers.${index}.name`)} placeholder="पुरवठादाराचे नाव" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
              <div className="space-y-1"><Label className="text-xs">खरेदीचा मुख्य स्त्रोत</Label>
                <Select onValueChange={(v) => form.setValue("purchaseSource", v)} value={form.watch("purchaseSource")}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="LocalShop">स्थानिक दुकान</SelectItem><SelectItem value="Dealer">डीलर</SelectItem><SelectItem value="Other">इतर</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">उधारीची सुविधा आहे का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("hasCredit", v)} value={form.watch("hasCredit")} className="flex gap-4 h-9 items-center">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="hc1" /><Label htmlFor="hc1" className="text-xs">होय</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="hc2" /><Label htmlFor="hc2" className="text-xs">नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७-८-९-१०. तुलना, गुणवत्ता व रेटिंग</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">यापूर्वी वापरलेले ब्रँड्स</Label><Input {...form.register("previousBrands")} placeholder="स्वल्पविराम देऊन लिहा" /></div>
                <div className="space-y-1"><Label className="text-xs">तुमच्या मते चांगला ब्रँड कोणता?</Label><Input {...form.register("betterBrand")} placeholder="उदा. गोदरेज" /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">ब्रँड बदलण्याचे कारण</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {switchOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox id={`sw-${opt.value}`} checked={form.watch("switchReason").includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("switchReason") || [];
                        form.setValue("switchReason", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`sw-${opt.value}`} className="text-xs">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1"><Label className="text-xs">पशुखाद्य सहजरीत्या उपलब्ध होते का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("easyAvailability", v)} value={form.watch("easyAvailability")} className="flex gap-4">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="ea1" /><Label htmlFor="ea1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="ea2" /><Label htmlFor="ea2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs">कंपनी प्रतिनिधी नियमित भेट देतात का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("repVisit", v)} value={form.watch("repVisit")} className="flex gap-4">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="rv1" /><Label htmlFor="rv1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="rv2" /><Label htmlFor="rv2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-1"><Label className="text-xs">पशुखाद्याची कॉलिटी योग्य आहे का?</Label>
                  <Select onValueChange={(v) => form.setValue("pelletQuality", v)} value={form.watch("pelletQuality")}><SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger><SelectContent><SelectItem value="होय">होय</SelectItem><SelectItem value="नाही">नाही</SelectItem><SelectItem value="मध्यम">मध्यम</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">पोत्यामध्ये धुळीचे (Powder) प्रमाण जास्त असते का?</Label>
                  <Select onValueChange={(v) => form.setValue("dustContent", v)} value={form.watch("dustContent")}><SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger><SelectContent><SelectItem value="होय">होय</SelectItem><SelectItem value="नाही">नाही</SelectItem><SelectItem value="कधीकधी">कधीकधी</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">शरीराची चकाकी किंवा स्फूर्तीमध्ये फरक?</Label>
                  <Select onValueChange={(v) => form.setValue("healthObservation", v)} value={form.watch("healthObservation")}><SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger><SelectContent><SelectItem value="होय">होय</SelectItem><SelectItem value="नाही">नाही</SelectItem><SelectItem value="थोड्या प्रमाणात">थोड्या प्रमाणात</SelectItem></SelectContent></Select>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2"><Label className="font-bold">रेटिंग (1-5):</Label><Input {...form.register("rating")} type="range" min="1" max="5" className="w-40" /><span>{form.watch("rating")}</span></div>
              <div className="space-y-2 border-t pt-4">
                <Label className="text-sm font-bold text-primary">मुख्य तक्रारी (Main Complaints)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {complaintOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox id={`fcomp-${opt.value}`} checked={(form.watch("problems") || []).includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("problems") || [];
                        form.setValue("problems", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`fcomp-${opt.value}`} className="text-xs">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1"><Label className="text-xs">इतर तक्रारी</Label><Input {...form.register("otherProblem")} placeholder="इतर माहिती लिहा" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">सुधारणा सूचना</Label><Textarea {...form.register("improvements")} className="h-20" /></div>
                <div className="space-y-1"><Label className="text-xs">आदर्श पशुखाद्य गुण</Label><Textarea {...form.register("idealFeedQualities")} className="h-20" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1"><Label className="text-xs">स्वस्त ब्रँड मिळाल्यास बदलणार का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("switchIfCheaper", v)} value={form.watch("switchIfCheaper")} className="flex gap-4">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="sic1" /><Label htmlFor="sic1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="sic2" /><Label htmlFor="sic2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs">नमुना ट्रायल पाहाल का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("sampleTrial", v)} value={form.watch("sampleTrial")} className="flex gap-4">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="st1" /><Label htmlFor="st1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="st2" /><Label htmlFor="st2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex justify-between">११. अ‍ॅड पॉइंट्स <Button type="button" variant="outline" size="sm" onClick={() => appendPoint({ point: "" })}>जोडा</Button></h3>
            {pointFields.map((field, index) => (
              <div key={field.id} className="relative mb-2"><Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removePoint(index)}><Trash2 className="h-3 w-3" /></Button><Textarea {...form.register(`customPoints.${index}.point` as const)} placeholder="माहिती लिहा..." /></div>
            ))}
          </section>

          <section className="form-section bg-primary/5">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1"><Label className="text-xs">तुमचे नाव</Label><Input {...form.register("surveyorName")} /></div>
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

export default function FarmerSurvey() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <FarmerSurveyForm />
    </Suspense>
  );
}
