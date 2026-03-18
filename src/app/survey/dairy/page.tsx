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
    protein: z.string(),
    fat: z.string(),
    fiber: z.string(),
    calcium: z.string(),
    phosphorus: z.string(),
    salt: z.string(),
    mineralMix: z.string(),
    others: z.string(),
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
  surveyorId: z.string().min(1, "ID आवश्यक आहे"),
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

    if (surveyId) {
      const existing = getSurveyById(surveyId);
      if (existing && existing.type === 'dairy') {
        form.reset(existing.data);
        if (existing.data.brandsInfo) replaceBrands(existing.data.brandsInfo);
        if (existing.data.customPoints) replacePoints(existing.data.customPoints);
      }
    }
  }, [surveyId]);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "त्रुटी", description: "तुमच्या ब्राउझरमध्ये GPS सपोर्ट नाही." });
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
            calcium: selected.nutrition.calcium,
            phosphorus: selected.nutrition.phosphorus,
            salt: selected.nutrition.salt,
            mineralMix: selected.nutrition.mineralMix,
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
    { label: "खनिज मिश्रण (Mineral Mix)", value: "MineralMix" },
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
            {surveyId ? "डेअरी सर्वेक्षण अपडेट (Update Dairy Survey)" : "डेअरी सर्वेक्षण फॉर्म (Dairy Survey)"}
          </h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> लोकेशन टॅगिंग (GPS Location)
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={locating}
                className="bg-primary hover:bg-primary/90"
              >
                {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                लोकेशन मिळवा (Get Location)
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
                <Label className="form-label-mr">गाव (Village)</Label>
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
                <Textarea {...form.register("address")} placeholder="रस्ता, गल्ली, खुणा इ." />
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
                <Label className="form-label-mr">सरासरी दूध उत्पादन (प्रति जनावर लिटर/दिवस)</Label>
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
                    <Label htmlFor="rd1">रेडीमेड पशुखाद्य (Ready Made)</Label>
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
                    <SelectTrigger>
                      <SelectValue placeholder="निवडा" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">१ वेळ</SelectItem>
                      <SelectItem value="2">२ वेळा</SelectItem>
                      <SelectItem value="3">३ वेळा</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="form-label-mr">प्रति जनावर दररोज पशुखाद्य (किग्रॅ)</Label>
                  <Input {...form.register("dailyFeedPerAnimal")} type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="form-label-mr">खालीलपैकी कोणते पूरक खाद्य वापरता?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                <div className="mt-2">
                  <Input {...form.register("otherSupplement")} placeholder="इतर काही असल्यास लिहा" />
                </div>
              </div>
            </div>
          </section>

          <section className="form-section overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-primary">४. ब्रँड व पोषण माहिती (मास्टर ब्रँड मल्टिपल सिलेक्शन)</h3>
              <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg border border-primary/20 no-print">
                <Search className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary uppercase">मास्टर ब्रँड निवडा</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-8 bg-white w-[250px] text-xs justify-between">
                        {selectedBrandIds.length > 0 
                          ? `${selectedBrandIds.length} ब्रँड निवडले आहेत` 
                          : "येथून ब्रँड निवडा"}
                        <PlusCircle className="h-4 w-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                        {masterBrands.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground italic">प्रथम ब्रँड मास्टर लिस्टमध्ये जतन करा</div>
                        ) : (
                          masterBrands.map((b) => (
                            <div 
                              key={b.id} 
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                                selectedBrandIds.includes(b.id) && "bg-primary/10"
                              )}
                              onClick={() => toggleBrandSelection(b.id)}
                            >
                              <div className={cn(
                                "h-4 w-4 border rounded flex items-center justify-center",
                                selectedBrandIds.includes(b.id) ? "bg-primary border-primary" : "border-input"
                              )}>
                                {selectedBrandIds.includes(b.id) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-xs font-medium">{b.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t bg-muted/5">
                        <Button 
                          className="w-full h-8 text-xs" 
                          size="sm" 
                          onClick={handleAddSelectedBrands}
                          disabled={selectedBrandIds.length === 0}
                        >
                          निवडलेले ब्रँड जोडा
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">ब्रँड नाव</TableHead>
                  <TableHead className="font-bold">प्रकार</TableHead>
                  <TableHead className="font-bold">वजन (किग्रॅ)</TableHead>
                  <TableHead className="font-bold">किंमत (₹)</TableHead>
                  <TableHead className="font-bold text-xs">प्रोटीन (%)</TableHead>
                  <TableHead className="font-bold text-xs">फॅट (%)</TableHead>
                  <TableHead className="font-bold text-xs">फायबर (%)</TableHead>
                  <TableHead className="font-bold text-xs">कॅल्शियम (%)</TableHead>
                  <TableHead className="font-bold text-xs">फॉस्फरस (%)</TableHead>
                  <TableHead className="font-bold text-xs">मीठ (%)</TableHead>
                  <TableHead className="font-bold text-xs">मिनरल (%)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandFields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-6 text-muted-foreground text-sm">
                      मास्टर ब्रँड निवडल्यास सर्व माहिती येथे आपोआप भरली जाईल.
                    </TableCell>
                  </TableRow>
                ) : (
                  brandFields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.name` as const)} className="h-8 text-xs font-bold" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.feedType` as const)} className="h-8 text-xs" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.bagWeight` as const)} className="h-8 text-xs w-16" type="number" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.price` as const)} className="h-8 text-xs w-20" type="number" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.protein` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.fat` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.fiber` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.calcium` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.phosphorus` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.salt` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell><Input {...form.register(`brandsInfo.${index}.mineralMix` as const)} className="h-8 text-xs w-14" /></TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBrand(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">५. खरेदी पद्धत</h3>
              <RadioGroup 
                onValueChange={(v) => form.setValue("purchaseMethod", v)} 
                className="space-y-2"
                value={form.watch("purchaseMethod")}
              >
                <div className="flex items-center space-x-2"><RadioGroupItem value="Cash" id="p1" /><Label htmlFor="p1">रोखीने (Cash)</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Credit" id="p2" /><Label htmlFor="p2">उधारीने (Credit)</Label></div>
                <div className="flex items-center space-x-2 ml-6">
                  <Input {...form.register("creditDays")} placeholder="दिवस" className="h-8 w-20" />
                  <span className="text-xs">दिवसांची उधारी</span>
                </div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Weekly" id="p3" /><Label htmlFor="p3">साप्ताहिक</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Fortnightly" id="p4" /><Label htmlFor="p4">पंधरवड्याने</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Monthly" id="p5" /><Label htmlFor="p5">मासिक</Label></div>
              </RadioGroup>
            </section>

            <section className="form-section">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-primary">६. पुरवठा माहिती (मल्टिपल पुरवठादार)</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => appendSupplier({ source: "", name: "" })} className="gap-1 h-8 text-xs">
                  <Plus className="h-3 w-3" /> पुरवठादार जोडा
                </Button>
              </div>
              <div className="space-y-6">
                {supplierFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg bg-muted/5 relative space-y-4 group">
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
                    <div className="space-y-2">
                      <Label className="text-xs">पशुखाद्य कुठून खरेदी करता? (स्त्रोत {index + 1})</Label>
                      <Select 
                        onValueChange={(v) => form.setValue(`suppliers.${index}.source`, v)}
                        value={form.watch(`suppliers.${index}.source`)}
                      >
                        <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LocalShop">स्थानिक दुकान</SelectItem>
                          <SelectItem value="Dealer">कंपनी डीलर</SelectItem>
                          <SelectItem value="Dairy">डेअरी / संकलन केंद्र</SelectItem>
                          <SelectItem value="Other">इतर</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.watch(`suppliers.${index}.source`) === "Other" && <Input {...form.register(`suppliers.${index}.otherSource`)} placeholder="इतर स्त्रोताचे नाव" className="mt-1" />}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">पुरवठादार निवडा (मास्टर लिस्ट मधून)</Label>
                      <Select onValueChange={(v) => form.setValue(`suppliers.${index}.name`, v)} value={form.watch(`suppliers.${index}.name`)}>
                        <SelectTrigger className="h-10 text-xs">
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
                      <div className="mt-2">
                        <Label className="text-[10px] text-muted-foreground">किंवा इतर नाव असल्यास येथे लिहा:</Label>
                        <Input {...form.register(`suppliers.${index}.name`)} placeholder="एजन्सी किंवा दुकानदाराचे नाव" className="h-8 text-xs" />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-2">
                  <Label className="text-sm">पुरवठा वेळेवर मिळतो का?</Label>
                  <RadioGroup 
                    onValueChange={(v) => form.setValue("timelySupply", v as any)} 
                    className="flex gap-4"
                    value={form.watch("timelySupply")}
                  >
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="ts1" /><Label htmlFor="ts1">होय</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="ts2" /><Label htmlFor="ts2">नाही</Label></div>
                  </RadioGroup>
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७. खर्च माहिती</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">महिन्याला एकूण खर्च (₹)</Label>
                  <Input {...form.register("monthlyExp")} type="number" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">महिन्याला लागणाऱ्या पोत्यांची संख्या</Label>
                  <Input {...form.register("monthlyBags")} type="number" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">८. गुणवत्ता व समाधान</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">सध्याच्या पशुखाद्याबद्दल तुम्ही समाधानी आहात का?</Label>
                  <Select 
                    onValueChange={(v) => form.setValue("satisfaction", v)}
                    value={form.watch("satisfaction")}
                  >
                    <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VeryGood">खूप चांगले</SelectItem>
                      <SelectItem value="Okay">ठीक आहे</SelectItem>
                      <SelectItem value="NotSatisfied">समाधानी नाही</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">पशुखाद्य बदलल्याने दूध उत्पादनात वाढ झाली का?</Label>
                  <RadioGroup 
                    onValueChange={(v) => form.setValue("milkIncrease", v)} 
                    className="flex gap-4"
                    value={form.watch("milkIncrease")}
                  >
                    <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="mi1" /><Label htmlFor="mi1">होय</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="mi2" /><Label htmlFor="mi2">नाही</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">तुमच्या मते सर्वात चांगला ब्रँड कोणता?</Label>
                  <Input {...form.register("bestBrand")} placeholder="ब्रँडचे नाव लिहा" />
                </div>
              </div>
            </section>
          </div>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">९. साठवणूक सुविधा (Storage)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">गोदाम क्षमता (MT)</Label>
                <Input {...form.register("warehouseCapacity")} placeholder="उदा. १० MT" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">साठवणुकीसाठी पुरेशी जागा उपलब्ध आहे का?</Label>
                <RadioGroup 
                  onValueChange={(v) => form.setValue("hasStorage", v)} 
                  className="flex gap-4"
                  value={form.watch("hasStorage")}
                >
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="hs1" /><Label htmlFor="hs1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="hs2" /><Label htmlFor="hs2">नाही</Label></div>
                </RadioGroup>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१०. समस्या व सूचना</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm">पशुखाद्याबाबत मुख्य समस्या काय आहे?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["जास्त किंमत", "कमी गुणवत्ता", "उपलब्धतेची अडधण", "उधारी मिळत नाही"].map((p) => (
                    <div key={p} className="flex items-center space-x-2">
                      <Checkbox 
                        id={p} 
                        checked={(form.watch("mainProblem") || "").includes(p)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("mainProblem") || "";
                          if (checked) form.setValue("mainProblem", current ? `${current}, ${p}` : p);
                          else form.setValue("mainProblem", current.split(", ").filter(v => v !== p).join(", "));
                        }}
                      />
                      <Label htmlFor={p}>{p}</Label>
                    </div>
                  ))}
                </div>
                <Input {...form.register("otherProblem")} placeholder="इतर काही समस्या असल्यास येथे लिहा" className="mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">नवीन ब्रँडचे सॅम्पल मिळाले तर वापरून पाहाल का?</Label>
                <RadioGroup 
                  onValueChange={(v) => form.setValue("sampleTrial", v)} 
                  className="flex gap-4"
                  value={form.watch("sampleTrial")}
                >
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="st1" /><Label htmlFor="st1">होय</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="st2" /><Label htmlFor="st2">नाही</Label></div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="form-label-mr">तुमच्या मते आदर्श पशुखाद्यात काय वैशिष्ट्ये असावीत?</Label>
                <Textarea {...form.register("goodFeedOpinion")} placeholder="तुमची मते / सूचना" />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2 flex items-center justify-between">
              ११. ॲड पॉइंट्स (इतर मुद्दे)
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendPoint({ point: "" })}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" /> नवीन मुद्दा जोडा
              </Button>
            </h3>
            <div className="space-y-4">
              {pointFields.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-sm">येथे तुम्ही तुमच्या गरजेनुसार अतिरिक्त मुद्दे जोडू शकता.</p>
              ) : (
                pointFields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-lg bg-muted/5 relative space-y-2 group">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-destructive h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePoint(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Label className="text-xs font-bold text-primary">मुद्दा {index + 1}</Label>
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

          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">सर्वेक्षक तपशील (Surveyor Details)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सर्वे करणाऱ्याचे नाव</Label>
                <Input {...form.register("surveyorName")} placeholder="तुमचे पूर्ण नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">ID नंबर / कर्मचारी क्रमांक</Label>
                <Input {...form.register("surveyorId")} placeholder="तुमचा अधिकृत ID" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">दिनांक</Label>
                <Input {...form.register("surveyDate")} type="date" />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print">
            <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> PDF प्रिंट करा
            </Button>
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4" /> {surveyId ? "डेटा अपडेट करा" : "डेटा जतन करा"}
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
