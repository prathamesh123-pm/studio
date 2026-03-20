export interface NutrientValue {
  value: string;
  limit: 'Min' | 'Max';
}

export interface MasterBrand {
  id: string;
  name: string;
  compoundedType: string; // Type 1, Type 2
  feedType: string;
  bagWeight: string;
  availableWeights: string;
  price: string;
  nutrition: {
    protein: NutrientValue;
    fat: NutrientValue;
    fiber: NutrientValue;
    ash: NutrientValue;
    calcium: NutrientValue;
    totalPhosphorus: NutrientValue;
    availablePhosphorus: NutrientValue;
    aflatoxin: NutrientValue;
    urea: NutrientValue;
    moisture: NutrientValue;
    others: string;
  };
  ingredients: Array<{
    ingredient: string;
    percentage: string;
  }>;
  customPoints?: Array<{
    point: string;
    value: string;
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

  const updateBrand = (id: string, updatedData: Omit<MasterBrand, 'id'>) => {
    const brands = getBrands();
    const updatedBrands = brands.map(b => b.id === id ? { ...updatedData, id } : b);
    localStorage.setItem('pashudhan_master_brands', JSON.stringify(updatedBrands));
  };

  const deleteBrand = (id: string) => {
    const brands = getBrands();
    const filtered = brands.filter(b => b.id !== id);
    localStorage.setItem('pashudhan_master_brands', JSON.stringify(filtered));
  };

  return { getBrands, addBrand, updateBrand, deleteBrand };
};