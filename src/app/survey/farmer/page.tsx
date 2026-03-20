
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
    { label: "चांगली गुणवत्ता असल्यामुळे", value: "Quality" },
    { label: "दूध उत्पादनात चांगली वाढ मिळते", value: "MilkIncrease" },
    { label: "इतर शेतकऱ्यांचा चांगला सल्ला मिळाला", value: "PeerAdvice" },
    { label: "किंमत इतरांपेक्षा कमी आहे", value: "LowPrice" },
    { label: "सहज उपलब्ध होते", value: "Availability" },
  ];

  const complaintOptions = [
    { label: "दूध उत्पादनात वाढ होत नाही", value: "NoMilkIncrease" },
    { label: "दुधाचे फॅट कमी लागते", value: "LowFat" },
    { label: "जनावर पशुखाद्य आवडीने खात नाही", value: "AnimalDoesntLike" },
    { label: "पशुखाद्याची किंमत खूप जास्त आहे", value: "HighPrice" },
    { label: "पुरवठा वेळेवर होत नाही", value: "LateSupply" },
    { label: "पशुखाद्यात भेसळ असल्याची शंका वाटते", value: "Adulteration" },
    { label: "जनावरांना पचनाचे त्रास होतात", value: "DigestionIssues" },
  ];

  const switchOptions = [
    { label: "कमी किंमत असल्यास", value: "Price" },
    { label: "उत्तम उपलब्धता असल्यास", value: "Availability" },
    { label: "चांगली गुणवत्ता मिळाल्यास", value: "Quality" },
    { label: "जास्त दूध उत्पादन मिळाल्यास", value: "Milk" },
  ];

  const supplementOptions = [
    { label: "सुका चारा", value: "DryFodder" },
    { label: "हिरवा चारा", value: "GreenFodder" },
    { label: "खळ (पेंड)", value: "Khala" },
    { label: "मका", value: "Maize" },
    { label: "खनिज मिश्रण", value: "MineralMix" },
  ];

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold font-headline text-primary">शेतकरी पशुखाद्य ब्रँड सर्वेक्षण फॉर्म</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center gap-2"><MapPin className="h-5 w-5" /> लोकेशन टॅगिंग (GPS Tagging)</h3>
            <Button type="button" onClick={handleGetLocation} disabled={locating} className="bg-primary">{locating ? <Loader2 className="animate-spin mr-2" /> : <MapPin className="mr-2 h-4 w-4" />}सर्वेक्षणाचे लोकेशन मिळवा</Button>
            {form.watch("location") && <div className="mt-2 text-xs font-bold text-green-700 bg-green-50 p-2 rounded border border-green-200">नोंदवलेले लोकेशन: {form.watch("location")}</div>}
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. शेतकरी व पशुधन माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">तुमचे (शेतकऱ्याचे) पूर्ण नाव काय आहे?</Label><Input {...form.register("farmerName")} placeholder="शेतकऱ्याचे नाव" /></div>
              <div className="space-y-1"><Label className="text-xs">तुमचा संपर्क मोबाईल नंबर काय आहे?</Label><Input {...form.register("mobile")} placeholder="मोबाईल नंबर" maxLength={10} /></div>
              <div className="space-y-1"><Label className="text-xs">तुमच्या गावाचे नाव काय आहे?</Label><Input {...form.register("village")} placeholder="गावाचे नाव" /></div>
            </div>
            <div className="mt-4">
              <Label className="text-sm font-bold block mb-2">तुमचा जिल्हा व तालुका निवडा:</Label>
              <LocationSelector onLocationChange={(d, t) => { form.setValue("district", d); form.setValue("taluka", t); }} defaultDistrict={form.getValues("district")} defaultTaluka={form.getValues("taluka")} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 bg-muted/20 p-4 rounded-lg">
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्याकडे सध्या किती दुभत्या गायी आहेत?</Label><Input {...form.register("animalCount.cows")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्याकडे सध्या किती दुभत्या म्हशी आहेत?</Label><Input {...form.register("animalCount.buffaloes")} type="number" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुमच्याकडे किती लहान वासरे आहेत?</Label><Input {...form.register("animalCount.calves")} type="number" /></div>
            </div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">२. सध्याचा पशुखाद्य वापर</h3>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] uppercase font-bold text-primary">मास्टर लिस्टमधून निवडा:</Label>
                <Select onValueChange={handleMasterBrandSelect}><SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="ब्रँड निवडा" /></SelectTrigger><SelectContent>{masterBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">सध्या तुम्ही कोणत्या ब्रँडचे पशुखाद्य वापरता?</Label><Input {...form.register("currentBrand")} placeholder="ब्रँडचे नाव" /></div>
              <div className="space-y-1"><Label className="text-xs">तुम्ही हा ब्रँड किती काळापासून वापरत आहात?</Label><Input {...form.register("usageDuration")} placeholder="उदा. ६ महिने / १ वर्ष" /></div>
              <div className="space-y-1"><Label className="text-xs">तुम्ही दिवसातून किती वेळा पशुखाद्य देता?</Label>
                <Select onValueChange={(v) => form.setValue("frequency", v)} value={form.watch("frequency")}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="वेळा निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="1">१ वेळा</SelectItem><SelectItem value="2">२ वेळा</SelectItem><SelectItem value="3">३ वेळा</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">प्रत्येक जनावराला दररोज साधारणपणे किती किलो पशुखाद्य देता?</Label><Input {...form.register("dailyQtyPerAnimal")} type="number" placeholder="उदा. ४ किलो" /></div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-bold">तुम्ही पशुखाद्यासोबत इतर कोणते खाद्य वापरता?</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {supplementOptions.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2 bg-muted/10 p-2 rounded">
                    <Checkbox id={`supp-${opt.value}`} checked={form.watch("otherFeeds").includes(opt.value)} onCheckedChange={(checked) => {
                      const cur = form.getValues("otherFeeds") || [];
                      form.setValue("otherFeeds", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                    }} />
                    <Label htmlFor={`supp-${opt.value}`} className="text-xs cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३-४-५. ब्रँड निवड, गुणवत्ता व समाधान</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold">तुम्ही हाच ब्रँड निवडण्याचे मुख्य कारण काय आहे?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectionOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 bg-white p-2 rounded border">
                      <Checkbox id={`sel-${opt.value}`} checked={form.watch("selectionReason").includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("selectionReason") || [];
                        form.setValue("selectionReason", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`sel-${opt.value}`} className="text-xs cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">हा ब्रँड सुरू करण्यासाठी तुम्हाला कोणाचे मार्गदर्शन मिळाले?</Label><Input {...form.register("startMethod")} placeholder="उदा. दुकानदार, शेजारी, जाहिरात" /></div>
                <div className="space-y-1"><Label className="text-xs">तुम्हाला सध्याच्या पशुखाद्याची गुणवत्ता कशी वाटते?</Label><Input {...form.register("quality")} placeholder="तुमचे मत लिहा" /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 bg-primary/5 p-4 rounded-lg">
                <div className="space-y-1"><Label className="text-xs font-bold">दूध उत्पादन वाढले का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("milkIncrease", v)} value={form.watch("milkIncrease")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="mi1" /><Label htmlFor="mi1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="mi2" /><Label htmlFor="mi2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs font-bold">जनावरांचे आरोग्य सुधारले का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("healthImprovement", v)} value={form.watch("healthImprovement")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="hi1" /><Label htmlFor="hi1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="hi2" /><Label htmlFor="hi2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs font-bold">दुधाच्या फॅटमध्ये फरक जाणवला का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("fatDiff", v)} value={form.watch("fatDiff")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="fd1" /><Label htmlFor="fd1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="fd2" /><Label htmlFor="fd2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs font-bold">तुम्ही सध्या पूर्णपणे समाधानी आहात का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("likesFeed", v)} value={form.watch("likesFeed")} className="flex gap-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="lf1" /><Label htmlFor="lf1" className="text-xs">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="lf2" /><Label htmlFor="lf2" className="text-xs">नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="space-y-1"><Label className="text-xs">एका पोत्याची किंमत किती आहे (₹)?</Label><Input {...form.register("bagPrice")} type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">एका पोत्याचे वजन किती किलो आहे?</Label><Input {...form.register("bagWeight")} type="number" /></div>
                <div className="space-y-1"><Label className="text-xs">महिन्याला साधारणपणे किती पोती लागतात?</Label><Input {...form.register("monthlyBags")} type="number" /></div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">६. खरेदी व पुरवठा माहिती</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ name: "", contact: "", address: "" })} className="h-8 text-xs"><Plus className="h-3 w-3 mr-1" />नवीन जोडा</Button>
            </div>
            <div className="space-y-4">
              {supplierFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative bg-muted/5 space-y-3">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive" onClick={() => removeSupplier(index)}><Trash2 className="h-4 w-4" /></Button>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-primary uppercase">मास्टर लिस्टमधून पुरवठादार निवडा:</Label>
                    <Select onValueChange={(v) => handleMasterSupplierSelect(index, v)}>
                      <SelectTrigger className="h-9 text-xs border-primary/20"><SelectValue placeholder="पुरवठादार निवडा" /></SelectTrigger>
                      <SelectContent>{masterSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.shopName} ({s.name})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">पुरवठादाराचे नाव</Label><Input {...form.register(`suppliers.${index}.name`)} placeholder="नाव" /></div>
                    <div className="space-y-1"><Label className="text-xs">पुरवठादाराचा संपर्क नंबर</Label><Input {...form.register(`suppliers.${index}.contact`)} placeholder="मोबाईल" /></div>
                  </div>
                </div>
              ))}
              {supplierFields.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-2">अद्याप कोणताही पुरवठादार जोडलेला नाही.</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t pt-6">
              <div className="space-y-1"><Label className="text-xs font-bold">तुमचा पशुखाद्य खरेदीचा मुख्य स्त्रोत कोणता आहे?</Label>
                <Select onValueChange={(v) => form.setValue("purchaseSource", v)} value={form.watch("purchaseSource")}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent><SelectItem value="LocalShop">स्थानिक दुकान</SelectItem><SelectItem value="Dealer">मोठा डीलर</SelectItem><SelectItem value="Other">इतर मार्ग</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs font-bold">तुम्हाला खरेदीमध्ये उधारीची सुविधा उपलब्ध आहे का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("hasCredit", v)} value={form.watch("hasCredit")} className="flex gap-6 h-10 items-center">
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="hc1" /><Label htmlFor="hc1" className="text-sm">होय, मिळते</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="hc2" /><Label htmlFor="hc2" className="text-sm">नाही, मिळत नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७-८-९-१०. तुलना, गुणवत्ता व तक्रारी</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1"><Label className="text-xs">तुम्ही यापूर्वी कोणकोणत्या ब्रँडचे पशुखाद्य वापरले आहे?</Label><Input {...form.register("previousBrands")} placeholder="स्वल्पविराम देऊन लिहा" /></div>
                <div className="space-y-1"><Label className="text-xs">तुमच्या मते सध्या बाजारात सर्वात चांगला ब्रँड कोणता आहे?</Label><Input {...form.register("betterBrand")} placeholder="उदा. गोदरेज गोल्ड" /></div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-primary">तुम्ही भविष्यात ब्रँड बदलण्याचा विचार केला तर त्याचे मुख्य कारण काय असेल?</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {switchOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 bg-white p-2 rounded border border-primary/10">
                      <Checkbox id={`sw-${opt.value}`} checked={form.watch("switchReason").includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("switchReason") || [];
                        form.setValue("switchReason", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`sw-${opt.value}`} className="text-xs cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                <div className="space-y-1"><Label className="text-xs font-bold">पशुखाद्य तुमच्या गावात सहजरीत्या उपलब्ध होते का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("easyAvailability", v)} value={form.watch("easyAvailability")} className="flex gap-6 py-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="ea1" /><Label htmlFor="ea1" className="text-sm">होय, सहज मिळते</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="ea2" /><Label htmlFor="ea2" className="text-sm">नाही, शोध घ्यावा लागतो</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs font-bold">कंपनीचे प्रतिनिधी तुम्हाला नियमितपणे भेट देतात का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("repVisit", v)} value={form.watch("repVisit")} className="flex gap-6 py-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="rv1" /><Label htmlFor="rv1" className="text-sm">होय, नियमित भेटतात</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="rv2" /><Label htmlFor="rv2" className="text-sm">नाही, कधीच येत नाहीत</Label></div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
                <div className="space-y-1">
                  <Label className="text-xs">पशुखाद्याची कॉलिटी योग्य आहे का?</Label>
                  <Select onValueChange={(v) => form.setValue("pelletQuality", v)} value={form.watch("pelletQuality")}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="निवडा" /></SelectTrigger>
                    <SelectContent><SelectItem value="होय">होय, उत्तम आहे</SelectItem><SelectItem value="नाही">नाही, चांगली नाही</SelectItem><SelectItem value="मध्यम">ठीक आहे</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">पोत्यामध्ये धुळीचे (Powder) प्रमाण जास्त असते का?</Label>
                  <Select onValueChange={(v) => form.setValue("dustContent", v)} value={form.watch("dustContent")}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="निवडा" /></SelectTrigger>
                    <SelectContent><SelectItem value="होय">होय, जास्त असते</SelectItem><SelectItem value="नाही">नाही, नसते</SelectItem><SelectItem value="कधीकधी">कधीकधी असते</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">शरीराची चकाकी किंवा स्फूर्तीमध्ये फरक जाणवला का?</Label>
                  <Select onValueChange={(v) => form.setValue("healthObservation", v)} value={form.watch("healthObservation")}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="निवडा" /></SelectTrigger>
                    <SelectContent><SelectItem value="होय">होय, फरक आहे</SelectItem><SelectItem value="नाही">नाही, फरक नाही</SelectItem><SelectItem value="थोड्या प्रमाणात">थोड्या प्रमाणात</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-2 bg-muted/20 p-4 rounded-lg">
                <Label className="font-bold text-sm">तुमचे सध्याच्या ब्रँडसाठी रेटिंग (1 ते 5):</Label>
                <div className="flex items-center gap-3">
                  <Input {...form.register("rating")} type="range" min="1" max="5" className="w-48 cursor-pointer h-2 bg-primary" />
                  <span className="font-black text-xl text-primary">{form.watch("rating")} / 5</span>
                </div>
              </div>
              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-bold text-primary">पशुखाद्याबाबत तुमच्या मुख्य तक्रारी कोणत्या आहेत?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-dashed">
                  {complaintOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2 p-1 hover:bg-muted/30 rounded transition-colors">
                      <Checkbox id={`fcomp-${opt.value}`} checked={(form.watch("problems") || []).includes(opt.value)} onCheckedChange={(checked) => {
                        const cur = form.getValues("problems") || [];
                        form.setValue("problems", checked ? [...cur, opt.value] : cur.filter(v => v !== opt.value));
                      }} />
                      <Label htmlFor={`fcomp-${opt.value}`} className="text-xs cursor-pointer">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1"><Label className="text-xs font-bold">इतर काही तक्रार असल्यास येथे लिहा:</Label><Input {...form.register("otherProblem")} placeholder="तपशील लिहा" className="h-10" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1"><Label className="text-xs font-bold text-primary">तुम्ही पशुखाद्यात काही सुधारणा सुचवू इच्छिता का?</Label><Textarea {...form.register("improvements")} className="h-24 bg-white" placeholder="तुमची सूचना येथे लिहा..." /></div>
                <div className="space-y-1"><Label className="text-xs font-bold text-primary">तुमच्या मते एका 'आदर्श पशुखाद्यात' कोणते गुण असावेत?</Label><Textarea {...form.register("idealFeedQualities")} className="h-24 bg-white" placeholder="उदा. दूध वाढ, चकाकी इ." /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                <div className="space-y-1"><Label className="text-xs font-bold">तुम्हाला स्वस्त दरात चांगला ब्रँड मिळाल्यास तुम्ही बदलणार का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("switchIfCheaper", v)} value={form.watch("switchIfCheaper")} className="flex gap-8 py-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="sic1" /><Label htmlFor="sic1" className="text-sm">होय, नक्कीच</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="sic2" /><Label htmlFor="sic2" className="text-sm">नाही, सध्याचाच योग्य आहे</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-1"><Label className="text-xs font-bold">नवीन ब्रँडचे नमुना ट्रायल घेऊन पाहायला आवडेल का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("sampleTrial", v)} value={form.watch("sampleTrial")} className="flex gap-8 py-2">
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="st1" /><Label htmlFor="st1" className="text-sm">होय, पाहायला आवडेल</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="st2" /><Label htmlFor="st2" className="text-sm">नाही, गरज नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">११. अ‍ॅड पॉइंट्स (इतर महत्त्वाचे मुद्दे)</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendPoint({ point: "" })} className="h-8 text-xs bg-primary/5 text-primary border-primary">नवीन मुद्दा जोडा</Button>
            </div>
            <div className="space-y-4">
              {pointFields.map((field, index) => (
                <div key={field.id} className="relative group p-2 rounded bg-muted/5 border">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePoint(index)}><Trash2 className="h-4 w-4" /></Button>
                  <Label className="text-[10px] font-bold text-primary uppercase mb-1 block">मुद्दा क्र. {index + 1}:</Label>
                  <Textarea {...form.register(`customPoints.${index}.point` as const)} placeholder="येथे अतिरिक्त माहिती लिहा..." className="bg-white" />
                </div>
              ))}
              {pointFields.length === 0 && <p className="text-xs text-muted-foreground italic text-center py-4">अद्याप कोणताही अतिरिक्त मुद्दा जोडलेला नाही.</p>}
            </div>
          </section>

          <section className="form-section bg-primary/5 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1"><Label className="text-xs font-bold text-primary uppercase">सर्वे करणाऱ्याचे पूर्ण नाव</Label><Input {...form.register("surveyorName")} placeholder="नाव लिहा" className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-primary uppercase">सर्वेक्षण आयडी (Surveyor ID)</Label><Input {...form.register("surveyorId")} placeholder="ID लिहा" className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-primary uppercase">सर्वेक्षणाची तारीख</Label><Input {...form.register("surveyDate")} type="date" className="bg-white" /></div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => window.print()} className="h-12 px-8 border-primary text-primary hover:bg-primary/5">
              <Printer className="mr-2 h-5 w-5" />अहवाल प्रिंट करा
            </Button>
            <Button type="submit" className="bg-primary h-12 px-10 shadow-lg hover:bg-primary/90">
              <Save className="mr-2 h-5 w-5" />माहिती जतन करा
            </Button>
          </div>
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
