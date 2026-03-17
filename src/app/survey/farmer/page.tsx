"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { useSurveyStore } from "@/lib/survey-store";
import { Save, Printer, ArrowLeft, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const farmerSchema = z.object({
  farmerName: z.string().min(1, "नाव आवश्यक आहे"),
  mobile: z.string().min(10, "क्रमांक चुकीचा आहे"),
  district: z.string(),
  taluka: z.string(),
  village: z.string(),
  animalCount: z.object({
    cows: z.string(),
    buffaloes: z.string(),
    calves: z.string(),
  }),
  currentBrand: z.string().min(1, "ब्रँड नाव आवश्यक आहे"),
  usageDuration: z.string(),
  dailyQtyPerAnimal: z.string(),
  frequency: z.string(),
  selectionReason: z.string(),
  quality: z.string(),
  milkIncrease: z.string(),
  healthImprovement: z.string(),
  fatDiff: z.string(),
  bagPrice: z.string(),
  bagWeight: z.string(),
  rating: z.string(),
  surveyorName: z.string(),
  surveyorId: z.string(),
});

export default function FarmerSurvey() {
  const router = useRouter();
  const { addSurvey } = useSurveyStore();
  const form = useForm<z.infer<typeof farmerSchema>>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      rating: "3",
      animalCount: { cows: "0", buffaloes: "0", calves: "0" }
    }
  });

  const onSubmit = async (data: z.infer<typeof farmerSchema>) => {
    try {
      addSurvey({
        type: "farmer",
        surveyorName: data.surveyorName,
        surveyorId: data.surveyorId,
        data: data
      });
      toast({ title: "यशस्वी", description: "शेतकरी रिव्ह्यू जतन झाला!" });
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-headline text-accent">कॅटल फीड ब्रँड रिव्ह्यू व सर्वे प्रश्नावली</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">१. शेतकरी माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">शेतकऱ्याचे नाव</Label>
                <Input {...form.register("farmerName")} placeholder="नाव प्रविष्ट करा" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">मोबाईल नंबर</Label>
                <Input {...form.register("mobile")} />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">गाव</Label>
                <Input {...form.register("village")} />
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
          </section>

          <section className="form-section">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">२. कॅटल फीड वापर माहिती</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सध्या कोणत्या ब्रँडचा वापर करता?</Label>
                <Input {...form.register("currentBrand")} placeholder="उदा. गोदरेज, कपिला" />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">किती काळापासून वापरत आहात?</Label>
                <RadioGroup className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6m" id="t1" />
                    <Label htmlFor="t1">६ महिने</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1y" id="t2" />
                    <Label htmlFor="t2">१ वर्ष</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2y+" id="t3" />
                    <Label htmlFor="t3">२ वर्ष+</Label>
                  </div>
                </RadioGroup>
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
            </div>
          </section>

          <section className="form-section bg-accent/5">
            <h3 className="text-lg font-bold mb-4 text-accent border-b pb-2">सर्वेक्षक तपशील</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="form-label-mr">सर्वे करणाऱ्याचे नाव</Label>
                <Input {...form.register("surveyorName")} />
              </div>
              <div className="space-y-2">
                <Label className="form-label-mr">ID नंबर</Label>
                <Input {...form.register("surveyorId")} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 no-print">
            <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> PDF प्रिंट
            </Button>
            <Button type="submit" className="gap-2 bg-accent hover:bg-accent/90">
              <Save className="h-4 w-4" /> रिव्ह्यू जतन करा
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
