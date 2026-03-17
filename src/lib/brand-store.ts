
export interface MasterBrand {
  id: string;
  name: string;
  nutrition: {
    protein: string;
    fat: string;
    fiber: string;
    calcium: string;
    phosphorus: string;
    salt: string;
    mineralMix: string;
    others: string;
  };
  ingredients: Array<{
    ingredient: string;
    percentage: string;
  }>;
}

export const useBrandStore = () => {
  const getBrands = (): MasterBrand[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('pashudhan_master_brands');
    return data ? JSON.parse(data) : [];
  };

  const addBrand = (brand: Omit<MasterBrand, 'id'>) => {
    const brands = getBrands();
    const newBrand = {
      ...brand,
      id: Math.random().toString(36).substr(2, 9),
    };
    localStorage.setItem('pashudhan_master_brands', JSON.stringify([newBrand, ...brands]));
    return newBrand;
  };

  const deleteBrand = (id: string) => {
    const brands = getBrands();
    const filtered = brands.filter(b => b.id !== id);
    localStorage.setItem('pashudhan_master_brands', JSON.stringify(filtered));
  };

  return { getBrands, addBrand, deleteBrand };
};
