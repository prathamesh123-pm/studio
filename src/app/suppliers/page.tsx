
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
import { useBrandStore, MasterBrand } from "@/lib/brand-store";
import { Plus, Trash2, Save, Store, Phone, MapPin, UserPlus, Truck, CreditCard, ShoppingBag, Eye, Edit2, X, Printer, FileText, PlusCircle, CheckCircle2 } from "lucide-react";
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

export default function SupplierManagement() {
  const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
  const { getBrands } = useBrandStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [masterBrands, setMasterBrands] = useState<MasterBrand[]>([]);
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
  const [suppliedBrands, setSuppliedBrands] = useState<string[]>([]);
  const [providesDelivery, setProvidesDelivery] = useState(false);
  const [providesCredit, setProvidesCredit] = useState(false);
  const [customPoints, setCustomPoints] = useState<Array<{ point: string, value: string }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSuppliers(getSuppliers());
    setMasterBrands(getBrands());
  };

  const handleBrandToggle = (brandName: string) => {
    setSuppliedBrands(prev => 
      prev.includes(brandName) 
        ? prev.filter(b => b !== brandName) 
        : [...prev, brandName]
    );
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
      suppliedBrands,
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

    loadData();
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
    setSuppliedBrands(s.suppliedBrands || []);
    setProvidesDelivery(s.providesDelivery || false);
    setProvidesCredit(s.providesCredit || false);
    setCustomPoints(s.customPoints || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("हा पुरवठादार कायमचा हटवायचा आहे का?")) {
      deleteSupplier(id);
      loadData();
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
    setSuppliedBrands([]);
    setProvidesDelivery(false);
    setProvidesCredit(false);
    setCustomPoints([]);
    setEditingId(null);
  };

  const SupplierDataRow = ({ label, value }: { label: string, value: any }) => (
    <TableRow className="hover:bg-transparent border-b">
      <TableHead className="w-[45%] font-bold bg-muted/5 py-1 px-2 text-[10px] md:text-xs h-auto border-r leading-tight">{label}</TableHead>
      <TableCell className="py-1 px-2 text-[10px] md:text-xs h-auto leading-tight">
        {typeof value === 'boolean' ? (value ? 'होय' : 'नाही') : (Array.isArray(value) ? value.join(", ") : (value || '-'))}
      </TableCell>
    </TableRow>
  );

  const DetailedSupplierTable = ({ supplier, isPrint = false }: { supplier: Supplier, isPrint?: boolean }) => (
    <div className={`space-y-2 py-1 ${isPrint ? 'space-y-1' : ''}`}>
      <section className="break-inside-avoid">
        <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">१. सामान्य माहिती</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <SupplierDataRow label="दुकानाचे नाव" value={supplier.shopName} />
            <SupplierDataRow label="पुरवठादाराचे नाव" value={supplier.name} />
            <SupplierDataRow label="संपर्क क्रमांक" value={supplier.contact} />
            <SupplierDataRow label="पुरवठादार प्रकार" value={supplier.supplierType} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">२. लोकेशन व पत्ता</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <SupplierDataRow label="जिल्हा" value={supplier.district} />
            <SupplierDataRow label="तालुका" value={supplier.taluka} />
            <SupplierDataRow label="संपूर्ण पत्ता" value={supplier.address} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">३. व्यवसाय तपशील</h4>
        <Table className="border rounded-sm">
          <TableBody>
            <SupplierDataRow label="उपलब्ध ब्रँड्स" value={supplier.suppliedBrands} />
            <SupplierDataRow label="इतर ब्रँड्स" value={supplier.mainBrands} />
            <SupplierDataRow label="डिलिव्हरी सुविधा" value={supplier.providesDelivery} />
            <SupplierDataRow label="उधारी सुविधा" value={supplier.providesCredit} />
          </TableBody>
        </Table>
      </section>

      {supplier.customPoints && supplier.customPoints.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[10px] font-bold mb-1 border-b pb-0.5 text-primary uppercase">४. अतिरिक्त मुद्दे (Add Points)</h4>
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
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-primary">पुरवठादार व्यवस्थापन</h1>
            <p className="text-muted-foreground text-sm md:text-base">येथे तुम्ही पशुखाद्य पुरवठादारांची माहिती जतन करू शकता.</p>
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
          <div className="lg:col-span-4">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" /> 
                  {editingId ? "पुरवठादार संपादन" : "नवीन पुरवठादार"}
                </CardTitle>
                {editingId && (
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">पुरवठादाराचे नाव (मालक)</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="पूर्ण नाव" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">दुकानाचे नाव</Label>
                  <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="उदा. महालक्ष्मी पशुखाद्य" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">संपर्क</Label>
                    <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="मोबाईल" maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">प्रकार</Label>
                    <Select value={supplierType} onValueChange={(v: any) => setSupplierType(v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Retailer">Retailer</SelectItem>
                        <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                        <SelectItem value="Distributor">Distributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Label className="text-xs font-bold text-primary mb-2 block">पुरवठा करत असलेले ब्रँड्स (मास्टर लिस्ट मधून निवडा)</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-2 border rounded-md bg-muted/5">
                    {masterBrands.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground col-span-2">मास्टर ब्रँड लिस्टमध्ये ब्रँड्स जोडा.</p>
                    ) : (
                      masterBrands.map(b => (
                        <div key={b.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`brand-${b.id}`} 
                            checked={suppliedBrands.includes(b.name)}
                            onCheckedChange={() => handleBrandToggle(b.name)}
                          />
                          <Label htmlFor={`brand-${b.id}`} className="text-[10px] truncate">{b.name}</Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">इतर ब्रँड्स (असल्यास)</Label>
                  <Input value={mainBrands} onChange={(e) => setMainBrands(e.target.value)} placeholder="स्वल्पविराम देऊन लिहा" />
                </div>
                
                <LocationSelector 
                  onLocationChange={(d, t) => { setDistrict(d); setTaluka(t); }}
                  defaultDistrict={district}
                  defaultTaluka={taluka}
                />

                <div className="space-y-2">
                  <Label className="text-xs">पूर्ण पत्ता</Label>
                  <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="गावाचे नाव इ." className="h-16 text-xs" />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="delivery" checked={providesDelivery} onCheckedChange={(v: boolean) => setProvidesDelivery(v)} />
                    <Label htmlFor="delivery" className="text-[10px] cursor-pointer flex items-center gap-1"><Truck className="h-3 w-3" /> डिलिव्हरी</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="credit" checked={providesCredit} onCheckedChange={(v: boolean) => setProvidesCredit(v)} />
                    <Label htmlFor="credit" className="text-[10px] cursor-pointer flex items-center gap-1"><CreditCard className="h-3 w-3" /> उधारी</Label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-primary font-bold text-sm">ऍड पॉईंट्स (इतर)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPoint} className="h-7 text-[10px]">
                      <PlusCircle className="h-3 w-3 mr-1" /> जोडा
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {customPoints.map((pt, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-muted/10 relative space-y-2">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => handleRemovePoint(idx)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Input 
                          placeholder="मुद्दा" 
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
                    <Button variant="outline" className="flex-1" onClick={resetForm}>रद्द</Button>
                  )}
                  <Button className="flex-1 bg-primary shadow-sm" onClick={handleSaveSupplier}>
                    <Save className="mr-2 h-4 w-4" /> {editingId ? "अपडेट" : "जतन करा"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">पुरवठादारांची यादी ({suppliers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {suppliers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                    <Store className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    पुरवठादार उपलब्ध नाहीत.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suppliers.map((s) => (
                      <div key={s.id} className="p-4 border rounded-xl bg-white relative group hover:border-primary/40 transition-all shadow-sm">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewingSupplier(s)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <h3 className="font-bold text-base text-primary leading-tight pr-12">{s.shopName}</h3>
                        <p className="text-xs font-medium text-muted-foreground mt-1">{s.name} ({s.supplierType})</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.suppliedBrands?.slice(0, 3).map((b, i) => (
                            <Badge key={i} variant="secondary" className="text-[8px] h-4 px-1">{b}</Badge>
                          ))}
                          {s.suppliedBrands?.length > 3 && <span className="text-[8px] text-muted-foreground">+{s.suppliedBrands.length - 3} अधिक</span>}
                        </div>
                        <div className="mt-4 pt-3 border-t flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold"><Phone className="h-3.5 w-3.5 text-primary" /> {s.contact}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" /> {s.taluka}, {s.district}</div>
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
          <h1 className="text-xl font-bold uppercase">पुरवठादार मास्टर रिपोर्ट</h1>
          <p className="text-[10px]">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {suppliers.map((s, index) => (
            <div key={s.id} className="border border-gray-200 p-2 rounded-sm break-inside-avoid">
              <h2 className="text-xs font-bold border-b border-gray-200 mb-2 pb-1 text-primary">{index + 1}. {s.shopName} ({s.supplierType})</h2>
              <DetailedSupplierTable supplier={s} isPrint={true} />
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!viewingSupplier} onOpenChange={(open) => !open && setViewingSupplier(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-primary border-b pb-1">
              <Store className="h-5 w-5" /> पुरवठादार तपशील
            </DialogTitle>
          </DialogHeader>
          {viewingSupplier && <DetailedSupplierTable supplier={viewingSupplier} />}
        </DialogContent>
      </Dialog>

      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader className="border-b pb-2 mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-6 w-6" /> संपूर्ण पुरवठादार रिपोर्ट
              </DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="gap-2 h-8 text-xs">
                <Printer className="h-4 w-4" /> प्रिंट
              </Button>
            </div>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.map((s, index) => (
              <div key={s.id} className="border p-3 rounded-lg bg-white shadow-sm break-inside-avoid">
                <h3 className="text-sm font-bold text-primary border-b mb-3 pb-1">
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
