"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandStore, MasterBrand, NutrientValue } from "@/lib/brand-store";
import { Plus, Trash2, Save, Package, IndianRupee, Edit2, X, Eye, Printer, FileText, PlusCircle, Search, Filter, FlaskConical } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function BrandManagement() {
  const { getBrands, addBrand, updateBrand, deleteBrand } = useBrandStore();
  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingBrand, setViewingBrand] = useState<MasterBrand | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  
  const [filterBrandId, setFilterBrandId] = useState("all");

  const [newBrandName, setNewBrandName] = useState("");
  const [compoundedType, setCompoundedType] = useState("Type 1");
  const [feedType, setFeedType] = useState("Pellet");
  const [bagWeight, setBagWeight] = useState("");
  const [availableWeights, setAvailableWeights] = useState("");
  const [price, setPrice] = useState("");
  
  const initialNutrition = {
    protein: { value: "", limit: 'Min' } as NutrientValue,
    fat: { value: "", limit: 'Min' } as NutrientValue,
    fiber: { value: "", limit: 'Max' } as NutrientValue,
    ash: { value: "", limit: 'Max' } as NutrientValue,
    calcium: { value: "", limit: 'Min' } as NutrientValue,
    totalPhosphorus: { value: "", limit: 'Min' } as NutrientValue,
    availablePhosphorus: { value: "", limit: 'Min' } as NutrientValue,
    aflatoxin: { value: "", limit: 'Max' } as NutrientValue,
    urea: { value: "", limit: 'Max' } as NutrientValue,
    moisture: { value: "", limit: 'Max' } as NutrientValue,
    others: ""
  };
  
  const [nutrition, setNutrition] = useState(initialNutrition);
  const [ingredients, setIngredients] = useState([{ ingredient: "", percentage: "" }]);
  const [customPoints, setCustomPoints] = useState<Array<{ point: string }>>([]);

  useEffect(() => {
    setBrands(getBrands());
  }, []);

  const filteredBrands = useMemo(() => {
    if (filterBrandId === "all") return brands;
    return brands.filter(b => b.id === filterBrandId);
  }, [brands, filterBrandId]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredient: "", percentage: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngs = [...ingredients];
    (newIngs[index] as any)[field] = value;
    setIngredients(newIngs);
  };

  const handleAddPoint = () => {
    setCustomPoints([...customPoints, { point: "" }]);
  };

  const handleRemovePoint = (index: number) => {
    setCustomPoints(customPoints.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, value: string) => {
    const newPoints = [...customPoints];
    newPoints[index].point = value;
    setCustomPoints(newPoints);
  };

  const handleEditBrand = (brand: MasterBrand) => {
    setEditingId(brand.id);
    setNewBrandName(brand.name || "");
    setCompoundedType(brand.compoundedType || "Type 1");
    setFeedType(brand.feedType || "Pellet");
    setBagWeight(brand.bagWeight || "");
    setAvailableWeights(brand.availableWeights || "");
    setPrice(brand.price || "");
    setNutrition({ ...initialNutrition, ...brand.nutrition });
    setIngredients(brand.ingredients || [{ ingredient: "", percentage: "" }]);
    setCustomPoints(brand.customPoints?.map(p => ({ point: p.point })) || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSaveBrand = () => {
    if (!newBrandName) {
      toast({ variant: "destructive", title: "त्रुटी", description: "ब्रँडचे नाव आवश्यक आहे." });
      return;
    }

    const brandData = {
      name: newBrandName,
      compoundedType,
      feedType,
      bagWeight,
      availableWeights,
      price,
      nutrition,
      ingredients,
      customPoints: customPoints.map(p => ({ point: p.point, value: "" }))
    };

    if (editingId) {
      updateBrand(editingId, brandData);
      toast({ title: "यशस्वी", description: "ब्रँडची माहिती अपडेट झाली!" });
    } else {
      addBrand(brandData);
      toast({ title: "यशस्वी", description: "नवीन ब्रँड मास्टर लिस्टमध्ये जतन झाला!" });
    }

    setBrands(getBrands());
    resetForm();
  };

  const handleDeleteBrand = (id: string) => {
    if (confirm("हा ब्रँड कायमचा हटवायचा आहे का?")) {
      deleteBrand(id);
      setBrands(getBrands());
      toast({ title: "यशस्वी", description: "ब्रँड हटवण्यात आला आहे." });
    }
  };

  const resetForm = () => {
    setNewBrandName("");
    setCompoundedType("Type 1");
    setFeedType("Pellet");
    setBagWeight("");
    setAvailableWeights("");
    setPrice("");
    setNutrition(initialNutrition);
    setIngredients([{ ingredient: "", percentage: "" }]);
    setCustomPoints([]);
    setEditingId(null);
  };

  const NutrientInput = ({ label, field }: { label: string, field: keyof typeof initialNutrition }) => {
    if (field === 'others') return null;
    const item = (nutrition[field] as NutrientValue) || { value: "", limit: 'Min' };
    return (
      <div className="space-y-1 p-2 bg-white rounded border border-primary/10 shadow-sm">
        <Label className="text-[10px] uppercase font-bold text-primary">{label}</Label>
        <div className="flex gap-1">
          <Select 
            value={item?.limit || 'Min'} 
            onValueChange={(val: any) => setNutrition({...nutrition, [field]: { ...item, limit: val }})}
          >
            <SelectTrigger className="h-8 w-16 text-[10px] px-1 bg-slate-50 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Min">Min</SelectItem>
              <SelectItem value="Max">Max</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="number" 
            value={item?.value || ""} 
            onChange={(e) => setNutrition({...nutrition, [field]: { ...item, value: e.target.value }})} 
            className="h-8 text-xs flex-1 border-primary/20"
            placeholder="Val"
          />
        </div>
      </div>
    );
  };

  const BrandDataRow = ({ label, value }: { label: string, value: any }) => (
    <TableRow className="hover:bg-transparent border-b border-black">
      <TableHead className="w-[50%] font-black bg-slate-50 py-2 px-3 text-[10.5pt] h-auto border-r border-black leading-tight text-black print:font-black">
        {label}
      </TableHead>
      <TableCell className="py-2 px-3 text-[11pt] h-auto leading-tight text-black font-black">
        {value || '-'}
      </TableCell>
    </TableRow>
  );

  const NutrientRow = ({ desc, data }: { desc: string, data: any }) => {
    const limit = data?.limit || (desc.toLowerCase().includes('fiber') || desc.toLowerCase().includes('ash') || desc.toLowerCase().includes('aflatoxin') || desc.toLowerCase().includes('urea') || desc.toLowerCase().includes('moisture') ? 'Max' : 'Min');
    const val = typeof data === 'object' ? data?.value : data;
    
    return (
      <TableRow className="border-b border-black">
        <TableCell className="py-1.5 px-3 text-[10pt] font-black border-r border-black" style={{ width: '40%' }}>{desc}</TableCell>
        <TableCell className="py-1.5 px-3 text-[10pt] font-black border-r border-black text-center" style={{ width: '20%' }}>{limit}</TableCell>
        <TableCell className="py-1.5 px-3 text-[10pt] font-black border-r border-black text-center" style={{ width: '20%' }}>{desc.toLowerCase().includes('aflatoxin') ? 'ppb' : '%'}</TableCell>
        <TableCell className="py-1.5 px-3 text-[10pt] font-black text-center" style={{ width: '20%' }}>{val || '-'}</TableCell>
      </TableRow>
    );
  };

  const DetailedBrandTable = ({ brand, isPrint = false }: { brand: MasterBrand, isPrint?: boolean }) => (
    <div className={`space-y-1 py-1 ${isPrint ? 'space-y-1' : ''}`}>
      <section className="break-inside-avoid">
        <h4 className="text-[11pt] font-black mb-0 border-b-2 border-black pb-0.5 text-black uppercase bg-slate-100 px-2">१. सामान्य माहिती</h4>
        <Table className="border border-black rounded-none overflow-hidden table-fixed">
          <TableBody>
            <BrandDataRow label="ब्रँड / कंपनीचे नाव" value={brand.name} />
            <BrandDataRow label="Cattlefeed Type" value={brand.compoundedType} />
            <BrandDataRow label="खाद्य प्रकार" value={brand.feedType} />
            <BrandDataRow label="बेस वजन (किग्रॅ)" value={brand.bagWeight} />
            <BrandDataRow label="बेस किंमत (₹)" value={brand.price} />
            <BrandDataRow label="उपलब्ध पॅकिंग" value={brand.availableWeights} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[11pt] font-black mb-0 border-b-2 border-black pb-0.5 text-black uppercase bg-slate-100 px-2">२. पोषण मूल्ये (Nutrient Composition)</h4>
        <Table className="border border-black rounded-none overflow-hidden table-fixed">
          <TableHeader className="bg-slate-50 border-b border-black">
            <TableRow>
              <TableHead className="text-[10pt] font-black text-black border-r border-black" style={{ width: '40%' }}>Description</TableHead>
              <TableHead className="text-[10pt] font-black text-black border-r border-black text-center" style={{ width: '20%' }}>Min/Max</TableHead>
              <TableHead className="text-[10pt] font-black text-black border-r border-black text-center" style={{ width: '20%' }}>UOM</TableHead>
              <TableHead className="text-[10pt] font-black text-black text-center" style={{ width: '20%' }}>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <NutrientRow desc="Crude protein" data={brand.nutrition?.protein} />
            <NutrientRow desc="Crude fat" data={brand.nutrition?.fat} />
            <NutrientRow desc="Crude fiber" data={brand.nutrition?.fiber} />
            <NutrientRow desc="Acid insoluble ash" data={brand.nutrition?.ash} />
            <NutrientRow desc="Calcium" data={brand.nutrition?.calcium} />
            <NutrientRow desc="Total phosphorus" data={brand.nutrition?.totalPhosphorus} />
            <NutrientRow desc="Available phosphorus" data={brand.nutrition?.availablePhosphorus} />
            <NutrientRow desc="Aflatoxin B1" data={brand.nutrition?.aflatoxin} />
            <NutrientRow desc="Urea" data={brand.nutrition?.urea} />
            <NutrientRow desc="Moisture" data={brand.nutrition?.moisture} />
          </TableBody>
        </Table>
        {brand.nutrition?.others && (
          <div className="p-2 border border-black border-t-0 text-[10pt] font-black">इतर: {brand.nutrition.others}</div>
        )}
      </section>

      {brand.ingredients && brand.ingredients.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[11pt] font-black mb-0 border-b-2 border-black pb-0.5 text-black uppercase bg-slate-100 px-2">३. मुख्य घटक (Ingredients)</h4>
          <div className="text-[10.5pt] font-black text-black leading-tight p-3 border border-black border-t-0 bg-white italic">
            {brand.ingredients.map(ing => `${ing.ingredient} (${ing.percentage}%)`).join(", ")}
          </div>
        </section>
      )}

      {brand.customPoints && brand.customPoints.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[11pt] font-black mb-0 border-b-2 border-black pb-0.5 text-black uppercase bg-slate-100 px-2">४. अ‍ॅड पॉइंट्स (इतर)</h4>
          <div className="text-[10.5pt] font-black text-black leading-tight p-3 border border-black border-t-0 min-h-[50px] bg-white">
            {brand.customPoints.map((pt, idx) => (
              <div key={idx} className="mb-1.5">• {pt.point}</div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-8 no-print">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">पशुखाद्य ब्रँड व्यवस्थापन</h1>
            <p className="text-muted-foreground text-sm md:text-base">येथे तुम्ही मास्टर ब्रँड आणि त्यांचे घटक व्यवस्थापित करू शकता.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setShowFullReport(true)} className="gap-2 border-primary text-primary">
              <FileText className="h-4 w-4" /> मास्टर रिपोर्ट पहा
            </Button>
            <Button onClick={() => window.print()} className="gap-2 bg-primary">
              <Printer className="h-4 w-4" /> प्रिंट लिस्ट
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg text-primary">
                  {editingId ? "ब्रँड संपादन करा" : "नवीन ब्रँड जोडा"}
                </CardTitle>
                {editingId && (
                  <Button type="button" variant="ghost" size="icon" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-primary font-bold">ब्रँड / कंपनीचे नाव</Label>
                  <Input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value || "")} placeholder="उदा. गोदरेज गोल्ड" className="border-primary/20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase font-bold text-primary">Cattlefeed Type</Label>
                    <Select value={compoundedType} onValueChange={setCompoundedType}>
                      <SelectTrigger className="h-9 border-primary/20">
                        <SelectValue placeholder="निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Type 1">Type 1</SelectItem>
                        <SelectItem value="Type 2">Type 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase font-bold text-primary">खाद्य प्रकार</Label>
                    <Select value={feedType} onValueChange={setFeedType}>
                      <SelectTrigger className="h-9 border-primary/20">
                        <SelectValue placeholder="प्रकार निवडा" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pellet">पेलेट (Pellet)</SelectItem>
                        <SelectItem value="Mesh">मेश (Mesh)</SelectItem>
                        <SelectItem value="Crumb">क्रंब (Crumb)</SelectItem>
                        <SelectItem value="Cubes">क्यूब्स (Cubes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs text-primary font-bold"><Package className="h-3 w-3" /> बेस वजन (किग्रॅ)</Label>
                    <Input type="number" value={bagWeight} onChange={(e) => setBagWeight(e.target.value || "")} placeholder="किग्रॅ" className="border-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs text-primary font-bold"><IndianRupee className="h-3 w-3" /> बेस किंमत (₹)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value || "")} placeholder="₹" className="border-primary/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-primary font-bold">उपलब्ध पॅकिंग (उदा. 50, 25, 10)</Label>
                  <Input 
                    value={availableWeights} 
                    onChange={(e) => setAvailableWeights(e.target.value || "")} 
                    placeholder="वजन स्वल्पविराम देऊन लिहा" 
                    className="border-primary/20"
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-primary font-bold block mb-2 text-sm uppercase flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" /> पोषण मूल्ये (Nutrient Composition)
                  </Label>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-primary/10">
                    <NutrientInput label="Crude Protein (%)" field="protein" />
                    <NutrientInput label="Crude Fat (%)" field="fat" />
                    <NutrientInput label="Crude Fiber (%)" field="fiber" />
                    <NutrientInput label="Acid Insoluble Ash (%)" field="ash" />
                    <NutrientInput label="Calcium (%)" field="calcium" />
                    <NutrientInput label="Total Phosphorus (%)" field="totalPhosphorus" />
                    <NutrientInput label="Available Phosphorus (%)" field="availablePhosphorus" />
                    <NutrientInput label="Aflatoxin B1 (ppb)" field="aflatoxin" />
                    <NutrientInput label="Urea (%)" field="urea" />
                    <NutrientInput label="Moisture (%)" field="moisture" />
                  </div>
                  <div className="mt-2 space-y-1">
                    <Label className="text-[10px] text-primary font-bold">इतर पोषक मूल्ये</Label>
                    <Input value={nutrition.others} onChange={(e) => setNutrition({...nutrition, others: e.target.value})} className="h-8 text-xs border-primary/20" placeholder="इतर..." />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-primary font-bold text-sm">मुख्य घटक (Ingredients)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient} className="h-7 text-[10px] border-primary text-primary">
                      <Plus className="h-3 w-3 mr-1" /> जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input 
                          placeholder="उदा. मका (Maize)" 
                          value={ing.ingredient} 
                          onChange={(e) => handleIngredientChange(idx, "ingredient", e.target.value)}
                          className="h-8 flex-1 text-xs border-primary/20"
                        />
                        <Input 
                          placeholder="%" 
                          value={ing.percentage} 
                          onChange={(e) => handleIngredientChange(idx, "percentage", e.target.value)}
                          className="h-8 w-14 text-xs border-primary/20"
                          type="number"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveIngredient(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-primary font-bold text-sm">अ‍ॅड पॉइंट्स (इतर)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPoint} className="h-7 text-[10px] border-primary text-primary">
                      <PlusCircle className="h-3 w-3 mr-1" /> जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customPoints.map((pt, idx) => (
                      <div key={idx} className="p-2 border rounded-lg bg-muted/10 relative space-y-1">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => handleRemovePoint(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Label className="text-[10px] text-primary">मुद्दा {idx + 1}</Label>
                        <Textarea 
                          placeholder="उदा. उच्च दूध वाढ, वाजवी किंमत" 
                          value={pt.point} 
                          onChange={(e) => handlePointChange(idx, e.target.value)}
                          className="h-16 text-xs border-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {editingId && (
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                      रद्द
                    </Button>
                  )}
                  <Button type="button" className="flex-1 bg-primary shadow-md hover:bg-primary/90" onClick={handleSaveBrand}>
                    <Save className="mr-2 h-4 w-4" /> {editingId ? "अपडेट" : "जतन करा"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg text-primary">मास्टर ब्रँड यादी ({filteredBrands.length})</CardTitle>
                
                <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg border border-primary/20 min-w-[250px]">
                  <Filter className="h-4 w-4 text-primary" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-primary uppercase">ब्रँड फिल्टर करा</span>
                    <Select value={filterBrandId} onValueChange={setFilterBrandId}>
                      <SelectTrigger className="h-8 bg-white text-xs border-primary/20">
                        <SelectValue placeholder="सर्व ब्रँड" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">सर्व ब्रँड</SelectItem>
                        {brands.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredBrands.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    निवडलेल्या फिल्टरनुसार ब्रँड उपलब्ध नाहीत.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBrands.map((brand) => (
                      <div key={brand.id} className="p-4 border rounded-xl bg-white relative group hover:border-primary/40 transition-all shadow-sm">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewingBrand(brand)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEditBrand(brand)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteBrand(brand.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <h3 className="font-bold text-base text-primary leading-tight pr-12">{brand.name}</h3>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-[8px] h-3.5 border-primary/30 text-primary">{brand.compoundedType}</Badge>
                          <Badge variant="outline" className="text-[8px] h-3.5 border-primary/30 text-primary">{brand.feedType}</Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-3 border-t pt-2">
                          <p className="font-bold text-primary">₹{brand.price}</p>
                          <p className="text-muted-foreground">{brand.bagWeight} किग्रॅ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!viewingBrand} onOpenChange={(open) => !open && setViewingBrand(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 dialog-content-print shadow-none">
          <DialogHeader className="mb-2 no-print">
            <DialogTitle className="flex items-center gap-2 text-primary border-b pb-1">
              <Package className="h-5 w-5" /> ब्रँड तपशील
            </DialogTitle>
          </DialogHeader>
          <div className="hidden print:block text-center border-b-2 border-black pb-1 mb-4">
            <h1 className="text-[14pt] font-black uppercase">ब्रँड तपशील अहवाल</h1>
            <p className="text-[10pt] font-black">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
          </div>
          {viewingBrand && <DetailedBrandTable brand={viewingBrand} />}
          <div className="mt-6 flex justify-end no-print">
            <Button onClick={() => window.print()} className="gap-2 bg-black text-white">
              <Printer className="h-4 w-4" /> प्रिंट अहवाल
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-[210mm] max-h-[95vh] overflow-y-auto p-4 dialog-content-print shadow-none border-2">
          <DialogHeader className="border-b pb-2 mb-4 no-print">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-6 w-6" /> संपूर्ण मास्टर ब्रँड रिपोर्ट
              </DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="gap-2 h-8 text-xs border-black bg-black text-white hover:bg-black/90">
                <Printer className="h-4 w-4" /> प्रिंट अहवाल
              </Button>
            </div>
          </DialogHeader>
          
          <div className="hidden print:block text-center border-b-2 border-black pb-1 mb-4">
            <h1 className="text-[14pt] font-black uppercase">मास्टर ब्रँड अहवाल</h1>
            <p className="text-[10pt] font-black">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
          </div>

          <div className="grid grid-cols-1 print:grid-cols-1 gap-8">
            {filteredBrands.map((brand, index) => (
              <div key={brand.id} className="border border-black p-4 rounded-none bg-white shadow-none break-inside-avoid print:mt-1">
                <h3 className="text-[12pt] font-black text-black border-b-2 border-black mb-1.5 pb-0.5 bg-slate-100 px-2 uppercase">
                  {index + 1}. {brand.name} तपशील
                </h3>
                <DetailedBrandTable brand={brand} isPrint={true} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}