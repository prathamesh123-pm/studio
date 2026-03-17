
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { useSupplierStore, Supplier } from "@/lib/supplier-store";
import { Plus, Trash2, Save, Store, Phone, MapPin, UserPlus, Truck, CreditCard, ShoppingBag, Eye, Edit2, X, Clock } from "lucide-react";
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

export default function SupplierManagement() {
  const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  
  // Form States
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [contact, setContact] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [address, setAddress] = useState("");
  const [supplierType, setSupplierType] = useState<'Retailer' | 'Wholesaler' | 'Distributor'>('Retailer');
  const [mainBrands, setMainBrands] = useState("");
  const [providesDelivery, setProvidesDelivery] = useState(false);
  const [providesCredit, setProvidesCredit] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setSuppliers(getSuppliers());
  };

  const handleSaveSupplier = () => {
    if (!name || !contact || !shopName) {
      toast({ variant: "destructive", title: "त्रुटी", description: "नाव, दुकानाचे नाव आणि संपर्क आवश्यक आहे." });
      return;
    }

    const supplierData = {
      name,
      shopName,
      contact,
      district,
      taluka,
      address,
      supplierType,
      mainBrands,
      providesDelivery,
      providesCredit
    };

    if (editingId) {
      updateSupplier(editingId, supplierData);
      toast({ title: "यशस्वी", description: "पुरवठादाराची माहिती अपडेट झाली!" });
    } else {
      addSupplier(supplierData);
      toast({ title: "यशस्वी", description: "पुरवठादाराची माहिती जतन झाली!" });
    }

    loadSuppliers();
    resetForm();
    setEditingId(null);
  };

  const handleEdit = (s: Supplier) => {
    setEditingId(s.id);
    setName(s.name || "");
    setShopName(s.shopName || "");
    setContact(s.contact || "");
    setDistrict(s.district || "");
    setTaluka(s.taluka || "");
    setAddress(s.address || "");
    setSupplierType(s.supplierType || 'Retailer');
    setMainBrands(s.mainBrands || "");
    setProvidesDelivery(s.providesDelivery || false);
    setProvidesCredit(s.providesCredit || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("हा पुरवठादार हटवायचा आहे का?")) {
      deleteSupplier(id);
      loadSuppliers();
      toast({ title: "यशस्वी", description: "पुरवठादार हटवण्यात आला आहे." });
    }
  };

  const resetForm = () => {
    setName("");
    setShopName("");
    setContact("");
    setDistrict("");
    setTaluka("");
    setAddress("");
    setSupplierType('Retailer');
    setMainBrands("");
    setProvidesDelivery(false);
    setProvidesCredit(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">पुरवठादार व्यवस्थापन (Suppliers)</h1>
            <p className="text-muted-foreground text-sm md:text-base">तुमच्या संपर्कातील पशुखाद्य पुरवठादारांची यादी येथे जतन करा.</p>
          </div>
          <div className="bg-primary/5 p-3 rounded-full hidden md:block border border-primary/10">
            <Store className="h-8 w-8 text-primary opacity-60" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add/Edit Form */}
          <div className="lg:col-span-4">
            <Card className="border-primary/20 shadow-md sticky top-24">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> 
                  {editingId ? "पुरवठादार संपादित करा" : "नवीन पुरवठादार जोडा"}
                </CardTitle>
                {editingId && (
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>पुरवठादाराचे नाव</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="उदा. विशाल कदम" />
                  </div>
                  <div className="space-y-2">
                    <Label>दुकानाचे / एजन्सीचे नाव</Label>
                    <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="उदा. महालक्ष्मी पशुखाद्य" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>संपर्क क्रमांक</Label>
                    <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="मोबाईल नंबर" maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>पुरवठादार प्रकार</Label>
                    <Select value={supplierType} onValueChange={(v: any) => setSupplierType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Retailer">किरकोळ (Retailer)</SelectItem>
                        <SelectItem value="Wholesaler">घाऊक (Wholesaler)</SelectItem>
                        <SelectItem value="Distributor">डिस्ट्रीब्युटर</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>मुख्य ब्रँड्स (Main Brands)</Label>
                  <Input value={mainBrands} onChange={(e) => setMainBrands(e.target.value)} placeholder="उदा. गोदरेज, कपिला, अमूल" />
                </div>
                
                <LocationSelector 
                  onLocationChange={(d, t) => { setDistrict(d); setTaluka(t); }}
                  defaultDistrict={district}
                  defaultTaluka={taluka}
                />

                <div className="space-y-2">
                  <Label>पूर्ण पत्ता</Label>
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="गावाचे नाव, गल्ली इ." className="h-16" />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="delivery" checked={providesDelivery} onCheckedChange={(v: boolean) => setProvidesDelivery(v)} />
                    <Label htmlFor="delivery" className="text-xs cursor-pointer flex items-center gap-1"><Truck className="h-3 w-3" /> डिलिव्हरी सुविधा</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="credit" checked={providesCredit} onCheckedChange={(v: boolean) => setProvidesCredit(v)} />
                    <Label htmlFor="credit" className="text-xs cursor-pointer flex items-center gap-1"><CreditCard className="h-3 w-3" /> उधारी सुविधा</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingId && (
                    <Button variant="outline" className="flex-1" onClick={resetForm}>रद्द करा</Button>
                  )}
                  <Button className="flex-1 bg-primary shadow-sm" onClick={handleSaveSupplier}>
                    <Save className="mr-2 h-4 w-4" /> {editingId ? "अपडेट करा" : "जतन करा"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* List View */}
          <div className="lg:col-span-8">
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">पुरवठादारांची यादी ({suppliers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {suppliers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                    <Store className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    अद्याप कोणतीही माहिती जोडलेली नाही.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suppliers.map((s) => (
                      <div key={s.id} className="p-4 border rounded-xl bg-white relative group hover:border-primary/40 transition-all shadow-sm flex flex-col">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => setViewingSupplier(s)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => handleEdit(s)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase bg-primary/5 border-primary/20 text-primary">
                              {s.supplierType === 'Retailer' ? 'किरकोळ' : s.supplierType === 'Wholesaler' ? 'घाऊक' : 'डिस्ट्रीब्युटर'}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg text-primary leading-tight pr-12">{s.shopName}</h3>
                          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                            <UserPlus className="h-3.5 w-3.5" /> {s.name}
                          </p>
                        </div>

                        {s.mainBrands && (
                          <div className="mb-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3" /> मुख्य ब्रँड्स:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {s.mainBrands.split(',').map((brand, i) => (
                                <Badge key={i} variant="secondary" className="text-[9px] py-0 px-1.5 bg-muted/50 font-normal">
                                  {brand.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto space-y-2 border-t pt-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3.5 w-3.5 text-primary/60" /> 
                            <span className="font-bold">{s.contact}</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" /> 
                            <span className="truncate">{s.taluka}, {s.district}</span>
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

      {/* View Details Dialog */}
      <Dialog open={!!viewingSupplier} onOpenChange={(open) => !open && setViewingSupplier(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> पुरवठादार माहिती
            </DialogTitle>
          </DialogHeader>
          {viewingSupplier && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">दुकानाचे नाव</Label>
                  <p className="font-bold text-lg text-primary">{viewingSupplier.shopName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">प्रकार</Label>
                  <p className="font-semibold">{viewingSupplier.supplierType}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-[10px] uppercase">पुरवठादाराचे नाव</Label>
                <p className="font-medium">{viewingSupplier.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">संपर्क</Label>
                  <p className="font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {viewingSupplier.contact}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">नोंदणी तारीख</Label>
                  <p className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(viewingSupplier.timestamp).toLocaleDateString('mr-IN')}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-[10px] uppercase">पत्ता</Label>
                <p className="text-sm bg-muted p-2 rounded-md border mt-1">
                  {viewingSupplier.address}<br />
                  {viewingSupplier.taluka}, {viewingSupplier.district}
                </p>
              </div>

              {viewingSupplier.mainBrands && (
                <div>
                  <Label className="text-muted-foreground text-[10px] uppercase">मुख्य ब्रँड्स</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingSupplier.mainBrands.split(',').map((b, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{b.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <Badge className={viewingSupplier.providesDelivery ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  <Truck className="h-3 w-3 mr-1" /> डिलिव्हरी: {viewingSupplier.providesDelivery ? "होय" : "नाही"}
                </Badge>
                <Badge className={viewingSupplier.providesCredit ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                  <CreditCard className="h-3 w-3 mr-1" /> उधारी: {viewingSupplier.providesCredit ? "होय" : "नाही"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
