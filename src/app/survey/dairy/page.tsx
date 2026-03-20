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
import { Save, Printer, ArrowLeft, Trash2, Search, MapPin, Loader2, PlusCircle, Check, Store, Plus } from "lucide-react";
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
    otherSource: z.string().optional(),
  })).default([{ source: "", name: "" }]),
  timelySupply: z.enum(["Yes", "No"]).optional(),
  monthlyExp: z.string(),
  monthlyBags: z.string(),
  satisfaction: z.string().optional(),
  milkIncrease: z.string().optional(),
  bestBrand: z.string(),
  warehouseCapacity: z.string(),
  hasStorage: z.string().optional(),
  mainProblem: z.string().optional(),
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
      suppliers: [{ source: "", name: "" }],
      customPoints: [],
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
      toast({ variant: "destructive", title: "त्रुटी", description: "तुमच्या ब्राउझरमध्ये जीपीएस सपोर्ट नाही." });
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        form.setValue("location", coords);
        setLocating(false);
        toast({ title: "यशस्वी", description: "लोकेशन यशस्वीरित्या प्राप्त झाले!" });
      },
      (error) => {
        console.error(error);
        toast({ variant: "destructive", title: "त्रुटी", description: "लोकेशन मिळवण्यात अडचण आली. कृपया परवानगी तपासा." });
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
    toast({ title: "यशस्वी", description: "निवडलेल्या सर्व ब्रँड्सची माहिती जोडली गेली आहे." });
  };

  const toggleBrandSelection = (id: string) => {
    setSelectedBrandIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: DairyFormValues) => {
    try {
      localStorage.setItem('last_surveyor_name', data.surveyorName);
      localStorage.setItem('last_surveyor_id', data.surveyorId);

      if (surveyId) {
        updateSurvey(surveyId, {
          type: "dairy",
          surveyorName: data.surveyorName,
          surveyorId: data.surveyorId,
          data: data
        });
        toast({ title: "यशस्वी", description: "डेअरी सर्वेक्षण अपडेट झाले!" });
      } else {
        addSurvey({
          type: "dairy",
          surveyorName: data.surveyorName,
          surveyorId: data.surveyorId,
          data: data
        });
        toast({ title: "यशस्वी", description: "डेअरी सर्वेक्षण यशस्वीरित्या जतन झाले!" });
      }
      router.push("/surveys");
    } catch (e) {
      toast({ variant: "destructive", title: "त्रुटी", description: "माहिती जतन करताना काहीतरी चूक झाली." });
    }
  };

  const supplementOptions = [
    { label: "खळ", value: "Khala" },
    { label: "मका", value: "Maize" },
    { label: "हिरवा चारा", value: "GreenFodder" },
    { label: "सुका चारा", value: "DryFodder" },
    { label: "खनिज मिश्रण", value: "MineralMix" },
  ];

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-[95%]">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline text-primary">
            {surveyId ? "डेअरी सर्वेक्षण अपडेट" : "डेअरी सर्वेक्षण फॉर्म"}
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> लोकेशन टॅगिंग (जीपीएस लोकेशन)
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={locating}
                className="bg-primary hover:bg-primary/90"
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
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. सामान्य माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">दूध संकलन केंद्र / डेअरीचे नाव</Label>
                <Input {...form.register("dairyName")} placeholder="केंद्राचे नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">मालकाचे नाव</Label>
                <Input {...form.register("ownerName")} placeholder="पूर्ण नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">संपर्क क्रमांक</Label>
                <Input {...form.register("contact")} placeholder="१० अंकी मोबाईल नंबर" maxLength={10} />
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
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="form-label-mr">संपूर्ण पत्ता</Label>
                <Textarea {...form.register("address")} placeholder="रस्ता, गल्ली इ." />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सध्याचे दूध संकलन (लिटर / दिवस)</Label>
                <Input {...form.register("milkCollection")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">एकूण संलग्न शेतकरी संख्या</Label>
                <Input {...form.register("farmerCount")} type="number" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">२. पशुधन माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="form-label-mr">एकूण जनावरे</Label>
                <Input {...form.register("livestock.totalAnimals")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">गायी</Label>
                <Input {...form.register("livestock.cows")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">म्हशी</Label>
                <Input {...form.register("livestock.buffaloes")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">वासरे</Label>
                <Input {...form.register("livestock.calves")} type="number" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">दूध देणारी जनावरे</Label>
                <Input {...form.register("livestock.milkingAnimals")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">सरासरी दूध उत्पादन (लिटर/दिवस)</Label>
                <Input {...form.register("livestock.avgMilkPerAnimal")} type="number" step="0.1" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३. पशुखाद्य वापर माहिती</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="form-label-mr">कोणत्या प्रकारचे पशुखाद्य वापरता?</Label>
                <RadioGroup 
                  onValueChange={(val) => form.setValue("feedType", val as any)} 
                  className="flex flex-wrap gap-4"
                  value={form.watch("feedType")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ReadyMade" id="rd1" />
                    <Label htmlFor="rd1">रेडीमेड</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HomeMade" id="rd2" />
                    <Label htmlFor="rd2">घरगुती मिश्रण</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Both" id="rd3" />
                    <Label htmlFor="rd3">दोन्ही</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-mr">पशुखाद्य दिवसातून किती वेळा देता?</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("feedFrequency", val)}
                    value={form.watch("feedFrequency")}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">१ वेळ</SelectItem>
                      <SelectItem value="2">२ वेळा</SelectItem>
                      <SelectItem value="3">३ वेळा</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="form-label-mr">प्रति जनावर दररोज पशुखाद्य (किलो)</Label>
                  <Input {...form.register("dailyFeedPerAnimal")} type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="form-label-mr">कोणते पूरक खाद्य वापरता?</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {supplementOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={opt.value} 
                        checked={form.watch("supplements").includes(opt.value)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("supplements") || [];
                          if (checked) form.setValue("supplements", [...current, opt.value]);
                          else form.setValue("supplements", current.filter(v => v !== opt.value));
                        }}
                      />
                      <Label htmlFor={opt.value}>{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="form-section overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">४. ब्रँड व पोषण माहिती</h3>
              <div className="no-print">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2"><PlusCircle className="h-4 w-4" /> मास्टर ब्रँड जोडा</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                      {masterBrands.map((b) => (
                        <div 
                          key={b.id} 
                          className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer", selectedBrandIds.includes(b.id) && "bg-primary/10")}
                          onClick={() => toggleBrandSelection(b.id)}
                        >
                          <div className={cn("h-4 w-4 border rounded", selectedBrandIds.includes(b.id) && "bg-primary border-primary")} />
                          <span className="text-xs">{b.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t"><Button className="w-full h-8 text-xs" onClick={handleAddSelectedBrands}>निवडलेले ब्रँड जोडा</Button></div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">ब्रँड नाव</TableHead>
                  <TableHead className="font-bold">किंमत (₹)</TableHead>
                  <TableHead className="font-bold text-xs">प्रोटीन (%)</TableHead>
                  <TableHead className="font-bold text-xs">फॅट (%)</TableHead>
                  <TableHead className="font-bold text-xs">फायबर (%)</TableHead>
                  <TableHead className="font-bold text-xs">Ash (%)</TableHead>
                  <TableHead className="font-bold text-xs">कॅल्शियम (%)</TableHead>
                  <TableHead className="font-bold text-xs">T. Phos (%)</TableHead>
                  <TableHead className="font-bold text-xs">A. Phos (%)</TableHead>
                  <TableHead className="font-bold text-xs">Aflatoxin</TableHead>
                  <TableHead className="font-bold text-xs">Urea (%)</TableHead>
                  <TableHead className="font-bold text-xs">Moisture (%)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandFields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.name` as const)} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.price` as const)} className="h-8 text-xs w-20" type="number" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.protein.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.fat.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.fiber.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.ash.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.calcium.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.totalPhosphorus.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.availablePhosphorus.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.aflatoxin.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.urea.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Input {...form.register(`brandsInfo.${index}.moisture.value` as any)} className="h-8 text-xs w-14" /></TableCell>
                    <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => removeBrand(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">५. खरेदी पद्धत</h3>
              <RadioGroup onValueChange={(v) => form.setValue("purchaseMethod", v)} className="space-y-2" value={form.watch("purchaseMethod")}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Cash" id="p1" /><Label htmlFor="p1">रोखीने</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Credit" id="p2" /><Label htmlFor="p2">उधारीने</Label></div>
                <div className="flex items-center space-x-2 ml-6"><Input {...form.register("creditDays")} placeholder="दिवस" className="h-8 w-20" /><span className="text-xs">दिवस</span></div>
              </RadioGroup>
            </section>
            <section className="form-section">
              <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="text-lg font-bold text-primary">६. पुरवठा माहिती</h3><Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ source: "", name: "" })} className="h-8 text-xs">जोडा</Button></div>
              {supplierFields.map((field, index) => (
                <div key={field.id} className="p-3 border rounded-lg mb-3 relative bg-muted/5">
                  <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeSupplier(index)}><Trash2 className="h-3 w-3" /></Button>
                  <Select onValueChange={(v) => form.setValue(`suppliers.${index}.source`, v)} value={form.watch(`suppliers.${index}.source`)}><SelectTrigger><SelectValue placeholder="स्त्रोत निवडा" /></SelectTrigger><SelectContent><SelectItem value="LocalShop">स्थानिक दुकान</SelectItem><SelectItem value="Dealer">डीलर</SelectItem><SelectItem value="Other">इतर</SelectItem></SelectContent></Select>
                  <Input {...form.register(`suppliers.${index}.name`)} placeholder="नाव" className="mt-2 h-9" />
                </div>
              ))}
              <div className="flex items-center gap-4 mt-2">
                <Label className="text-sm">वेळेवर मिळतो का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("timelySupply", v as any)} className="flex gap-4" value={form.watch("timelySupply")}>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="ts1" /><Label htmlFor="ts1">होय</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="ts2" /><Label htmlFor="ts2">नाही</Label></div>
                </RadioGroup>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७. खर्च माहिती</h3>
              <div className="space-y-4">
                <div className="space-y-2"><Label className="text-sm">महिन्याला एकूण खर्च (₹)</Label><Input {...form.register("monthlyExp")} type="number" /></div>
                <div className="space-y-2"><Label className="text-sm">महिन्याला लागणाऱ्या पोत्यांची संख्या</Label><Input {...form.register("monthlyBags")} type="number" /></div>
              </div>
            </section>
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">८. गुणवत्ता व समाधान</h3>
              <div className="space-y-4">
                <Select onValueChange={(v) => form.setValue("satisfaction", v)} value={form.watch("satisfaction")}><SelectTrigger><SelectValue placeholder="समाधानी आहात का?" /></SelectTrigger><SelectContent><SelectItem value="VeryGood">होय</SelectItem><SelectItem value="Okay">ठीक आहे</SelectItem><SelectItem value="NotSatisfied">नाही</SelectItem></SelectContent></Select>
                <div className="flex items-center gap-4">
                  <Label className="text-sm">दूध वाढले का?</Label>
                  <RadioGroup onValueChange={(v) => form.setValue("milkIncrease", v)} className="flex gap-4" value={form.watch("milkIncrease")}>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="mi1" /><Label htmlFor="mi1">होय</Label></div>
                    <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="mi2" /><Label htmlFor="mi2">नाही</Label></div>
                  </RadioGroup>
                </div>
                <Input {...form.register("bestBrand")} placeholder="तुमच्या मते चांगला ब्रँड" />
              </div>
            </section>
          </div>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">९. साठवणूक सुविधा</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-sm">गोदाम क्षमता (MT)</Label><Input {...form.register("warehouseCapacity")} /></div>
              <div className="space-y-2"><Label className="text-sm">जागा उपलब्ध आहे का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("hasStorage", v)} className="flex gap-4" value={form.watch("hasStorage")}>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="hs1" /><Label htmlFor="hs1">होय</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="hs2" /><Label htmlFor="hs2">नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१०. समस्या व सूचना</h3>
            <div className="space-y-4">
              <Input {...form.register("mainProblem")} placeholder="मुख्य समस्या" />
              <Input {...form.register("otherProblem")} placeholder="इतर समस्या" />
              <div className="flex items-center gap-4">
                <Label className="text-sm">नमुना ट्रायल पाहाल का?</Label>
                <RadioGroup onValueChange={(v) => form.setValue("sampleTrial", v)} className="flex gap-4" value={form.watch("sampleTrial")}>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="Yes" id="st1" /><Label htmlFor="st1">होय</Label></div>
                  <div className="flex items-center space-x-1"><RadioGroupItem value="No" id="st2" /><Label htmlFor="st2">नाही</Label></div>
                </RadioGroup>
              </div>
              <Textarea {...form.register("goodFeedOpinion")} placeholder="आदर्श पशुखाद्य वैशिष्ट्ये" />
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex justify-between">११. अ‍ॅड पॉइंट्स <Button type="button" variant="outline" size="sm" onClick={() => appendPoint({ point: "" })}>जोडा</Button></h3>
            <div className="space-y-2">
              {pointFields.map((field, index) => (
                <div key={field.id} className="relative"><Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removePoint(index)}><Trash2 className="h-3 w-3" /></Button><Textarea {...form.register(`customPoints.${index}.point` as const)} placeholder="माहिती लिहा..." /></div>
              ))}
            </div>
          </section>

          <section className="form-section bg-primary/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1"><Label className="text-xs">नाव</Label><Input {...form.register("surveyorName")} /></div>
              <div className="space-y-1"><Label className="text-xs">आयडी</Label><Input {...form.register("surveyorId")} /></div>
              <div className="space-y-1"><Label className="text-xs">दिनांक</Label><Input {...form.register("surveyDate")} type="date" /></div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print"><Button type="button" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> प्रिंट</Button><Button type="submit" className="bg-primary"><Save className="h-4 w-4 mr-2" /> जतन करा</Button></div>
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