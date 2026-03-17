"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrandStore, MasterBrand } from "@/lib/brand-store";
import { Plus, Trash2, Save, Package, IndianRupee } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CowIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 15c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H7z" />
    <path d="M17 15l1.5-3.5c.3-.7.1-1.5-.5-2L15 7l-1-2h-4l-1 2-3 2.5c-.6.5-.8 1.3-.5 2L7 15" />
    <path d="M9 5c0-1.7-1.3-3-3-3s-3 1.3-3 3" />
    <path d="M15 5c0-1.7 1.3-3 3-3s3 1.3 3 3" />
  </svg>
);

export default function BrandManagement() {
  const { getBrands, addBrand, deleteBrand } = useBrandStore();
  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [feedType, setFeedType] = useState("Pellet");
  const [bagWeight, setBagWeight] = useState("");
  const [price, setPrice] = useState("");
  const [nutrition, setNutrition] = useState({
    protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: ""
  });
  const [ingredients, setIngredients] = useState([{ ingredient: "", percentage: "" }]);

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

  const handleSaveBrand = () => {
    if (!newBrandName) {
      toast({ variant: "destructive", title: "त्रुटी", description: "ब्रँडचे नाव आवश्यक आहे." });
      return;
    }
    addBrand({
      name: newBrandName,
      feedType,
      bagWeight,
      price,
      nutrition,
      ingredients
    });
    setBrands(getBrands());
    resetForm();
    toast({ title: "यशस्वी", description: "नवीन ब्रँड मास्टर लिस्टमध्ये जतन झाला!" });
  };

  const handleDeleteBrand = (id: string) => {
    if (confirm("हा ब्रँड हटवायचा आहे का?")) {
      deleteBrand(id);
      setBrands(getBrands());
      toast({ title: "यशस्वी", description: "ब्रँड हटवण्यात आला आहे." });
    }
  };

  const resetForm = () => {
    setNewBrandName("");
    setFeedType("Pellet");
    setBagWeight("");
    setPrice("");
    setNutrition({ protein: "", fat: "", fiber: "", calcium: "", phosphorus: "", salt: "", mineralMix: "", others: "" });
    setIngredients([{ ingredient: "", percentage: "" }]);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">पशुखाद्य ब्रँड व्यवस्थापन</h1>
            <p className="text-muted-foreground text-sm md:text-base">येथे तुम्ही मास्टर ब्रँड आणि त्यांचे घटक जतन करू शकता.</p>
          </div>
          <div className="bg-primary/5 p-3 rounded-full hidden md:block">
            <CowIcon className="h-10 w-10 text-primary opacity-40" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Brand Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">नवीन ब्रँड जोडा</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ब्रँड / कंपनीचे नाव</Label>
                  <Input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="उदा. गोदरेज गोल्ड" />
                </div>

                <div className="grid grid-cols-1 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Package className="h-3 w-3" /> वजन (किग्रॅ)</Label>
                    <Input type="number" value={bagWeight} onChange={(e) => setBagWeight(e.target.value)} placeholder="उदा. 50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> किंमत (₹)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="उदा. 1500" />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="text-primary font-bold block mb-2">पोषण मूल्ये (%)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(nutrition).map((key) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key === 'mineralMix' ? 'Mineral Mix' : key}</Label>
                        <Input 
                          type="number" 
                          value={(nutrition as any)[key]} 
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
                    <Button variant="outline" size="sm" onClick={handleAddIngredient}>
                      <Plus className="h-3 w-3 mr-1" /> घटक
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input 
                          placeholder="घटक" 
                          value={ing.ingredient} 
                          onChange={(e) => handleIngredientChange(idx, "ingredient", e.target.value)}
                          className="h-8 flex-1"
                        />
                        <Input 
                          placeholder="%" 
                          value={ing.percentage} 
                          onChange={(e) => handleIngredientChange(idx, "percentage", e.target.value)}
                          className="h-8 w-16"
                          type="number"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveIngredient(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-primary mt-4 shadow-md" onClick={handleSaveBrand}>
                  <Save className="mr-2 h-4 w-4" /> ब्रँड जतन करा
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Brands List */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">मास्टर ब्रँड लिस्ट</CardTitle>
              </CardHeader>
              <CardContent>
                {brands.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">कोणतेही ब्रँड उपलब्ध नाहीत.</div>
                ) : (
                  <div className="space-y-4">
                    {brands.map((brand) => (
                      <div key={brand.id} className="p-4 border rounded-lg bg-muted/20 relative group hover:border-primary/30 transition-colors">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteBrand(brand.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-primary">{brand.name}</h3>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{brand.feedType}</span>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-bold text-accent text-sm">₹{brand.price}</p>
                            <p className="text-muted-foreground">{brand.bagWeight} किग्रॅ</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                          <div><span className="font-semibold">प्रोटीन:</span> {brand.nutrition.protein}%</div>
                          <div><span className="font-semibold">फॅट:</span> {brand.nutrition.fat}%</div>
                          <div><span className="font-semibold">फायबर:</span> {brand.nutrition.fiber}%</div>
                          <div><span className="font-semibold">कॅल्शियम:</span> {brand.nutrition.calcium}%</div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-semibold mb-1">घटक:</p>
                          <div className="flex flex-wrap gap-2">
                            {brand.ingredients.map((ing, i) => (
                              <span key={i} className="bg-white px-2 py-0.5 rounded border text-[10px] shadow-sm">
                                {ing.ingredient} ({ing.percentage}%)
                              </span>
                            ))}
                          </div>
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
    </div>
  );
}