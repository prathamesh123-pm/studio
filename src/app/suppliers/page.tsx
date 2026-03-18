"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Plus, Trash2, Save, Store, Phone, MapPin, UserPlus, Truck, CreditCard, Eye, Edit2, X, Printer, FileText, PlusCircle, Search, Filter } from "lucide-react";
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
import { DISTRICTS, MAHARASHTRA_LOCATIONS } from "@/lib/location-data";

export default function SupplierManagement() {
  const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplierStore();
  const { getBrands } = useBrandStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [masterBrands, setMasterBrands] = useState<MasterBrand[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterTaluka, setFilterTaluka] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");

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
  const [customPoints, setCustomPoints] = useState<Array<{ point: string }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSuppliers(getSuppliers());
    setMasterBrands(getBrands());
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchDistrict = filterDistrict === "all" || s.district === filterDistrict;
      const matchTaluka = filterTaluka === "all" || s.taluka === filterTaluka;
      const matchBrand = filterBrand === "all" || s.suppliedBrands?.includes(filterBrand);
      return matchDistrict && matchTaluka && matchBrand;
    });
  }, [suppliers, filterDistrict, filterTaluka, filterBrand]);

  const handleBrandSelect = (brandName: string) => {
    if (brandName && !suppliedBrands.includes(brandName)) {
      setSuppliedBrands([...suppliedBrands, brandName]);
    }
  };

  const removeBrand = (brandName: string) => {
    setSuppliedBrands(suppliedBrands.filter(b => b !== brandName));
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
      customPoints: customPoints.map(p => ({ point: p.point, value: "" }))
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
    setCustomPoints(s.customPoints?.map(p => ({ point: p.point })) || []);
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

  const SupplierDataRow = ({ label, value }: { label: string, value: any }) => {
    let displayValue = value;
    if (typeof value === 'boolean') displayValue = value ? 'होय' : 'नाही';
    if (Array.isArray(value)) displayValue = value.join(", ");

    return (
      <TableRow className="hover:bg-transparent border-b border-black">
        <TableHead className="w-[45%] font-bold bg-gray-50 py-2 px-2 text-[11px] md:text-xs h-auto border-r border-black leading-tight text-black print:font-extrabold">{label}</TableHead>
        <TableCell className="py-2 px-2 text-[11px] md:text-xs h-auto leading-tight text-black font-medium">
          {displayValue || '-'}
        </TableCell>
      </TableRow>
    );
  };

  const DetailedSupplierTable = ({ supplier, isPrint = false }: { supplier: Supplier, isPrint?: boolean }) => (
    <div className={`space-y-3 py-1 ${isPrint ? 'space-y-2' : ''}`}>
      <section className="break-inside-avoid">
        <h4 className="text-[12px] font-black mb-1 border-b-2 border-black pb-0.5 text-black uppercase">१. सामान्य माहिती</h4>
        <Table className="border-2 border-black rounded-sm overflow-hidden">
          <TableBody>
            <SupplierDataRow label="दुकानाचे नाव" value={supplier.shopName} />
            <SupplierDataRow label="पुरवठादाराचे नाव (मालक)" value={supplier.name} />
            <SupplierDataRow label="संपर्क क्रमांक" value={supplier.contact} />
            <SupplierDataRow label="पुरवठादार प्रकार" value={supplier.supplierType} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[12px] font-black mb-1 border-b-2 border-black pb-0.5 text-black uppercase">२. लोकेशन व पत्ता</h4>
        <Table className="border-2 border-black rounded-sm overflow-hidden">
          <TableBody>
            <SupplierDataRow label="जिल्हा" value={supplier.district} />
            <SupplierDataRow label="तालुका" value={supplier.taluka} />
            <SupplierDataRow label="संपूर्ण पत्ता (Address)" value={supplier.address} />
          </TableBody>
        </Table>
      </section>

      <section className="break-inside-avoid">
        <h4 className="text-[12px] font-black mb-1 border-b-2 border-black pb-0.5 text-black uppercase">३. व्यवसाय तपशील</h4>
        <Table className="border-2 border-black rounded-sm overflow-hidden">
          <TableBody>
            <SupplierDataRow label="उपलब्ध ब्रँड्स (मास्टर लिस्ट)" value={supplier.suppliedBrands} />
            <SupplierDataRow label="इतर ब्रँड्स माहिती" value={supplier.mainBrands} />
            <SupplierDataRow label="डिलिव्हरी सुविधा?" value={supplier.providesDelivery} />
            <SupplierDataRow label="उधारी सुविधा?" value={supplier.providesCredit} />
          </TableBody>
        </Table>
      </section>

      {supplier.customPoints && supplier.customPoints.length > 0 && (
        <section className="break-inside-avoid">
          <h4 className="text-[12px] font-black mb-1 border-b-2 border-black pb-0.5 text-black uppercase">४. अतिरिक्त मुद्दे</h4>
          <Table className="border-2 border-black rounded-sm overflow-hidden">
            <TableBody>
              {supplier.customPoints.map((pt, idx) => (
                <SupplierDataRow key={idx} label={`मुद्दा क्रमांक ${idx + 1}`} value={pt.point} />
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

        <Card className="mb-8 border-primary/10 shadow-sm bg-primary/5">
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-bold uppercase">फिल्टर निवडा (Filter Suppliers)</CardTitle>
          </CardHeader>
          <CardContent className="py-4 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">जिल्हा निवडा</Label>
                <Select value={filterDistrict} onValueChange={(v) => { setFilterDistrict(v); setFilterTaluka("all"); }}>
                  <SelectTrigger className="h-9 text-xs bg-white">
                    <SelectValue placeholder="सर्व जिल्हे" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सर्व जिल्हे</SelectItem>
                    {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">तालुका निवडा</Label>
                <Select value={filterTaluka} onValueChange={setFilterTaluka} disabled={filterDistrict === "all"}>
                  <SelectTrigger className="h-9 text-xs bg-white">
                    <SelectValue placeholder="सर्व तालुके" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सर्व तालुके</SelectItem>
                    {(MAHARASHTRA_LOCATIONS[filterDistrict] || []).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">ब्रँडनुसार शोधा</Label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger className="h-9 text-xs bg-white">
                    <SelectValue placeholder="सर्व ब्रँड्स" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">सर्व ब्रँड्स</SelectItem>
                    {masterBrands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <Select onValueChange={handleBrandSelect}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="ब्रँड निवडा (ड्रॉप-डाउन)" />
                    </SelectTrigger>
                    <SelectContent>
                      {masterBrands.length === 0 ? (
                        <SelectItem value="none" disabled>प्रथम ब्रँड मास्टर लिस्टमध्ये जोडा</SelectItem>
                      ) : (
                        masterBrands.map(b => (
                          <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex flex-wrap gap-1 mt-2 min-h-[32px] p-1 border rounded-md bg-muted/5">
                    {suppliedBrands.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground p-1 italic">निवडलेले ब्रँड्स येथे दिसतील...</span>
                    ) : (
                      suppliedBrands.map((brandName) => (
                        <Badge key={brandName} variant="secondary" className="text-[10px] h-6 px-2 flex items-center gap-1 group">
                          {brandName}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive text-muted-foreground group-hover:text-primary" 
                            onClick={() => removeBrand(brandName)}
                          />
                        </Badge>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">पुरवठादारांची यादी ({filteredSuppliers.length})</CardTitle>
                {(filterDistrict !== "all" || filterTaluka !== "all" || filterBrand !== "all") && (
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">फिल्टर लागू आहे</Badge>
                )}
              </CardHeader>
              <CardContent>
                {filteredSuppliers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    फिल्टरशी सुसंगत पुरवठादार उपलब्ध नाहीत.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSuppliers.map((s) => (
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

      <div className="hidden print:block p-8 text-black bg-white">
        <div className="text-center border-b-4 border-black pb-2 mb-6">
          <h1 className="text-2xl font-black uppercase">पुरवठादार मास्टर अहवाल</h1>
          <p className="text-[12px] font-bold">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {filteredSuppliers.map((s, index) => (
            <div key={s.id} className="border-2 border-black p-4 rounded-sm break-inside-avoid shadow-none">
              <h2 className="text-[14px] font-black border-b-2 border-black mb-3 pb-1 text-black">{index + 1}. {s.shopName} ({s.supplierType})</h2>
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
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-4 dialog-content-print shadow-none border-2">
          <DialogHeader className="border-b pb-2 mb-4 no-print">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="h-6 w-6" /> संपूर्ण पुरवठादार रिपोर्ट
              </DialogTitle>
              <Button size="sm" onClick={() => window.print()} className="gap-2 h-8 text-xs border-black bg-black text-white hover:bg-black/90">
                <Printer className="h-4 w-4" /> प्रिंट अहवाल
              </Button>
            </div>
          </DialogHeader>

          <div className="hidden print:block text-center border-b-4 border-black pb-2 mb-6">
            <h1 className="text-2xl font-black uppercase">पुरवठादार मास्टर अहवाल</h1>
            <p className="text-[12px] font-bold">तारीख: {new Date().toLocaleDateString('mr-IN')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.map((s, index) => (
              <div key={s.id} className="border-2 border-black p-4 rounded-lg bg-white shadow-sm break-inside-avoid">
                <h3 className="text-md font-black text-black border-b-2 border-black mb-3 pb-1">
                  {index + 1}. {s.shopName} ({s.supplierType})
                </h3>
                <DetailedSupplierTable supplier={s} isPrint={true} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}