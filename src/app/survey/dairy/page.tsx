"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { useSurveyStore } from "@/lib/survey-store";
import { Separator } from "@/components/ui/separator";
import { Save, Printer, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const dairySchema = z.object({
  dairyName: z.string().min(1, "नाव आवश्यक आहे"),
  ownerName: z.string().min(1, "मालकाचे नाव आवश्यक आहे"),
  contact: z.string().min(10, "संपर्क क्रमांक चुकीचा आहे"),
  district: z.string(),
  taluka: z.string(),
  village: z.string().min(1, "गाव आवश्यक आहे"),
  address: z.string(),
  milkCollection: z.string(),
  farmerCount: z.string(),
  livestock: z.object({
    cows: z.string().default("0"),
    buffaloes: z.string().default("0"),
    calves: z.string().default("0"),
    milkingAnimals: z.string().default("0"),
    avgMilkPerAnimal: z.string().default("0"),
  }),
  feedType: z.enum(["ReadyMade", "HomeMade", "Both"]).optional(),
  feedFrequency: z.enum(["1", "2", "3"]).optional(),
  dailyFeedPerAnimal: z.string(),
  supplements: z.array(z.string()).optional(),
  purchaseMethod: z.string().optional(),
  supplySource: z.string().optional(),
  supplierName: z.string(),
  monthlyExp: z.string(),
  monthlyBags: z.string(),
  satisfaction: z.string().optional(),
  milkIncrease: z.string().optional(),
  bestBrand: z.string(),
  storageCapacity: z.string(),
  hasStorage: z.string().optional(),
  surveyorName: z.string().min(1, "सर्वे करणाऱ्याचे नाव आवश्यक आहे"),
  surveyorId: z.string().min(1, "ID आवश्यक आहे"),
});

export default function DairySurvey() {
  const router = useRouter();
  const { addSurvey } = useSurveyStore();
  const form = useForm<z.infer<typeof dairySchema>>({
    resolver: zodResolver(dairySchema),
    defaultValues: {
      livestock: { cows: "0", buffaloes: "0", calves: "0", milkingAnimals: "0", avgMilkPerAnimal: "0" },
      supplements: [],
      district: "",
      taluka: "",
    }
  });

  const onSubmit = async (data: z.infer<typeof dairySchema>) => {
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

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6 no-print">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline text-primary">पशुखाद्य सर्वेक्षण फॉर्म (Dairy Survey)</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="grid grid-cols-3 gap-4 mb-4">
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="form-label-mr">कोणत्या प्रकारचे खाद्य वापरता?</Label>
                <RadioGroup onValueChange={(val) => form.setValue("feedType", val as any)} className="flex gap-4">
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
                    <Label htmlFor="rd3">दोन्ही</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="form-label-mr">कॅटल फीड दिवसातून किती वेळा देता?</Label>
                  <Select onValueChange={(val) => form.setValue("feedFrequency", val as any)}>
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
            </div>
          </section>

          {/* Final Section: Surveyor Details */}
          <section className="form-section bg-primary/5">
            <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">सर्वेक्षक तपशील</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सर्वे करणाऱ्याचे नाव</Label>
                <Input {...form.register("surveyorName")} placeholder="तुमचे नाव" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">ID नंबर</Label>
                <Input {...form.register("surveyorId")} placeholder="तुमचा ID" />
              </div>
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
