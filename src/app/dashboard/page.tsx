
"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { Button } from "@/components/ui/button";
import { generateRegionalFeedSummary } from "@/ai/flows/generate-regional-feed-summary";
import { Loader2, TrendingUp, Users, MapPin, BrainCircuit, FileText, LayoutDashboard, Store, Clock, PieChart, Filter } from "lucide-react";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { useBrandStore } from "@/lib/brand-store";
import { useSupplierStore } from "@/lib/supplier-store";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { getSurveys } = useSurveyStore();
  const { getBrands } = useBrandStore();
  const { getSuppliers } = useSupplierStore();
  
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Chart location filters
  const [chartDistrict, setChartDistrict] = useState("");
  const [chartTaluka, setChartTaluka] = useState("");

  const [stats, setStats] = useState({ 
    total: 0, 
    districts: 0, 
    popularBrand: "माहिती नाही",
    totalBrands: 0,
    totalSuppliers: 0
  });
  
  const [allSurveys, setAllSurveys] = useState<SurveyRecord[]>([]);
  const [recentSurveys, setRecentSurveys] = useState<SurveyRecord[]>([]);

  useEffect(() => {
    const surveys = getSurveys();
    const brands = getBrands();
    const suppliers = getSuppliers();
    
    setAllSurveys(surveys);
    setRecentSurveys(surveys.slice(0, 6));

    const uniqueDistricts = new Set(surveys.map(s => s.data.district).filter(Boolean));
    
    const brandCounts: Record<string, number> = {};
    surveys.forEach(s => {
      const brand = s.data.currentBrand || s.data.bestBrand || (s.data.brandsInfo?.[0]?.name);
      if (brand && typeof brand === 'string') {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });
    
    const sortedBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1]);
    
    const topBrand = sortedBrands[0]?.[0] || "माहिती नाही";
    
    setStats({
      total: surveys.length,
      districts: uniqueDistricts.size,
      popularBrand: topBrand,
      totalBrands: brands.length,
      totalSuppliers: suppliers.length
    });
  }, []);

  const filteredChartData = useMemo(() => {
    const filtered = allSurveys.filter(s => {
      const matchDistrict = !chartDistrict || s.data.district === chartDistrict;
      const matchTaluka = !chartTaluka || s.data.taluka === chartTaluka;
      return matchDistrict && matchTaluka;
    });

    const brandCounts: Record<string, number> = {};
    filtered.forEach(s => {
      const brand = s.data.currentBrand || s.data.bestBrand || (s.data.brandsInfo?.[0]?.name);
      if (brand && typeof brand === 'string') {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });
    
    return Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [allSurveys, chartDistrict, chartTaluka]);

  const getAiSummary = async () => {
    if (!district || !taluka) return;
    setLoading(true);
    setAiSummary("");
    try {
      const result = await generateRegionalFeedSummary({ district, taluka });
      setAiSummary(result.summary);
    } catch (error) {
      setAiSummary("माहिती प्राप्त करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8" /> मुख्य डॅशबोर्ड (Dashboard)
            </h1>
            <p className="text-muted-foreground">तुमच्या क्षेत्रातील पशुखाद्य ट्रेंड्स आणि सर्वेक्षण आकडेवारीचे संकलन.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">एकूण सर्वेक्षणे</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">सक्रिय जिल्हे</CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.districts}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">लोकप्रिय ब्रँड</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-accent truncate">{stats.popularBrand}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">मास्टर ब्रँड्स</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrands}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">पुरवठादार</CardTitle>
              <Store className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <BrainCircuit className="h-5 w-5" />
                    क्षेत्रीय AI विश्लेषण (Regional Insights)
                  </CardTitle>
                  <CardDescription>निवडलेल्या भागातील पशुखाद्य वापराचे सविस्तर AI विश्लेषण मिळवा.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LocationSelector 
                    onLocationChange={(d, t) => {
                      setDistrict(d);
                      setTaluka(t);
                    }}
                  />
                  <Button 
                    onClick={getAiSummary} 
                    className="w-full bg-primary mt-4 shadow-md" 
                    disabled={!district || !taluka || loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "AI विश्लेषण तयार करा"}
                  </Button>

                  {aiSummary && (
                    <div className="mt-6 p-5 bg-primary/5 rounded-xl border border-primary/10 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-top-2 duration-500 shadow-inner">
                      <div className="font-bold text-primary mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> विश्लेषण परिणाम ({taluka}, {district}):
                      </div>
                      {aiSummary}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary font-headline">
                    <PieChart className="h-5 w-5" />
                    ब्रँड लोकप्रियता (Top 5 Brands)
                  </CardTitle>
                  <CardDescription>निवडलेल्या जिल्हा व तालुक्यातील टॉप ५ ब्रँड्स.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 mb-2">
                    <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase">
                      <Filter className="h-3 w-3" /> चार्ट फिल्टर करा
                    </div>
                    <LocationSelector 
                      onLocationChange={(d, t) => {
                        setChartDistrict(d);
                        setChartTaluka(t);
                      }}
                      defaultDistrict={chartDistrict}
                      defaultTaluka={chartTaluka}
                    />
                  </div>
                  
                  <div className="h-[250px]">
                    {filteredChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredChartData} layout="vertical" margin={{ left: 40, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80} 
                            tick={{ fontSize: 10, fontWeight: 'bold' }} 
                          />
                          <RechartsTooltip 
                            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                            cursor={{ fill: '#f1f5f9' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {filteredChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm italic p-4 text-center">
                        <FileText className="h-8 w-8 mb-2 opacity-20" />
                        निवडलेल्या भागात अद्याप कोणतेही सर्वेक्षण झालेले नाही.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4">
            <Card className="bg-white border-primary/20 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-primary font-headline flex items-center gap-2">
                  <Clock className="h-5 w-5" /> अलीकडील सर्वेक्षणे
                </CardTitle>
                <CardDescription>नुकतेच पूर्ण झालेले सर्वे रिपोर्ट.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSurveys.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-10" />
                      अद्याप कोणतीही हालचाल नाही.
                    </div>
                  ) : (
                    recentSurveys.map((survey, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-transparent hover:border-primary/20 transition-all hover:bg-white hover:shadow-sm">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-primary truncate">
                            {survey.type === 'dairy' ? survey.data.dairyName : survey.data.farmerName}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="h-3 w-3 text-primary" /> {survey.data.village}, {survey.data.taluka}
                          </p>
                          <div className="mt-1">
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${survey.type === 'dairy' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {survey.type === 'dairy' ? 'संकलन केंद्र' : 'शेतकरी'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground bg-white px-2 py-1 rounded border shadow-sm shrink-0 ml-2">
                          {new Date(survey.timestamp).toLocaleDateString('mr-IN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {recentSurveys.length > 0 && (
                  <Button variant="ghost" className="w-full mt-4 text-xs text-primary" asChild>
                    <a href="/surveys">सर्व सर्वेक्षणे पहा</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
