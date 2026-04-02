'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '../types';
import { fandiApi } from '../utils/api';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  WrenchScrewdriverIcon, 
  KeyIcon, 
  BeakerIcon,
  ShieldExclamationIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface ProductSelectorProps {
  onProductSelected: (product: Product) => void;
}

export default function ProductSelector({ onProductSelected }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fandiApi.getProducts();
      setProducts(data.length > 0 ? data : []);
    } catch (error: any) {
      console.warn("API failed, using dummy data");
      toast.error('Using offline product list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Helper to assign icons based on productCode
  const getProductIcon = (code: string) => {
    switch (code) {
      case 'VSC': return <WrenchScrewdriverIcon className="w-8 h-8" />;
      case 'GAP': return <ShieldCheckIcon className="w-8 h-8" />;
      case 'MAINT': return <CreditCardIcon className="w-8 h-8" />;
      case 'THEFT': return <KeyIcon className="w-8 h-8" />;
      case 'FPP': return <BeakerIcon className="w-8 h-8" />;
      default: return <ShieldExclamationIcon className="w-8 h-8" />;
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProductId(product.ex1ProductId);
    onProductSelected(product);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-semibold tracking-wide">INITIALIZING PROTECTION CATALOG...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 px-4">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            Protection <span className="text-blue-600">Plans</span>
          </h2>
          <p className="mt-3 text-slate-500 text-lg">
            Choose a premium protection package for your vehicle. All plans are carrier-backed and fully transferable.
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-bold border border-slate-200">
            {products.length} AVAILABLE OFFERS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {products.map((product) => {
          const isSelected = selectedProductId === product.ex1ProductId;

          return (
            <div
              key={product.ex1ProductId}
              onClick={() => handleProductSelect(product)}
              className={`group relative flex flex-col bg-white rounded-3xl transition-all duration-500 cursor-pointer border-2 ${
                isSelected 
                ? 'border-blue-600 shadow-[0_20px_50px_rgba(37,99,235,0.2)] -translate-y-2' 
                : 'border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl'
              }`}
            >
              {/* Approval Badge */}
              {product.approved && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                </div>
              )}

              <div className="p-8 flex-1">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${
                  isSelected ? 'bg-blue-600 text-white rotate-[360deg]' : 'bg-slate-50 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50'
                }`}>
                  {getProductIcon(product.productCode)}
                </div>

                <h3 className="text-xl font-black text-slate-800 uppercase leading-tight mb-2">
                  {product.productName}
                </h3>
                
                <div className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-500 font-mono text-[10px] mb-6">
                  TYPE: {product.productCode}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Product ID</p>
                    <p className="text-sm font-bold text-slate-700">#{product.ex1ProductId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Dealer Ref</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{product.providerDealerId}</p>
                  </div>
                </div>
              </div>

              {/* Interaction Footer */}
              <div className={`mx-4 mb-4 p-4 rounded-2xl text-center transition-all ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 group-hover:bg-slate-100'
              }`}>
                <p className="text-xs font-black uppercase tracking-tighter">
                  {isSelected ? '✓ Plan Activated' : 'Click to Select'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}