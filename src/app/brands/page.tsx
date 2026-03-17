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
    <TableRow className="hover:bg-transparent border-b">
      <TableHead className="w-[45%] font-bold bg-muted/5 py-1 px-2 text-[10px] md:text-xs h-auto border-r leading-tight">{label}</TableHead>
      <TableCell className="py-1 px-2 text-[10px] md:text-xs h-auto leading-tight">{value || '-'}</TableCell>
    </TableRow>
  );

  const DetailedBrandTable = ({ brand, isPrint = false }: { brand: MasterBrand, isPrint?: boolean }) => (
    <div className={`space-y-2 py-1 ${isPrint ? 'space-y-1' : ''}`}>
      <section className="break-inside-avoid">
        <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">१. सामान्य माहिती</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <BrandDataRow label="ब्रँड / कंपनी" value={brand.name} />
            <BrandDataRow label="खाद्य प्रकार" value={brand.feedType} />
            <BrandDataRow label="वजन / किंमत" value={`${brand.bagWeight} किग्रॅ / ₹${brand.price}`} />
            <BrandDataRow label="उपलब्ध पॅकिंग" value={brand.availableWeights} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">२. पोषण मूल्ये (%)</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <TableRow className="hover:bg-transparent border-b">
              <TableCell className="w-1/2 p-1 text-[10px] border-r">प्रोटीन: <b>{brand.nutrition.protein}%</b></TableCell>
              <TableCell className="p-1 text-[10px]">फॅट: <b>{brand.nutrition.fat}%</b></TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent border-b">
              <TableCell className="w-1/2 p-1 text-[10px] border-r">फायबर: <b>{brand.nutrition.fiber}%</b></TableCell>
              <TableCell className="p-1 text-[10px]">कॅल्शियम: <b>{brand.nutrition.calcium}%</b></TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent border-b">
              <TableCell className="w-1/2 p-1 text-[10px] border-r">फॉस्फरस: <b>{brand.nutrition.phosphorus}%</b></TableCell>
              <TableCell className="p-1 text-[10px]">मीठ: <b>{brand.nutrition.salt}%</b></TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent border-b">
              <TableCell colSpan={2} className="p-1 text-[10px]">मिनरल मिक्स: <b>{brand.nutrition.mineralMix}%</b></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {brand.ingredients && brand.ingredients.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">३. घटक (Ingredients)</h4>
          <div className="flex flex-wrap gap-1">
            {brand.ingredients.map((ing, idx) => (
              <Badge key={idx} variant="outline" className="text-[8px] py-0 px-1 font-normal">
                {ing.ingredient} ({ing.percentage}%)
              </Badge>
            ))}
          </div>
        </section>
      )}

      {brand.customPoints && brand.customPoints.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">४. ॲड पॉइंट्स</h4>
          <Table className="border rounded-sm">
            <TableBody>
              {brand.customPoints.map((pt, idx) => (
                <BrandDataRow key={idx} label={`मुद्दा ${idx + 1}`} value={pt.point} />
              ))}
            </TableBody>
          </Table>
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
                        <SelectItem value="all">सर्व ब्रँड (All Brands)</SelectItem>
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

      <div className="hidden print:block p-4 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-2 mb-4">
          <h1 className="text-xl font-bold uppercase">मास्टर ब्रँड लिस्ट रिपोर्ट</h1>
          <p className="text-[10px]">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
          {filterBrandId !== "all" && (
            <p className="text-[10px] mt-1 font-bold">फिल्टर: {brands.find(b => b.id === filterBrandId)?.name}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredBrands.map((brand, index) => (
            <div key={brand.id} className="border border-gray-200 p-2 rounded-sm break-inside-avoid shadow-none">
              <h2 className="text-xs font-bold border-b border-gray-200 mb-2 pb-1 text-primary">{index + 1}. {brand.name}</h2>
              <DetailedBrandTable brand={brand} isPrint={true} />
            </div>
          ))}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader className="border-b pb-2 mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-6 w-6" /> संपूर्ण मास्टर ब्रँड रिपोर्ट
              </DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="gap-2 h-8 text-xs">
                <Printer className="h-4 w-4" /> प्रिंट
              </Button>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBrands.map((brand, index) => (
              <div key={brand.id} className="border p-3 rounded-lg bg-white shadow-sm break-inside-avoid">
                <h3 className="text-sm font-bold text-primary border-b mb-3 pb-1">
                  {index + 1}. {brand.name} ({brand.feedType})
                </h3>
                <DetailedBrandTable brand={brand} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
