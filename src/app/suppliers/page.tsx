
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { useSupplierStore, Supplier } from "@/lib/supplier-store";
import { Plus, Trash2, Save, Store, Phone, MapPin, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SupplierManagement() {
  const { getSuppliers, addSupplier, deleteSupplier } = useSupplierStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [contact, setContact] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setSuppliers(getSuppliers());
  }, []);

  const handleSaveSupplier = () => {
    if (!name || !contact || !shopName) {
      toast({ variant: "destructive", title: "त्रुटी", description: "नाव, दुकानाचे नाव आणि संपर्क आवश्यक आहे." });
      return;
    }
    addSupplier({
      name,
      shopName,
      contact,
      district,
      taluka,
      address
    });
    setSuppliers(getSuppliers());
    resetForm();
    toast({ title: "यशस्वी", description: "पुरवठादाराची माहिती जतन झाली!" });
  };

  const resetForm = () => {
    setName("");
    setShopName("");
    setContact("");
    setDistrict("");
    setTaluka("");
    setAddress("");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">पुरवठादार व्यवस्थापन (Suppliers)</h1>
            <p className="text-muted-foreground text-sm md:text-base">तुमच्या संपर्कातील पशुखाद्य पुरवठादारांची यादी येथे जतन करा.</p>
          </div>
          <div className="bg-primary/5 p-3 rounded-full hidden md:block border border-primary/10">
            <Store className="h-8 w-8 text-primary opacity-60" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-1">
            <Card className="border-primary/20 shadow-md sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> नवीन पुरवठादार जोडा
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>पुरवठादाराचे नाव</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="उदा. विशाल कदम" />
                </div>
                <div className="space-y-2">
                  <Label>दुकानाचे / एजन्सीचे नाव</Label>
                  <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="उदा. महालक्ष्मी पशुखाद्य" />
                </div>
                <div className="space-y-2">
                  <Label>संपर्क क्रमांक</Label>
                  <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="१० अंकी मोबाईल नंबर" maxLength={10} />
                </div>
                
                <LocationSelector 
                  onLocationChange={(d, t) => { setDistrict(d); setTaluka(t); }}
                />

                <div className="space-y-2">
                  <Label>पूर्ण पत्ता</Label>
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="गावाचे नाव, गल्ली इ." className="h-20" />
                </div>

                <Button className="w-full bg-primary mt-2 shadow-sm" onClick={handleSaveSupplier}>
                  <Save className="mr-2 h-4 w-4" /> पुरवठादार जतन करा
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* List View */}
          <div className="lg:col-span-2">
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
                      <div key={s.id} className="p-4 border rounded-lg bg-white relative group hover:border-primary/40 transition-all shadow-sm">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            deleteSupplier(s.id);
                            setSuppliers(getSuppliers());
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col h-full">
                          <h3 className="font-bold text-lg text-primary leading-tight mb-1">{s.shopName}</h3>
                          <p className="text-sm font-medium mb-3 flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5 text-muted-foreground" /> {s.name}</p>
                          
                          <div className="mt-auto pt-3 border-t space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 text-primary/60" /> 
                              <span className="font-semibold text-foreground">{s.contact}</span>
                            </div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 text-primary/60 shrink-0" /> 
                              <span>{s.address}, {s.taluka}, {s.district}</span>
                            </div>
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
