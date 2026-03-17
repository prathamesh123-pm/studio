
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Save, Printer, ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const dairySchema = z.object({
  // 1. सामान्य माहिती
  dairyName: z.string().min(1, "नाव आवश्यक आहे"),
  ownerName: z.string().min(1, "मालकाचे नाव आवश्यक आहे"),
  contact: z.string().min(10, "संपर्क क्रमांक चुकीचा आहे"),
  district: z.string(),
  taluka: z.string(),
  village: z.string().min(1, "गाव आवश्यक आहे"),
  address: z.string(),
  milkCollection: z.string(),
  farmerCount: z.string(),

  // 2. पशुधन माहिती
  livestock: z.object({
    totalAnimals: z.string().default("0"),
    cows: z.string().default("0"),
    buffaloes: z.string().default("0"),
    calves: z.string().default("0"),
    milkingAnimals: z.string().default("0"),
    avgMilkPerAnimal: z.string().default("0"),
  }),

  // 3. पशुखाद्य वापर माहिती
  feedType: z.enum(["ReadyMade", "HomeMade", "Both"]).optional(),
  feedFrequency: z.string().optional(),
  dailyFeedPerAnimal: z.string(),
  supplements: z.array(z.string()).default([]),
  otherSupplement: z.string().optional(),

  // 4. पशुखाद्य ब्रँड व खरेदी तपशील
  brandDetails: z.array(z.object({
    type: z.string(),
    company: z.string(),
    weight: z.string(),
    price: z.string(),
    monthlyBags: z.string(),
  })).default([{ type: "", company: "", weight: "", price: "", monthlyBags: "" }]),

  // 5. त्या ब्रँडमधील घटक (Ingredients) माहिती
  ingredientsInfo: z.array(z.object({
    brand: z.string(),
    ingredient: z.string(),
    percentage: z.string(),
  })).default([{ brand: "", ingredient: "", percentage: "" }]),

  // 6. कॅटल फीडमधील पोषण घटक
  nutrition: z.object({
    protein: z.string(),
    fat: z.string(),
    fiber: z.string(),
    calcium: z.string(),
    phosphorus: z.string(),
    salt: z.string(),
    mineralMix: z.string(),
    others: z.string(),
  }),

  // 7. खरेदी पद्धत
  purchaseMethod: z.string().optional(),
  creditDays: z.string().optional(),

  // 8. पुरवठा माहिती
  supplySource: z.string().optional(),
  otherSupplySource: z.string().optional(),
  supplierName: z.string(),
  timelySupply: z.enum(["Yes", "No"]).optional(),

  // 9. खर्च माहिती
  monthlyExp: z.string(),
  monthlyBags: z.string(),

  // 10. गुणवत्ता व समाधान
  satisfaction: z.string().optional(),
  milkIncrease: z.string().optional(),
  bestBrand: z.string(),

  // 11. साठवण सुविधा
  warehouseCapacity: z.string(),
  hasStorage: z.string().optional(),

  // 12. समस्या व सूचना
  mainProblem: z.string().optional(),
  otherProblem: z.string().optional(),
  sampleTrial: z.string().optional(),
  goodFeedOpinion: z.string().optional(),

  // Surveyor Details
  surveyorName: z.string().min(1, "सर्वे करणाऱ्याचे नाव आवश्यक आहे"),
  surveyorId: z.string().min(1, "ID आवश्यक आहे"),
  surveyDate: z.string().optional(),
});

type DairyFormValues = z.infer<typeof dairySchema>;

