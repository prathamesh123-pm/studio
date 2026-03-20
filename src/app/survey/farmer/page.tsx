
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
  packNutrition: z.any(),
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
      packNutrition: {
        protein: { value: "", limit: "Min" },
        fat: { value: "", limit: "Min" },
        fiber: { value: "", limit: "Max" },
        ash: { value: "", limit: "Max" },
        calcium: { value: "", limit: "Min" },
        totalPhosphorus: { value: "", limit: "Min" },
        availablePhosphorus: { value: "", limit: "Min" },
        aflatoxin: { value: "", limit: "Max" },
        urea: { value: "", limit: "Max" },
        moisture: { value: "", limit: "Max" },
      },
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
            {form.watch("location") && <div className="mt-2 text-xs font-bold">{form.watch("location")}</div>}
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. शेतकरी माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input {...form.register("farmerName")} placeholder="शेतकऱ्याचे नाव" />
              <Input {...form.register("mobile")} placeholder="मोबाईल" maxLength={10} />
              <Input {...form.register("village")} placeholder="गाव" />
            </div>
            <div className="mt-4"><LocationSelector onLocationChange={(d, t) => { form.setValue("district", d); form.setValue("taluka", t); }} defaultDistrict={form.getValues("district")} defaultTaluka={form.getValues("taluka")} /></div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Input {...form.register("animalCount.cows")} placeholder="गायी" type="number" />
              <Input {...form.register("animalCount.buffaloes")} placeholder="म्हशी" type="number" />
              <Input {...form.register("animalCount.calves")} placeholder="वासरे" type="number" />
            </div>
          </section>

          <section className="form-section">
            <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="text-lg font-bold text-primary">२. पशुखाद्य वापर</h3>
              <Select onValueChange={handleMasterBrandSelect}><SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="ब्रँड निवडा" /></SelectTrigger><SelectContent>{masterBrands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input {...form.register("currentBrand")} placeholder="सध्याचा ब्रँड" />
              <Input {...form.register("dailyQtyPerAnimal")} placeholder="प्रति जनावर किलो" type="number" />
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३-४-५. ब्रँड निवड व गुणवत्ता</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input {...form.register("bagPrice")} placeholder="पोत्याची किंमत" type="number" />
              <Input {...form.register("bagWeight")} placeholder="पोत्याचे वजन" type="number" />
              <Input {...form.register("monthlyBags")} placeholder="मासिक पोती संख्या" type="number" />
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center"><Label className="text-sm">पुरवठादार</Label><Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ name: "" })}>जोडा</Button></div>
              {supplierFields.map((field, index) => (
                <div key={field.id} className="relative flex gap-2">
                  <Select onValueChange={(v) => form.setValue(`suppliers.${index}.name`, v)} value={form.watch(`suppliers.${index}.name`)}><SelectTrigger className="h-9"><SelectValue placeholder="निवडा" /></SelectTrigger><SelectContent>{masterSuppliers.map(s => <SelectItem key={s.id} value={s.shopName}>{s.shopName}</SelectItem>)}</SelectContent></Select>
                  <Input {...form.register(`suppliers.${index}.name`)} placeholder="नाव" className="h-9" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSupplier(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">६-७-८-९-१०. तुलना व रेटिंग</h3>
            <div className="space-y-4">
              <Input {...form.register("previousBrands")} placeholder="पूर्वीचे ब्रँड" />
              <Input {...form.register("betterBrand")} placeholder="चांगला ब्रँड कोणता वाटतो?" />
              <div className="flex items-center gap-4"><Label>रेटिंग:</Label><Input {...form.register("rating")} type="range" min="1" max="5" className="w-40" /></div>
              <Textarea {...form.register("improvements")} placeholder="सुधारणा सूचना" />
              <Textarea {...form.register("idealFeedQualities")} placeholder="आदर्श पशुखाद्य गुण" />
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
              <Input {...form.register("surveyorName")} placeholder="तुमचे नाव" />
              <Input {...form.register("surveyorId")} placeholder="आयडी" />
              <Input {...form.register("surveyDate")} type="date" />
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
