
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandStore, MasterBrand } from "@/lib/brand-store";
import { Plus, Trash2, Save, Package, IndianRupee, Layers, Edit2, X, Eye, Printer, FileText, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  
  const [newBrandName, setNewBrandName] = useState("");
  const [feedType, setFeedType] = useState("Pellet");
  const [bagWeight, setBagWeight] = useState("");
  const [availableWeights, setAvailableWeights] = useState("");
  const [price, setPrice] = useState("");
  const [nutrition, setNutrition] = useState({
    protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: ""
  });
  const [ingredients, setIngredients] = useState([{ ingredient: "", percentage: "" }]);
  const [customPoints, setCustomPoints] = useState<Array<{ point: string, value: string }>>([]);

  useEffect(() => {
    setBrands(getBrands());
  }, []);

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
    setCustomPoints([...customPoints, { point: "", value: "" }]);
  };

  const handleRemovePoint = (index: number) => {
    setCustomPoints(customPoints.filter((_, i) => i !== index));
  };

  const handlePointChange = (index: number, field: string, value: string) => {
    const newPoints = [...customPoints];
    (newPoints[index] as any)[field] = value;
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
    setCustomPoints(brand.customPoints || []);
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
      customPoints
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
      <TableHead className="w-1/2 font-bold bg-muted/10 py-1 px-2 text-[10px] md:text-xs h-auto border-r">{label}</TableHead>
      <TableCell className="py-1 px-2 text-[10px] md:text-xs h-auto">{value || '-'}</TableCell>
    </TableRow>
  );

  const DetailedBrandTable = ({ brand, isPrint = false }: { brand: MasterBrand, isPrint?: boolean }) => (
    <div className={`space-y-3 py-2 ${isPrint ? 'space-y-1' : ''}`}>
      <section>
        <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">१. सामान्य माहिती</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <BrandDataRow label="ब्रँड / कंपनीचे नाव" value={brand.name} />
            <BrandDataRow label="खाद्य प्रकार" value={brand.feedType} />
            <BrandDataRow label="बेस वजन (किग्रॅ)" value={brand.bagWeight} />
            <BrandDataRow label="बेस किंमत (₹)" value={brand.price} />
            <BrandDataRow label="उपलब्ध पॅकिंग (किग्रॅ)" value={brand.availableWeights} />
          </TableBody>
        </Table>
      </section>

      <section>
        <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">२. पोषण मूल्ये (%)</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <BrandDataRow label="प्रोटीन" value={brand.nutrition.protein + "%"} />
            <BrandDataRow label="फॅट" value={brand.nutrition.fat + "%"} />
            <BrandDataRow label="फायबर" value={brand.nutrition.fiber + "%"} />
            <BrandDataRow label="कॅल्शियम" value={brand.nutrition.calcium + "%"} />
            <BrandDataRow label="फॉस्फरस" value={brand.nutrition.phosphorus + "%"} />
            <BrandDataRow label="मीठ" value={brand.nutrition.salt + "%"} />
            <BrandDataRow label="मिनरल मिक्स" value={brand.nutrition.mineralMix + "%"} />
          </TableBody>
        </Table>
      </section>

      {brand.ingredients && brand.ingredients.length > 0 && (
        <section>
          <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">३. मुख्य घटक (Ingredients)</h4>
          <Table className="border rounded-sm">
            <TableBody>
              {brand.ingredients.map((ing, idx) => (
                <BrandDataRow key={idx} label={ing.ingredient} value={ing.percentage + "%"} />
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {brand.customPoints && brand.customPoints.length > 0 && (
        <section>
          <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">४. ऍड पॉईंट्स (इतर मुद्दे)</h4>
          <Table className="border rounded-sm">
            <TableBody>
              {brand.customPoints.map((pt, idx) => (
                <BrandDataRow key={idx} label={pt.point} value={pt.value} />
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
              <Printer className="h-4 w-4" /> प्रिंट रिपोर्ट
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
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
                    <Label className="flex items-center gap-1"><Package className="h-3 w-3" /> बेस वजन (किग्रॅ)</Label>
                    <Input type="number" value={bagWeight} onChange={(e) => setBagWeight(e.target.value || "")} placeholder="उदा. 50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> बेस किंमत (₹)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value || "")} placeholder="उदा. 1500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Layers className="h-3 w-3" /> उपलब्ध पॅकिंग (बॅग वजन किग्रॅ)</Label>
                  <Input 
                    value={availableWeights} 
                    onChange={(e) => setAvailableWeights(e.target.value || "")} 
                    placeholder="उदा. 50, 25, 10" 
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-primary font-bold block mb-2">पोषण मूल्ये (%)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(nutrition).map((key) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key === 'mineralMix' ? 'Mineral Mix' : key}</Label>
                        <Input 
                          type="number" 
                          value={(nutrition as any)[key] || ""} 
                          onChange={(e) => setNutrition({...nutrition, [key]: e.target.value})}
                          placeholder="%"
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-primary font-bold">घटक (Ingredients)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> घटक जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input 
                          placeholder="घटकाचे नाव" 
                          value={ing.ingredient} 
                          onChange={(e) => handleIngredientChange(idx, "ingredient", e.target.value)}
                          className="h-8 flex-1 text-xs"
                        />
                        <Input 
                          placeholder="%" 
                          value={ing.percentage} 
                          onChange={(e) => handleIngredientChange(idx, "percentage", e.target.value)}
                          className="h-8 w-16 text-xs"
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
                    <Label className="text-primary font-bold">ऍड पॉईंट्स (इतर मुद्दे)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPoint} className="h-7 text-xs">
                      <PlusCircle className="h-3 w-3 mr-1" /> मुद्दा जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customPoints.map((pt, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-muted/20 relative space-y-2">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => handleRemovePoint(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Input 
                          placeholder="मुद्दा (उदा. एक्सपायरी)" 
                          value={pt.point} 
                          onChange={(e) => handlePointChange(idx, "point", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Textarea 
                          placeholder="माहिती" 
                          value={pt.value} 
                          onChange={(e) => handlePointChange(idx, "value", e.target.value)}
                          className="h-16 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {editingId && (
                    <Button type="button" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                      रद्द करा
                    </Button>
                  )}
                  <Button type="button" className="flex-1 bg-primary shadow-md" onClick={handleSaveBrand}>
                    <Save className="mr-2 h-4 w-4" /> {editingId ? "अपडेट करा" : "ब्रँड जतन करा"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">मास्टर ब्रँड यादी</CardTitle>
              </CardHeader>
              <CardContent>
                {brands.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">कोणतेही ब्रँड उपलब्ध नाहीत.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brands.map((brand) => (
                      <div key={brand.id} className="p-4 border rounded-lg bg-muted/20 relative group hover:border-primary/30 transition-colors">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewingBrand(brand)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEditBrand(brand)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteBrand(brand.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <h3 className="font-bold text-lg text-primary">{brand.name}</h3>
                        <Badge variant="outline" className="text-[10px] mb-2">{brand.feedType}</Badge>
                        <div className="flex justify-between items-center text-xs">
                          <p className="font-bold text-accent">₹{brand.price}</p>
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

      <div className="hidden print:block p-4 space-y-4 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-2 mb-4">
          <h1 className="text-xl font-bold uppercase">मास्टर ब्रँड लिस्ट रिपोर्ट (Table Format)</h1>
          <p className="text-[10px]">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {brands.map((brand, index) => (
            <div key={brand.id} className="border border-black p-2 rounded-sm break-inside-avoid">
              <h2 className="text-sm font-bold border-b border-black mb-2">{index + 1}. {brand.name}</h2>
              <DetailedBrandTable brand={brand} isPrint={true} />
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!viewingBrand} onOpenChange={(open) => !open && setViewingBrand(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Package className="h-5 w-5" /> ब्रँडची सविस्तर माहिती
            </DialogTitle>
          </DialogHeader>
          {viewingBrand && <DetailedBrandTable brand={viewingBrand} />}
        </DialogContent>
      </Dialog>

      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4 mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-6 w-6" /> संपूर्ण मास्टर ब्रँड रिपोर्ट (Table Format)
              </DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" /> प्रिंट
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-8">
            {brands.map((brand, index) => (
              <div key={brand.id} className="border p-4 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-bold text-primary border-b-2 mb-4 pb-1">
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