export default function DairySurvey() {
  const router = useRouter();
  const { addSurvey } = useSurveyStore();
  const { getBrands } = useBrandStore();
  const [masterBrands, setMasterBrands] = useState<MasterBrand[]>([]);
  
  const form = useForm<DairyFormValues>({
    resolver: zodResolver(dairySchema),
    defaultValues: {
      livestock: { totalAnimals: "0", cows: "0", buffaloes: "0", calves: "0", milkingAnimals: "0", avgMilkPerAnimal: "0" },
      supplements: [],
      district: "",
      taluka: "",
      brandDetails: [{ type: "ReadyMade", company: "", weight: "", price: "", monthlyBags: "" }],
      ingredientsInfo: [],
      nutrition: { protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: "" },
      surveyDate: new Date().toISOString().split('T')[0],
    }
  });

  const { fields: brandFields, append: appendBrand, remove: removeBrand, replace: replaceBrands } = useFieldArray({
    control: form.control,
    name: "brandDetails",
  });

  const { fields: ingredientFields, replace: replaceIngredients, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredientsInfo",
  });

  useEffect(() => {
    setMasterBrands(getBrands());
  }, []);

  const handleMasterBrandSelect = (brandId: string) => {
    const selected = masterBrands.find(b => b.id === brandId);
    if (!selected) return;

    // 1. Update brandDetails table with weight and price
    replaceBrands([{
      type: selected.feedType || "ReadyMade",
      company: selected.name,
      weight: selected.bagWeight || "",
      price: selected.price || "",
      monthlyBags: ""
    }]);

    // 2. Set Nutrition values
    form.setValue("nutrition.protein", selected.nutrition.protein);
    form.setValue("nutrition.fat", selected.nutrition.fat);
    form.setValue("nutrition.fiber", selected.nutrition.fiber);
    form.setValue("nutrition.calcium", selected.nutrition.calcium);
    form.setValue("nutrition.phosphorus", selected.nutrition.phosphorus);
    form.setValue("nutrition.salt", selected.nutrition.salt);
    form.setValue("nutrition.mineralMix", selected.nutrition.mineralMix);
    form.setValue("nutrition.others", selected.nutrition.others);

    // 3. Update ingredients table
    const newIngredients = selected.ingredients.map(ing => ({
      brand: selected.name,
      ingredient: ing.ingredient,
      percentage: ing.percentage
    }));
    replaceIngredients(newIngredients);

    toast({ 
      title: "माहिती यशस्वीरित्या भरली गेली", 
      description: `${selected.name} ची पोषण मूल्ये, वजन, किंमत आणि सर्व घटक फॉर्ममध्ये भरले आहेत.` 
    });
  };

  const onSubmit = async (data: DairyFormValues) => {
    try {
      addSurvey({
        type: "dairy",
        surveyorName: data.surveyorName,
        surveyorId: data.surveyorId,
        data: data
      });
      toast({ title: "यशस्वी", description: "डेअरी सर्वेक्षण यशस्वीरित्या जतन झाले!" });
      router.push("/surveys");
    } catch (e) {
      toast({ variant: "destructive", title: "त्रुटी", description: "काहीतरी चूक झाली." });
    }
  };

  const supplementOptions = [
    { label: "खळ", value: "Khala" },
    { label: "मका", value: "Maize" },
    { label: "हिरवा चारा", value: "GreenFodder" },
    { label: "सुक्या चारा", value: "DryFodder" },
    { label: "मिनरल मिक्सचर", value: "MineralMix" },
  ];

  return (
    <div className="min-h-screen pb-12 bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline text-primary">पशुखाद्य सर्वेक्षण फॉर्म (Dairy Survey)</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Master Brand Quick Select */}
          <section className="form-section bg-primary/5 border-primary/30">
            <h3 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
              <Search className="h-5 w-5" /> मास्टर ब्रँड मधून निवडा (Quick Fill)
            </h3>
            <div className="space-y-2 max-w-sm">
              <Label className="text-sm">ब्रँड निवडा जेणेकरून घटक आणि पोषण माहिती आपोआप भरली जाईल</Label>
              <Select onValueChange={handleMasterBrandSelect}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="ब्रँड निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {masterBrands.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground">कृपया आधी 'Master Brands' पेजवर ब्रँड ऍड करा.</div>
                  ) : (
                    masterBrands.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name} ({b.bagWeight}kg)</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Section 1: General Info */}
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१. सामान्य माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">मिल्किंग सेंटर / डेअरीचे नाव</Label>
                <Input {...form.register("dairyName")} placeholder="नाव प्रविष्ट करा" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">मालकाचे नाव</Label>
                <Input {...form.register("ownerName")} placeholder="नाव प्रविष्ट करा" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">संपर्क क्रमांक</Label>
                <Input {...form.register("contact")} placeholder="१० अंकी क्रमांक" />
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
              />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="form-label-mr">संपूर्ण पत्ता</Label>
                <Textarea {...form.register("address")} placeholder="पत्ता प्रविष्ट करा" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सध्या दूध संकलन (लिटर / दिवस)</Label>
                <Input {...form.register("milkCollection")} type="number" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">एकूण संलग्न शेतकरी संख्या</Label>
                <Input {...form.register("farmerCount")} type="number" />
              </div>
            </div>
          </section>

          {/* Section 2: Livestock */}
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
                <Label className="form-label-mr">प्रति जनावर सरासरी दूध उत्पादन (लिटर/दिवस)</Label>
                <Input {...form.register("livestock.avgMilkPerAnimal")} type="number" step="0.1" />
              </div>
            </div>
          </section>

          {/* Section 3: Feed Usage */}
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">३. पशुखाद्य वापर माहिती</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="form-label-mr">कोणत्या प्रकारचे खाद्य वापरता?</Label>
                <RadioGroup 
                  onValueChange={(val) => form.setValue("feedType", val as any)} 
                  className="flex flex-wrap gap-4"
                  value={form.watch("feedType")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ReadyMade" id="rd1" />
                    <Label htmlFor="rd1">रेडीमेड कॅटल फीड</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HomeMade" id="rd2" />
                    <Label htmlFor="rd2">घरगुती मिश्रण</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Both" id="rd3" />
                    <Label htmlFor="rd3">दोनों</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-mr">कॅटल फीड दिवसातून किती वेळा देता?</Label>
                  <Select 
                    onValueChange={(val) => form.setValue("feedFrequency", val)}
                    value={form.watch("feedFrequency")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="निवडा" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 वेळ</SelectItem>
                      <SelectItem value="2">2 वेळा</SelectItem>
                      <SelectItem value="3">3 वेळा</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="form-label-mr">प्रति जनावर दररोज कॅटल फीड (किलो)</Label>
                  <Input {...form.register("dailyFeedPerAnimal")} type="number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="form-label-mr">खालील पूरक खाद्य वापरता का?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {supplementOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={opt.value} 
                        checked={form.watch("supplements").includes(opt.value)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("supplements");
                          if (checked) form.setValue("supplements", [...current, opt.value]);
                          else form.setValue("supplements", current.filter(v => v !== opt.value));
                        }}
                      />
                      <Label htmlFor={opt.value}>{opt.label}</Label>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Input {...form.register("otherSupplement")} placeholder="इतर पूरक खाद्य" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Brand Details Table */}
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">४. पशुखाद्य ब्रँड व खरेदी तपशील</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>खाद्य प्रकार</TableHead>
                  <TableHead>ब्रँड / कंपनी</TableHead>
                  <TableHead>वजन (किग्रॅ)</TableHead>
                  <TableHead>किंमत (₹)</TableHead>
                  <TableHead>मासिक पोती</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandFields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell><Input {...form.register(`brandDetails.${index}.type` as const)} /></TableCell>
                    <TableCell><Input {...form.register(`brandDetails.${index}.company` as const)} /></TableCell>
                    <TableCell><Input {...form.register(`brandDetails.${index}.weight` as const)} type="number" /></TableCell>
                    <TableCell><Input {...form.register(`brandDetails.${index}.price` as const)} type="number" /></TableCell>
                    <TableCell><Input {...form.register(`brandDetails.${index}.monthlyBags` as const)} type="number" /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeBrand(index)} disabled={brandFields.length <= 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" variant="outline" size="sm" onClick={() => appendBrand({ type: "", company: "", weight: "", price: "", monthlyBags: "" })} className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> ब्रँड जोडा
            </Button>
          </section>

          {/* Section 5: Ingredients Table */}
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">५. ब्रँडमधील घटक (Ingredients) माहिती</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ब्रँड नाव</TableHead>
                  <TableHead>घटक (Ingredient)</TableHead>
                  <TableHead>टक्केवारी (%)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredientFields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-xs">
                      घटक माहिती उपलब्ध नाही. कृपया 'घटक जोडा' बटण दाबा किंवा मास्टर ब्रँड निवडा.
                    </TableCell>
                  </TableRow>
                ) : (
                  ingredientFields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><Input {...form.register(`ingredientsInfo.${index}.brand` as const)} /></TableCell>
                      <TableCell><Input {...form.register(`ingredientsInfo.${index}.ingredient` as const)} /></TableCell>
                      <TableCell><Input {...form.register(`ingredientsInfo.${index}.percentage` as const)} type="number" /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ brand: "", ingredient: "", percentage: "" })} className="mt-2 gap-2">
              <Plus className="h-4 w-4" /> घटक जोडा
            </Button>
          </section>

          {/* Section 6: Nutrition */}
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">६. पोषण घटक (पॅकवर दिलेली माहिती %)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">क्रूड प्रोटीन</Label>
                <Input {...form.register("nutrition.protein")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">क्रूड फॅट</Label>
                <Input {...form.register("nutrition.fat")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">क्रूड फायबर</Label>
                <Input {...form.register("nutrition.fiber")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">कॅल्शियम</Label>
                <Input {...form.register("nutrition.calcium")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">फॉस्फरस</Label>
                <Input {...form.register("nutrition.phosphorus")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">मीठ</Label>
                <Input {...form.register("nutrition.salt")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">मिनरल मिक्सचर</Label>
                <Input {...form.register("nutrition.mineralMix")} placeholder="%" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">इतर</Label>
                <Input {...form.register("nutrition.others")} placeholder="%" />
              </div>
            </div>
          </section>

          {/* Sections 7 & 8: Purchase & Supply */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">७. खरेदी पद्धत</h3>
              <RadioGroup 
                onValueChange={(v) => form.setValue("purchaseMethod", v)} 
                className="space-y-2"
                value={form.watch("purchaseMethod")}
              >
                <div className="flex items-center space-x-2"><RadioGroupItem value="Cash" id="p1" /><Label htmlFor="p1">रोखीने</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Credit" id="p2" /><Label htmlFor="p2">उधारीने</Label></div>
                <div className="flex items-center space-x-2 ml-6">
                  <Input {...form.register("creditDays")} placeholder="दिवस" className="h-8 w-20" />
                  <span className="text-xs">दिवस</span>
                </div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Weekly" id="p3" /><Label htmlFor="p3">साप्ताहिक</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Fortnightly" id="p4" /><Label htmlFor="p4">पंधरवड्याने</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Monthly" id="p5" /><Label htmlFor="p5">मासिक</Label></div>
              </RadioGroup>
            </section>

            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">८. पुरवठा माहिती</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">कुठून खरेदी करता?</Label>
                  <Select 
                    onValueChange={(v) => form.setValue("supplySource", v)}
                    value={form.watch("supplySource")}
                  >
                    <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LocalShop">स्थानिक दुकान</SelectItem>
                      <SelectItem value="Dealer">कंपनी डीलर</SelectItem>
                      <SelectItem value="Dairy">डेअरी</SelectItem>
                      <SelectItem value="Other">इतर</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.watch("supplySource") === "Other" && <Input {...form.register("otherSupplySource")} placeholder="इतर स्त्रोत" />}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">पुरवठादाराचे नाव</Label>
                  <Input {...form.register("supplierName")} />
                </div>
                <div className="space-y-2">
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

          {/* Sections 9 & 10: Cost & Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">९. खर्च माहिती</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">महिन्याला एकूण खर्च (₹)</Label>
                  <Input {...form.register("monthlyExp")} type="number" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">महिन्याला लागणारी पोती</Label>
                  <Input {...form.register("monthlyBags")} type="number" />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१०. गुणवत्ता व समाधान</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">सध्याच्या खाद्याबद्दल समाधान?</Label>
                  <Select 
                    onValueChange={(v) => form.setValue("satisfaction", v)}
                    value={form.watch("satisfaction")}
                  >
                    <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VeryGood">खूप चांगले</SelectItem>
                      <SelectItem value="Okay">ठीक</SelectItem>
                      <SelectItem value="NotSatisfied">समाधान नाही</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">दूध उत्पादन वाढले का?</Label>
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
                  <Label className="text-sm">सर्वात चांगला ब्रँड कोणता वाटतो?</Label>
                  <Input {...form.register("bestBrand")} />
                </div>
              </div>
            </section>
          </div>

          {/* Sections 11 & 12: Storage & Problems */}
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">११. साठवण सुविधा</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">गोदाम क्षमता (MT)</Label>
                <Input {...form.register("warehouseCapacity")} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">साठवण सुविधा उपलब्ध आहे का?</Label>
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
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">१२. समस्या व सूचना</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm">मुख्य समस्या काय आहे?</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {["जास्त किंमत", "गुणवत्ता कमी", "उपलब्धता कमी", "उधारी मिळत नाही"].map((p) => (
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
                <Input {...form.register("otherProblem")} placeholder="इतर समस्या" className="mt-2" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">नवीन सॅम्पल मिळाले तर वापरून पाहाल का?</Label>
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
                <Label className="text-sm">तुमच्या मते चांगल्या कॅटल फीडमध्ये काय असावे?</Label>
                <Textarea {...form.register("goodFeedOpinion")} />
              </div>
            </div>
          </section>

          {/* Final Section: Surveyor Details */}
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">सर्वेक्षक तपशील</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सर्वे करणाऱ्याचे नाव</Label>
                <Input {...form.register("surveyorName")} placeholder="तुमचे नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">ID नंबर</Label>
                <Input {...form.register("surveyorId")} placeholder="तुमचा ID" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">दिनांक</Label>
                <Input {...form.register("surveyDate")} type="date" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed flex justify-between items-end opacity-50">
              <div className="text-sm italic">स्वाक्षरी: ___________________</div>
              <div className="text-sm italic">शिक्का: ___________________</div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print">
            <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> PDF प्रिंट करा
            </Button>
            <Button type="submit" className="gap-2 bg-primary">
              <Save className="h-4 w-4" /> डेटा जतन करा
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
