
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { Button } from "@/components/ui/button";
import { generateRegionalFeedSummary } from "@/ai/flows/generate-regional-feed-summary";
import { Loader2, TrendingUp, Users, MapPin, BrainCircuit, FileText, LayoutDashboard, Store, Clock, PieChart, Filter, Download, Upload, Copy, Check } from "lucide-react";
import { useSurveyStore, SurveyRecord } from "@/lib/survey-store";
import { useBrandStore } from "@/lib/brand-store";
import { useSupplierStore } from "@/lib/supplier-store";
import { toast } from "@/hooks/use-toast";
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
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
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
  };

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

  const handleExportData = () => {
    const data = {
      surveys: localStorage.getItem('pashudhan_surveys'),
      brands: localStorage.getItem('pashudhan_master_brands'),
      suppliers: localStorage.getItem('pashudhan_suppliers'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pashudhan_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({ title: "यशस्वी", description: "बॅकअप फाईल डाउनलोड झाली आहे." });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.surveys) localStorage.setItem('pashudhan_surveys', data.surveys);
        if (data.brands) localStorage.setItem('pashudhan_master_brands', data.brands);
        if (data.suppliers) localStorage.setItem('pashudhan_suppliers', data.suppliers);
        toast({ title: "यशस्वी", description: "डेटा यशस्वीरित्या रिस्टोर झाला!" });
        loadDashboardData();
        window.location.reload();
      } catch (err) {
        toast({ variant: "destructive", title: "त्रुटी", description: "चुकीची फाईल! कृपया योग्य बॅकअप फाईल निवडा." });
      }
    };
    reader.readAsText(file);
  };

  const handleCopyAiSummary = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    toast({ title: "कॉपी झाले", description: "विश्लेषण क्लिपबोर्डवर सेव्ह झाले आहे." });
    setTimeout(() => setCopied(false), 2000);
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8" /> मुख्य डॅशबोर्ड
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">तुमच्या क्षेत्रातील ट्रेंड्स आणि सर्वेक्षण आकडेवारी.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImportData} 
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1 md:gap-2 text-[10px] md:text-xs border-primary text-primary h-8 px-2">
              <Upload className="h-3 w-3 md:h-3.5 md:w-3.5" /> रिस्टोर
            </Button>
            <Button variant="default" size="sm" onClick={handleExportData} className="gap-1 md:gap-2 text-[10px] md:text-xs bg-primary shadow-md h-8 px-2">
              <Download className="h-3 w-3 md:h-3.5 md:w-3.5" /> बॅकअप
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">सर्वेक्षणे</CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">जिल्हे</CardTitle>
              <MapPin className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.districts}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">लोकप्रिय</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-accent" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xs md:text-lg font-bold text-accent truncate">{stats.popularBrand}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">ब्रँड्स</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.totalBrands}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-primary/20 shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">पुरवठादार</CardTitle>
              <Store className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.totalSuppliers}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary font-headline text-lg">
                    <BrainCircuit className="h-5 w-5" />
                    क्षेत्रीय AI विश्लेषण
                  </CardTitle>
                  <CardDescription className="text-xs">निवडलेल्या भागातील ट्रेंड्सचे AI विश्लेषण मिळवा.</CardDescription>
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
                    className="w-full bg-primary mt-4 shadow-md h-10 text-sm" 
                    disabled={!district || !taluka || loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    AI विश्लेषण तयार करा
                  </Button>

                  {aiSummary && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10 text-xs md:text-sm leading-relaxed whitespace-pre-wrap relative group shadow-inner">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-7 w-7 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleCopyAiSummary}
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <div className="font-bold text-primary mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> {taluka}, {district}:
                      </div>
                      {aiSummary}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary font-headline text-lg">
                    <PieChart className="h-5 w-5" />
                    ब्रँड लोकप्रियता
                  </CardTitle>
                  <CardDescription className="text-xs">निवडलेल्या भागातील टॉप ५ ब्रँड्स.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 p-2 rounded-lg border border-primary/10 mb-2">
                    <div className="flex items-center gap-2 mb-2 text-primary font-bold text-[10px] uppercase">
                      <Filter className="h-3 w-3" /> चार्ट फिल्टर
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
                  
                  <div className="h-[200px] md:h-[250px]">
                    {filteredChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={70} 
                            tick={{ fontSize: 9, fontWeight: 'bold' }} 
                          />
                          <RechartsTooltip 
                            contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
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
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs italic p-4 text-center">
                        <FileText className="h-6 w-6 mb-2 opacity-20" />
                        माहिती उपलब्ध नाही.
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
                <CardTitle className="text-primary font-headline flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" /> अलीकडील सर्वेक्षणे
                </CardTitle>
                <CardDescription className="text-xs">नुकतेच पूर्ण झालेले रिपोर्ट.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSurveys.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground text-sm">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-10" />
                      हालचाल नाही.
                    </div>
                  ) : (
                    recentSurveys.map((survey, i) => (
                      <div key={i} className="flex items-center justify-between p-2 md:p-3 bg-muted/30 rounded-lg border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-sm transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs md:text-sm text-primary truncate">
                            {survey.type === 'dairy' ? survey.data.dairyName : survey.data.farmerName}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="h-3 w-3 text-primary" /> {survey.data.village}
                          </p>
                        </div>
                        <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground bg-white px-1.5 py-0.5 rounded border shadow-sm ml-2">
                          {new Date(survey.timestamp).toLocaleDateString('mr-IN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {recentSurveys.length > 0 && (
                  <Button variant="ghost" className="w-full mt-4 text-[10px] md:text-xs text-primary h-8" asChild>
                    <a href="/surveys">सर्व रिपोर्ट पहा</a>
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
