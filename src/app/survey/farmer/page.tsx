
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
  bagPrice: z.string(),
  bagWeight: z.string(),
  monthlyBags: z.string(),
  purchaseSource: z.string().optional(),
  suppliers: z.array(z.object({
    name: z.string(),
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
  packNutrition: z.object({
    protein: z.string(),
    fat: z.string(),
    fiber: z.string(),
    calcium: z.string(),
    phosphorus: z.string(),
    salt: z.string().optional(),
    mineralMix: z.string().optional(),
  }),
  rating: z.string(),
  problems: z.array(z.string()).default([]),
  improvements: z.string(),
  switchIfCheaper: z.string().optional(),
  idealFeedQualities: z.string(),
  customPoints: z.array(z.object({
    point: z.string(),
  })).default([]),
  surveyorName: z.string().min(1, "सर्वे करणाऱ्याचे नाव आवश्यक आहे"),
  surveyorId: z.string().min(1, "आयडी आवश्यक आहे"),
  surveyDate: z.string().optional(),
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
      suppliers: [{ name: "" }],
      customPoints: [],
      packNutrition: { protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "" },
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
      // Set defaults from profile
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
    form.setValue("packNutrition.protein", selected.nutrition.protein);
    form.setValue("packNutrition.fat", selected.nutrition.fat);
    form.setValue("packNutrition.fiber", selected.nutrition.fiber);
    form.setValue("packNutrition.calcium", selected.nutrition.calcium);
    form.setValue("packNutrition.phosphorus", selected.nutrition.phosphorus);
    form.setValue("packNutrition.salt", selected.nutrition.salt);
    form.setValue("packNutrition.mineralMix", selected.nutrition.mineralMix);

    toast({ 
      title: "ब्रँड माहिती अपडेट झाली", 
      description: `${selected.name} चे सर्व तपशील आपोआप भरले गेले आहेत.` 
    });
  };

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "त्रुटी", description: "तुमच्या ब्राउझरमध्ये जीपीएस सपोर्ट नाही." });
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        form.setValue("location", coords);
        setLocating(false);
        toast({ title: "यशस्वी", description: "लोकेशन प्राप्त झाले आहे." });
      },
      (error) => {
        console.error(error);
        toast({ variant: "destructive", title: "त्रुटी", description: "लोकेशन मिळवण्यात अडचण आली. कृपया परवानगी तपासा." });
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const onSubmit = async (data: FarmerFormValues) => {
    try {
      localStorage.setItem('last_surveyor_name', data.surveyorName);
      localStorage.setItem('last_surveyor_id', data.surveyorId);

      if (surveyId) {
        updateSurvey(surveyId, {
          type: "farmer",
          surveyorName: data.surveyorName,
          surveyorId: data.surveyorId,
          data: data
        });
        toast({ title: "यशस्वी", description: "शेतकरी रिव्ह्यू अपडेट झाला!" });
      } else {
        addSurvey({
          type: "farmer",
          surveyorName: data.surveyorName,
          surveyorId: data.surveyorId,
          data: data
        });
        toast({ title: "यशस्वी", description: "शेतकरी रिव्ह्यू यशस्वीरित्या जतन झाला!" });
      }
      router.push("/surveys");
    } catch (e) {
      toast({ variant: "destructive", title: "त्रुटी", description: "काहीतरी चूक झाली." });
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline text-accent">
            {surveyId ? "शेतकरी सर्वेक्षण अपडेट" : "शेतकरी ब्रँड सर्वेक्षण प्रश्नावली"}
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-accent/5">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> लोकेशन टॅगिंग
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={locating}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                लोकेशन मिळवा
              </Button>
              {form.watch("location") && (
                <div className="text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  नोंदवलेले लोकेशन: {form.watch("location")}
                </div>
              )}
              <Input type="hidden" {...form.register("location")} />
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">१. शेतकरी माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">शेतकऱ्याचे नाव</Label>
                <Input {...form.register("farmerName")} placeholder="नाव प्रविष्ट करा" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">मोबाईल नंबर</Label>
                <Input {...form.register("mobile")} placeholder="१० अंकी क्रमांक" maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">गाव</Label>
                <Input {...form.register("village")} placeholder="गावाचे नाव" />
              </div>
            </div>
            <div className="mt-4">
              <LocationSelector 
                onLocationChange={(d, t) => {
                  form.setValue("district", d);
                  form.setValue("taluka", t);
                }}
                defaultDistrict={form.getValues("district")}
                defaultTaluka={form.getValues("taluka")}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="form-label-mr text-xs">गायी</Label>
                <Input {...form.register("animalCount.cows")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr text-xs">म्हशी</Label>
                <Input {...form.register("animalCount.buffaloes")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr text-xs">वासरे</Label>
                <Input {...form.register("animalCount.calves")} type="number" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-accent">२. पशुखाद्य वापर माहिती</h3>
              <div className="flex items-center gap-2 bg-accent/5 p-2 rounded-lg border border-accent/20 no-print">
                <Search className="h-4 w-4 text-accent" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-accent uppercase">मास्टर ब्रँड निवडा</span>
                  <Select onValueChange={handleMasterBrandSelect}>
                    <SelectTrigger className="h-8 bg-white w-[200px] text-xs">
                      <SelectValue placeholder="येथून ब्रँड निवडा" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterBrands.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground">प्रथम ब्रँड मास्टर लिस्टमध्ये जतन करा</div>
                      ) : (
                        masterBrands.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="form-label-mr">सध्या कोणत्या पशुखाद्य ब्रँडचा वापर करता?</Label>
                <Input {...form.register("currentBrand")} placeholder="उदा. गोदरेज, कपिला" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">हा ब्रँड तुम्ही किती काळापासून वापरत आहात?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("usageDuration", v)} className="flex flex-wrap gap-4 mt-2" value={form.watch("usageDuration")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="6m" id="ud1" /><Label htmlFor="ud1">६ महिने</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="1y" id="ud2" /><Label htmlFor="ud2">१ वर्ष</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="2y+" id="ud3" /><Label htmlFor="ud3">२ वर्षांपेक्षा जास्त</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">तुम्ही दिवसाला प्रति जनावर किती पशुखाद्य देता? (किलो)</Label>
                <Input {...form.register("dailyQtyPerAnimal")} type="number" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">दिवसातून किती वेळा देता?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("frequency", v)} className="flex gap-4 mt-2" value={form.watch("frequency")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="1" id="f1" /><Label htmlFor="f1">१ वेळ</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="2" id="f2" /><Label htmlFor="f2">२ वेळा</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="3" id="f3" /><Label htmlFor="f3">३ वेळा</Label></div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2 mt-6">
              <Label className="form-label-mr">पशुखाद्य सोबत इतर खाद्य देता का?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["हिरवा चारा", "सुका चारा", "खळ", "मका", "खनिज मिश्रण"].map((feed) => (
                  <div key={feed} className="flex items-center space-x-2">
                    <Checkbox 
                      id={feed} 
                      checked={(form.watch("otherFeeds") || []).includes(feed)}
                      onCheckedChange={(checked) => {
                        const current = form.getValues("otherFeeds") || [];
                        if (checked) form.setValue("otherFeeds", [...current, feed]);
                        else form.setValue("otherFeeds", current.filter(f => f !== feed));
                      }}
                    />
                    <Label htmlFor={feed}>{feed}</Label>
                  </div>
                ))}
              </div>
              <Input {...form.register("otherFeedText")} placeholder="इतर" className="mt-2" />
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">३. ब्रँड निवड कारण</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="form-label-mr">हा ब्रँड निवडण्याचे मुख्य कारण काय?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["चांगली गुणवत्ता", "कमी किंमत", "दूध उत्पादन वाढ", "दुकानदार सल्ला", "इतर शेतकरी सल्ला"].map((r) => (
                    <div key={r} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`reason-${r}`} 
                        checked={(form.watch("selectionReason") || []).includes(r)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("selectionReason") || [];
                          if (checked) form.setValue("selectionReason", [...current, r]);
                          else form.setValue("selectionReason", current.filter(v => v !== r));
                        }}
                      />
                      <Label htmlFor={`reason-${r}`}>{r}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">हा ब्रँड वापरायला सुरुवात कशी झाली?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("startMethod", v)} className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2" value={form.watch("startMethod")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Shop" id="sm1" /><Label htmlFor="sm1">दुकानदार</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="CompanyRep" id="sm2" /><Label htmlFor="sm2">प्रतिनिधी</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Friend" id="sm3" /><Label htmlFor="sm3">मित्र</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Ad" id="sm4" /><Label htmlFor="sm4">जाहिरात</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">४. गुणवत्ता व परिणाम</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="form-label-mr">या पशुखाद्याची गुणवत्ता कशी वाटते?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("quality", v)} className="flex gap-4 mt-2" value={form.watch("quality")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="VeryGood" id="q1" /><Label htmlFor="q1">खूप चांगली</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Okay" id="q2" /><Label htmlFor="q2">ठीक</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Bad" id="q3" /><Label htmlFor="q3">खराब</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">या फीडमुळे दूध उत्पादन वाढले का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("milkIncrease", v)} className="flex gap-4 mt-2" value={form.watch("milkIncrease")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="mi1" /><Label htmlFor="mi1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="mi2" /><Label htmlFor="mi2">नाही</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">जनावरांचे आरोग्य सुधारले का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("healthImprovement", v)} className="flex gap-4 mt-2" value={form.watch("healthImprovement")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="hi1" /><Label htmlFor="hi1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="hi2" /><Label htmlFor="hi2">नाही</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">जनावरांना हा फीड खायला आवडतो का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("likesFeed", v)} className="flex gap-4 mt-2" value={form.watch("likesFeed")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="lf1" /><Label htmlFor="lf1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="lf2" /><Label htmlFor="lf2">नाही</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">दूधातील फॅट मध्ये फरक जाणवला का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("fatDiff", v)} className="flex gap-4 mt-2" value={form.watch("fatDiff")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="fd1" /><Label htmlFor="fd1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="fd2" /><Label htmlFor="fd2">नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">५. किंमत व खरेदी</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">एका पोत्याची किंमत (₹)</Label>
                <Input {...form.register("bagPrice")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">पोत्याचे वजन (किग्रॅ)</Label>
                <Input {...form.register("bagWeight")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">महिन्याला किती पोती लागतात?</Label>
                <Input {...form.register("monthlyBags")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">हा ब्रँड कुठून खरेदी करता?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("purchaseSource", v)} className="grid grid-cols-2 gap-2 mt-2" value={form.watch("purchaseSource")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Local" id="ps1" /><Label htmlFor="ps1">स्थानिक दुकान</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Dealer" id="ps2" /><Label htmlFor="ps2">डीलर</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Dairy" id="ps3" /><Label htmlFor="ps3">डेअरी</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Other" id="ps4" /><Label htmlFor="ps4">इतर</Label></div>
                </RadioGroup>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-sm font-bold text-accent">पुरवठादार निवडा</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ name: "" })} className="gap-1 h-8 text-xs">
                    <Plus className="h-3 w-3" /> पुरवठादार जोडा
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplierFields.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-lg bg-muted/5 relative group">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 text-destructive h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSupplier(index)}
                        disabled={supplierFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Label className="text-[10px] uppercase text-muted-foreground">पुरवठादार {index + 1}</Label>
                      <Select onValueChange={(v) => form.setValue(`suppliers.${index}.name`, v)} value={form.watch(`suppliers.${index}.name`)}>
                        <SelectTrigger className="h-9 text-xs mt-1">
                          <SelectValue placeholder="पुरवठादार निवडा" />
                        </SelectTrigger>
                        <SelectContent>
                          {masterSuppliers.length === 0 ? (
                            <SelectItem value="none" disabled>प्रथम पुरवठादार मास्टरमध्ये जोडा</SelectItem>
                          ) : (
                            masterSuppliers.map(s => (
                              <SelectItem key={s.id} value={`${s.shopName} (${s.name})`}>
                                {s.shopName} - {s.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Input {...form.register(`suppliers.${index}.name`)} placeholder="किंवा इतर नाव लिहा..." className="h-8 text-xs mt-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="form-label-mr">उधारी मिळते का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("hasCredit", v)} className="flex gap-4 mt-2" value={form.watch("hasCredit")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="hc1" /><Label htmlFor="hc1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="hc2" /><Label htmlFor="hc2">नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">६. ब्रँड तुलना</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="form-label-mr">यापूर्वी कोणते ब्रँड वापरले आहेत?</Label>
                <Input {...form.register("previousBrands")} placeholder="नावे प्रविष्ट करा" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">सध्याच्या ब्रँडपेक्षा चांगला ब्रँड कोणता वाटतो?</Label>
                <Input {...form.register("betterBrand")} placeholder="ब्रँडचे नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">हा ब्रँड वापरण्याचे कारण काय?</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["किंमत", "गुणवत्ता", "उपलब्धता", "दूध उत्पादन"].map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`switch-${reason}`} 
                        checked={(form.watch("switchReason") || []).includes(reason)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("switchReason") || [];
                          if (checked) form.setValue("switchReason", [...current, reason]);
                          else form.setValue("switchReason", current.filter(v => v !== reason));
                        }}
                      />
                      <Label htmlFor={`switch-${reason}`}>{reason}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">७. उपलब्धता व सेवा</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="form-label-mr">बाजारात हा ब्रँड सहज मिळतो का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("easyAvailability", v)} className="flex gap-4 mt-2" value={form.watch("easyAvailability")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="av1" /><Label htmlFor="av1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="av2" /><Label htmlFor="av2">नाही</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">कंपनी प्रतिनिधी गावात भेट देतात का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("repVisit", v)} className="flex gap-4 mt-2" value={form.watch("repVisit")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="rv1" /><Label htmlFor="rv1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="rv2" /><Label htmlFor="rv2">नाही</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">कंपनीकडून सॅम्पल किंवा माहिती मिळते का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("samplesInfo", v)} className="flex gap-4 mt-2" value={form.watch("samplesInfo")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="si1" /><Label htmlFor="si1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="si2" /><Label htmlFor="si2">नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">८. घटक माहिती</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="form-label-mr">तुम्हाला पशुखाद्यामधील घटक माहिती आहेत का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("knowsIngredients", v)} className="flex gap-4 mt-2" value={form.watch("knowsIngredients")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="ki1" /><Label htmlFor="ki1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="ki2" /><Label htmlFor="ki2">नाही</Label></div>
                </RadioGroup>
              </div>
              <Label className="text-sm font-bold block mt-4">पॅकवर दिलेले मुख्य घटक (%)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px]">प्रोटीन</Label>
                  <Input {...form.register("packNutrition.protein")} placeholder="%" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">फॅट</Label>
                  <Input {...form.register("packNutrition.fat")} placeholder="%" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">फायबर</Label>
                  <Input {...form.register("packNutrition.fiber")} placeholder="%" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">कॅल्शियम</Label>
                  <Input {...form.register("packNutrition.calcium")} placeholder="%" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">फॉस्फरस</Label>
                  <Input {...form.register("packNutrition.phosphorus")} placeholder="%" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">मीठ</Label>
                  <Input {...form.register("packNutrition.salt")} placeholder="%" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">मिनरल</Label>
                  <Input {...form.register("packNutrition.mineralMix")} placeholder="%" className="h-8 text-xs" />
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">९. समाधान रेटिंग</h3>
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => form.setValue("rating", star.toString())}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    parseInt(form.watch("rating") || "0") >= star ? "text-yellow-500 scale-110" : "text-gray-300"
                  )}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
              <span className="text-sm font-bold text-accent">रेटिंग: {form.watch("rating")}/५</span>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">१०. समस्या व सूचना</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="form-label-mr">पशुखाद्य वापरताना कोणत्या समस्या येतात?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["जास्त किंमत", "गुणवत्ता कमी", "उपलब्धता कमी", "जनावरांना आवडत नाही"].map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`prob-${p}`} 
                        checked={(form.watch("problems") || []).includes(p)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("problems") || [];
                          if (checked) form.setValue("problems", [...current, p]);
                          else form.setValue("problems", current.filter(v => v !== p));
                        }}
                      />
                      <Label htmlFor={`prob-${p}`}>{p}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">कंपनीने कोणत्या सुधारणा करायला हव्यात?</Label>
                <Textarea {...form.register("improvements")} placeholder="सूचना लिहा..." />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">जर स्वस्त आणि चांगले फीड मिळाले तर ब्रँड बदलाल का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("switchIfCheaper", v)} className="flex gap-4 mt-2" value={form.watch("switchIfCheaper")}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="swc1" /><Label htmlFor="swc1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="swc2" /><Label htmlFor="swc2">नाही</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">तुमच्या मते सर्वात चांगल्या पशुखाद्यामध्ये कोणते गुण असावेत?</Label>
                <Textarea {...form.register("idealFeedQualities")} placeholder="उदा. जास्त दूध वाढ, वाजवी किंमत" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2 flex items-center justify-between">
              ११. ॲड पॉइंट्स
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendPoint({ point: "" })}
                className="gap-2 text-accent border-accent hover:bg-accent/10"
              >
                <PlusCircle className="h-4 w-4" /> नवीन मुद्दा जोडा
              </Button>
            </h3>
            <div className="space-y-4">
              {pointFields.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">येथे तुम्ही तुमच्या गरजेनुसार अतिरिक्त मुद्दे जोडू शकता.</p>
              ) : (
                pointFields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-lg bg-accent/5 relative space-y-2 group">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-destructive h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePoint(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Label className="text-xs font-bold text-accent">मुद्दा {index + 1}</Label>
                    <Textarea 
                      {...form.register(`customPoints.${index}.point` as const)} 
                      placeholder="माहिती लिहा..." 
                      className="h-20 text-xs bg-white" 
                    />
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="form-section bg-accent/5">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">सर्वेक्षक तपशील</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सर्वे करणाऱ्याचे नाव</Label>
                <Input {...form.register("surveyorName")} placeholder="तुमचे नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">आयडी नंबर</Label>
                <Input {...form.register("surveyorId")} placeholder="तुमचा आयडी" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">दिनांक</Label>
                <Input {...form.register("surveyDate")} type="date" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print">
            <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> पीडीएफ प्रिंट
            </Button>
            <Button type="submit" className="gap-2 bg-accent hover:bg-accent/90">
              <Save className="h-4 w-4" /> {surveyId ? "रिव्ह्यू अपडेट करा" : "रिव्ह्यू जतन करा"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FarmerSurvey() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}>
      <FarmerSurveyForm />
    </Suspense>
  );
}
