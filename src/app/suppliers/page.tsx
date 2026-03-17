
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
import { Plus, Trash2, Save, Store, Phone, MapPin, UserPlus, Truck, CreditCard, ShoppingBag, Eye, Edit2, X, Printer, FileText, PlusCircle } from "lucide-react";
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

export default function SupplierManagement() {
  const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  
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
  const [customPoints, setCustomPoints] = useState<Array<{ point: string, value: string }>>([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setSuppliers(getSuppliers());
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

  const handleSaveSupplier = () => {
    if (!name || !contact || !shopName) {
      toast({ variant: "destructive", title: "त्रुटी", description: "नाव, दुकानाचे नाव आणि संपर्क क्रमांक आवश्यक आहे." });
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
      providesCredit,
      customPoints
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
    setCustomPoints(s.customPoints || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("हा पुरवठादार कायमचा हटवायचा आहे का?")) {
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
    setCustomPoints([]);
    setEditingId(null);
  };

  const SupplierDataRow = ({ label, value }: { label: string, value: any }) => (
    <TableRow className="hover:bg-transparent border-b">
      <TableHead className="w-1/2 font-bold bg-muted/10 py-1 px-2 text-[10px] md:text-xs h-auto border-r">{label}</TableHead>
      <TableCell className="py-1 px-2 text-[10px] md:text-xs h-auto">
        {typeof value === 'boolean' ? (value ? 'होय' : 'नाही') : (value || '-')}
      </TableCell>
    </TableRow>
  );

  const DetailedSupplierTable = ({ supplier, isPrint = false }: { supplier: Supplier, isPrint?: boolean }) => (
    <div className={`space-y-3 py-2 ${isPrint ? 'space-y-1' : ''}`}>
      <section>
        <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">१. सामान्य माहिती</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <SupplierDataRow label="दुकानाचे / एजन्सीचे नाव" value={supplier.shopName} />
            <SupplierDataRow label="पुरवठादार प्रकार" value={supplier.supplierType === 'Retailer' ? 'किरकोळ (Retailer)' : supplier.supplierType === 'Wholesaler' ? 'घाऊक (Wholesaler)' : 'डिस्ट्रीब्युटर'} />
            <SupplierDataRow label="पुरवठादाराचे नाव" value={supplier.name} />
            <SupplierDataRow label="संपर्क क्रमांक" value={supplier.contact} />
          </TableBody>
        </Table>
      </section>

      <section>
        <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">२. लोकेशन व पत्ता</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <SupplierDataRow label="जिल्हा" value={supplier.district} />
            <SupplierDataRow label="तालुका" value={supplier.taluka} />
            <SupplierDataRow label="पूर्ण पत्ता" value={supplier.address} />
          </TableBody>
        </Table>
      </section>

      <section>
        <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">३. व्यावसायिक माहिती</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <SupplierDataRow label="मुख्य ब्रँड्स" value={supplier.mainBrands} />
            <SupplierDataRow label="डिलिव्हरी सुविधा" value={supplier.providesDelivery} />
            <SupplierDataRow label="उधारी सुविधा" value={supplier.providesCredit} />
            <SupplierDataRow label="नोंदणी दिनांक" value={new Date(supplier.timestamp).toLocaleDateString('mr-IN')} />
          </TableBody>
        </Table>
      </section>

      {supplier.customPoints && supplier.customPoints.length > 0 && (
        <section>
          <h4 className="text-[11px] font-bold mb-1 border-b pb-0.5 text-primary">४. ऍड पॉईंट्स (इतर मुद्दे)</h4>
          <Table className="border rounded-sm">
            <TableBody>
              {supplier.customPoints.map((pt, idx) => (
                <SupplierDataRow key={idx} label={pt.point} value={pt.value} />
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
      <div className="container mx-auto px-4 py-8 max-w-7xl no-print">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">पुरवठादार व्यवस्थापन (Suppliers)</h1>
            <p className="text-muted-foreground text-sm md:text-base">येथे तुम्ही पशुखाद्य पुरवठादारांची माहिती जतन करू शकता.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add/Edit Form */}
          <div className="lg:col-span-4">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> 
                  {editingId ? "पुरवठादार संपादन करा" : "नवीन पुरवठादार जोडा"}
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

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-primary font-bold">ऍड पॉईंट्स (इतर मुद्दे)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPoint} className="h-7 text-xs">
                      <PlusCircle className="h-3 w-3 mr-1" /> मुद्दा जोडा
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {customPoints.map((pt, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-muted/20 relative space-y-2">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => handleRemovePoint(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Input 
                          placeholder="मुद्दा / प्रश्न" 
                          value={pt.point} 
                          onChange={(e) => handlePointChange(idx, "point", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Textarea 
                          placeholder="उत्तर / माहिती" 
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
                            title="पहा"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => handleEdit(s)}
                            title="संपादन करा"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(s.id)}
                            title="हटवा"
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

      {/* Print View Layout */}
      <div className="hidden print:block p-4 space-y-4 text-black bg-white">
        <div className="text-center border-b-2 border-black pb-2 mb-4">
          <h1 className="text-xl font-bold uppercase">पुरवठादार मास्टर रिपोर्ट (Table Format)</h1>
          <p className="text-[10px]">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {suppliers.map((s, index) => (
            <div key={s.id} className="border border-black p-2 rounded-sm break-inside-avoid">
              <h2 className="text-sm font-bold border-b border-black mb-2">{index + 1}. {s.shopName} ({s.supplierType})</h2>
              <DetailedSupplierTable supplier={s} isPrint={true} />
            </div>
          ))}
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!viewingSupplier} onOpenChange={(open) => !open && setViewingSupplier(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Store className="h-5 w-5" /> पुरवठादार माहिती
            </DialogTitle>
          </DialogHeader>
          {viewingSupplier && <DetailedSupplierTable supplier={viewingSupplier} />}
        </DialogContent>
      </Dialog>

      {/* Full Report Dialog */}
      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4 mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-6 w-6" /> संपूर्ण पुरवठादार रिपोर्ट (Table Format)
              </DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="gap-2">
                <Printer className="h-4 w-4" /> प्रिंट
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-8">
            {suppliers.map((s, index) => (
              <div key={s.id} className="border p-4 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-bold text-primary border-b-2 mb-4 pb-1">
                  {index + 1}. {s.shopName} ({s.supplierType})
                </h3>
                <DetailedSupplierTable supplier={s} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
