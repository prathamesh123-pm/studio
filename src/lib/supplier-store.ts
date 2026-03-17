
export interface Supplier {
  id: string;
  name: string;
  shopName: string;
  contact: string;
  district: string;
  taluka: string;
  address: string;
  supplierType: 'Retailer' | 'Wholesaler' | 'Distributor';
  mainBrands: string;
  providesDelivery: boolean;
  providesCredit: boolean;
  timestamp: string;
  customPoints?: Array<{
    point: string;
    value: string;
  }>;
}

export const useSupplierStore = () => {
  const getSuppliers = (): Supplier[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('pashudhan_suppliers');
    return data ? JSON.parse(data) : [];
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'timestamp'>) => {
    const suppliers = getSuppliers();
    const newSupplier = {
      ...supplier,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('pashudhan_suppliers', JSON.stringify([newSupplier, ...suppliers]));
    return newSupplier;
  };

  const updateSupplier = (id: string, updatedData: Omit<Supplier, 'id' | 'timestamp'>) => {
    const suppliers = getSuppliers();
    const updatedSuppliers = suppliers.map(s => 
      s.id === id ? { ...updatedData, id, timestamp: s.timestamp } : s
    );
    localStorage.setItem('pashudhan_suppliers', JSON.stringify(updatedSuppliers));
  };

  const deleteSupplier = (id: string) => {
    const suppliers = getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    localStorage.setItem('pashudhan_suppliers', JSON.stringify(filtered));
  };

  return { getSuppliers, addSupplier, updateSupplier, deleteSupplier };
};
