"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { Button } from "@/components/ui/button";
import { generateRegionalFeedSummary } from "@/ai/flows/generate-regional-feed-summary";
import { Loader2, TrendingUp, Users, MapPin, BrainCircuit } from "lucide-react";

export default function Dashboard() {
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const getAiSummary = async () => {
    if (!district || !taluka) return;
    setLoading(true);
    try {
      const result = await generateRegionalFeedSummary({ district, taluka });
      setAiSummary(result.summary);
    } catch (error) {
      setAiSummary("माहिती प्राप्त करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-headline text-primary">डॅशबोर्ड (Dashboard)</h1>
          <p className="text-muted-foreground">तुमच्या क्षेत्रातील पशुखाद्य ट्रेंड्स आणि सर्वेक्षण आकडेवारी.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">एकूण सर्वेक्षणे</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">१२४</div>
              <p className="text-xs text-muted-foreground">+१२% मागील महिन्यापासून</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">सक्रिय जिल्हे</CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">७</div>
              <p className="text-xs text-muted-foreground">महाराष्ट्र राज्य</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">लोकप्रिय ब्रँड</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">गोदरेज एग्रोवेट</div>
              <p className="text-xs text-muted-foreground">सर्वात जास्त वापरला जाणारा</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary font-headline">
                <BrainCircuit className="h-5 w-5" />
                क्षेत्रीय AI विश्लेषण (Regional Insights)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">
                जिल्हा आणि तालुका निवडा जेणेकरून AI द्वारे त्या भागातील पशुखाद्य वापराचे विश्लेषण मिळेल.
              </p>
              <LocationSelector 
                onLocationChange={(d, t) => {
                  setDistrict(d);
                  setTaluka(t);
                }}
              />
              <Button 
                onClick={getAiSummary} 
                className="w-full bg-primary mt-4" 
                disabled={!district || !taluka || loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "AI विश्लेषण तयार करा"}
              </Button>

              {aiSummary && (
                <div className="mt-6 p-4 bg-muted rounded-lg border text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-500">
                  {aiSummary}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle className="text-primary font-headline">अलीकडील हालचाली</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "सागर पाटील", loc: "पुणे, हवेली", type: "डेअरी", time: "२ तासांपूर्वी" },
                  { name: "अमित देशपांडे", loc: "नगर, संगमनेर", type: "शेतकरी रिव्ह्यू", time: "५ तासांपूर्वी" },
                  { name: "विशाल शिंदे", loc: "सातारा, कराड", type: "डेअरी", time: "काल" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.loc} • {item.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
