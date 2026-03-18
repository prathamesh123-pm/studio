"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandStore, MasterBrand } from "@/lib/brand-store";
import { Plus, Trash2, Save, Package, IndianRupee, Edit2, X, Eye, Printer, FileText, PlusCircle, Search, Filter } from "lucide-react";
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
  const [feedType, setFeedType] = useState("Pellet");
  const [bagWeight, setBagWeight] = useState("");
  const [availableWeights, setAvailableWeights] = useState("");
  const [price, setPrice] = useState("");
  const [nutrition, setNutrition] = useState({
    protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: ""
  });
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
    setFeedType(brand.feedType || "Pellet");
    setBagWeight(brand.bagWeight || "");
    setAvailableWeights(brand.availableWeights || "");
    setPrice(brand.price || "");
    setNutrition(brand.nutrition || {
      protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: ""
    });
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
    setFeedType("Pellet");
    setBagWeight("");
    setAvailableWeights("");
    setPrice("");
    setNutrition({ protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: "" });
    setIngredients([{ ingredient: "", percentage: "" }]);
    setCustomPoints([]);
    setEditingId(null);
  };

  const BrandDataRow = ({ label, value }: { label: string, value: any }) => (
    <TableRow className="hover:bg-transparent border-b border-black">
      <TableHead className="w-[45%] font-black bg-gray-50 py-0.5 px-2 text-[10.5pt] h-auto border-r border-black leading-tight text-black print:font-black">{label}</TableHead>
      <TableCell className="py-0.5 px-2 text-[11pt] h-auto leading-tight text-black font-black">{value || '-'}</TableCell>
    </TableRow>
  );

  const DetailedBrandTable = ({ brand, isPrint = false }: { brand: MasterBrand, isPrint?: boolean }) => (
    <div className={`space-y-0.5 py-0.5 ${isPrint ? 'space-y-0.5' : ''}`}>
      <section className="break-inside-avoid">
        <h4 className="text-[11pt] font-black mb-0 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">१. सामान्य माहिती</h4>
        <Table className="border border-black rounded-none overflow-hidden table-fixed">
          <TableBody>
            <BrandDataRow label="ब्रँड / कंपनी" value={brand.name} />
            <BrandDataRow label="खाद्य प्रकार" value={brand.feedType} />
            <BrandDataRow label="वजन / किंमत" value={`${brand.bagWeight} किग्रॅ / ₹${brand.price}`} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[11pt] font-black mb-0 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">२. पोषण मूल्ये (%)</h4>
        <Table className="border border-black rounded-none overflow-hidden table-fixed">
          <TableBody>
            <TableRow className="hover:bg-transparent border-b border-black h-7">
              <TableCell className="w-1/2 p-1 text-[11pt] border-r border-black text-black font-black">प्रोटीन: {brand.nutrition.protein}%</TableCell>
              <TableCell className="p-1 text-[11pt] text-black font-black">फॅट: {brand.nutrition.fat}%</TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent border-b border-black h-7">
              <TableCell className="w-1/2 p-1 text-[11pt] border-r border-black text-black font-black">फायबर: {brand.nutrition.fiber}%</TableCell>
              <TableCell className="p-1 text-[11pt] text-black font-black">कॅल्शियम: {brand.nutrition.calcium}%</TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent h-7">
              <TableCell className="w-1/2 p-1 text-[11pt] border-r border-black font-black">मीठ: {brand.nutrition.salt}%</TableCell>
              <TableCell className="p-1 text-[11pt] font-black">मिनरल: {brand.nutrition.mineralMix}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {brand.ingredients && brand.ingredients.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[11pt] font-black mb-0 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">३. मुख्य घटक</h4>
          <p className="text-[10.5pt] font-black text-black leading-tight p-1 border border-black border-t-0">
            {brand.ingredients.map(ing => `${ing.ingredient} (${ing.percentage}%)`).join(", ")}
          </p>
        </section>
      )}

      {brand.customPoints && brand.customPoints.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[11pt] font-black mb-0 border-b border-black pb-0.5 text-black uppercase bg-gray-100 px-1">४. इतर माहिती</h4>
          <div className="text-[10.5pt] font-black text-black leading-tight p-1 border border-black border-t-0 min-h-[30px]">
            {brand.customPoints.map((pt, idx) => (
              <div key={idx} className="mb-0.5">• {pt.point}</div>
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
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">
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
                  <Label>ब्रँड / कंपनीचे नाव</Label>
                  <Input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value || "")} placeholder="उदा. गोदरेज गोल्ड" />
                </div>

                <div className="space-y-2">
                  <Label>खाद्य प्रकार</Label>
                  <Select value={feedType} onValueChange={setFeedType}>
                    <SelectTrigger>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs"><Package className="h-3 w-3" /> बेस वजन (किग्रॅ)</Label>
                    <Input type="number" value={bagWeight} onChange={(e) => setBagWeight(e.target.value || "")} placeholder="किग्रॅ" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs"><IndianRupee className="h-3 w-3" /> बेस किंमत (₹)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value || "")} placeholder="₹" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">उपलब्ध पॅकिंग (उदा. 50, 25, 10)</Label>
                  <Input 
                    value={availableWeights} 
                    onChange={(e) => setAvailableWeights(e.target.value || "")} 
                    placeholder="वजन स्वल्पविराम देऊन लिहा" 
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-primary font-bold block mb-2 text-sm">पोषण मूल्ये (%)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(nutrition).map((key) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[10px] capitalize">{key}</Label>
                        <Input 
                          type="number" 
                          value={(nutrition as any)[key] || ""} 
                          onChange={(e) => setNutrition({...nutrition, [key]: e.target.value})}
                          placeholder="%"
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-primary font-bold text-sm">घटक (Ingredients)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient} className="h-7 text-[10px]">
                      <Plus className="h-3 w-3 mr-1" /> जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input 
                          placeholder="नाव" 
                          value={ing.ingredient} 
                          onChange={(e) => handleIngredientChange(idx, "ingredient", e.target.value)}
                          className="h-8 flex-1 text-xs"
                        />
                        <Input 
                          placeholder="%" 
                          value={ing.percentage} 
                          onChange={(e) => handleIngredientChange(idx, "percentage", e.target.value)}
                          className="h-8 w-14 text-xs"
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
                    <Label className="text-primary font-bold text-sm">ॲड पॉइंट्स (इतर)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPoint} className="h-7 text-[10px]">
                      <PlusCircle className="h-3 w-3 mr-1" /> जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customPoints.map((pt, idx) => (
                      <div key={idx} className="p-2 border rounded-lg bg-muted/10 relative space-y-1">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => handleRemovePoint(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Label className="text-[10px]">मुद्दा {idx + 1}</Label>
                        <Textarea 
                          placeholder="माहिती लिहा..." 
                          value={pt.point} 
                          onChange={(e) => handlePointChange(idx, e.target.value)}
                          className="h-16 text-xs"
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
                  <Button type="button" className="flex-1 bg-primary shadow-md" onClick={handleSaveBrand}>
                    <Save className="mr-2 h-4 w-4" /> {editingId ? "अपडेट" : "जतन करा"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg">मास्टर ब्रँड यादी ({filteredBrands.length})</CardTitle>
                
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
                        <Badge variant="outline" className="text-[10px] my-1.5 h-4">{brand.feedType}</Badge>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-primary border-b pb-1">
              <Package className="h-5 w-5" /> ब्रँड तपशील
            </DialogTitle>
          </DialogHeader>
          {viewingBrand && <DetailedBrandTable brand={viewingBrand} />}
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

          <div className="grid grid-cols-1 print:grid-cols-2 gap-4 print:gap-x-4 print:gap-y-6">
            {filteredBrands.map((brand, index) => (
              <div key={brand.id} className="border border-black p-2 rounded-none bg-white shadow-none break-inside-avoid print:mt-1">
                <h3 className="text-[11pt] font-black text-black border-b border-black mb-1 pb-0.5 bg-gray-50 px-1">
                  {index + 1}. {brand.name}
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
