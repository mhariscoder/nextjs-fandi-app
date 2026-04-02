'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import ProductSelector from './components/ProductSelector';
import QuoteForm from './components/QuoteForm';
import PlanCard from './components/PlanCard';
import PaymentModal from './components/PaymentModal';
import { QuoteResponse, Plan, Product, Customer, Vehicle } from './types';

export default function Home() {
  const [step, setStep] = useState<'product' | 'form' | 'quotes'>('product');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [quotes, setQuotes] = useState<any[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  const handleProductSelected = (product: Product) => {
    setSelectedProduct(product);
    setStep('form');
  };

  const handleQuotesReceived = (data: any[], customerData: Customer, vehicleData: Vehicle) => {
    setCustomer(customerData);
    setVehicle(vehicleData);
    setQuotes(data);
    setStep('quotes');
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handlePurchase = () => {
    if (selectedPlan) {
      setShowPaymentModal(true);
    }
  };

  const handlePurchaseComplete = (result: any) => {
    setPurchaseResult(result);
    toast.success(`Contract ${result.contractNumber} created successfully!`);
    setShowPaymentModal(false);
  };

  const handleBackToProducts = () => {
    setStep('product');
    setSelectedProduct(null);
    setCustomer(null);
    setVehicle(null);
    setQuotes(null);
    setSelectedPlan(null);
  };

  const handleBackToForm = () => {
    setStep('form');
    setQuotes(null);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Protection Plans</h1>
          <p className="text-gray-600 mt-2">Select a protection plan, get quotes, and purchase coverage for your vehicle</p>
        </header>

        {/* Step 1: Product Selection */}
        {step === 'product' && (
          <div className="bg-white rounded-lg shadow p-6">
            <ProductSelector onProductSelected={handleProductSelected} />
          </div>
        )}

        {/* Step 2: Customer & Vehicle Form */}
        {step === 'form' && selectedProduct && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer & Vehicle Information</h2>
            <QuoteForm
              selectedProduct={selectedProduct}
              onQuotesReceived={handleQuotesReceived}
              loading={loading}
              setLoading={setLoading}
              onBack={handleBackToProducts}
            />
          </div>
        )}

        {/* Step 3: Quotes Display */}
        {step === 'quotes' && quotes && !loading && customer && vehicle && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Vehicle Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">VIN</p>
                  <p className="font-mono text-sm">{vehicle.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Odometer</p>
                  <p>{vehicle.odometer.toLocaleString()} miles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Car Status</p>
                  <p>{vehicle.carStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deal Type</p>
                  <p>{vehicle.dealType}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Customer</p>
                <p>{customer.firstName} {customer.lastName} | {customer.email}</p>
                {customer.phone && <p className="text-sm text-gray-600">Phone: {customer.phone}</p>}
              </div>
            </div>

            {/* quotes is the array directly - no .products */}
            {quotes.map((product) => (
              <div key={product.productId} className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{product.productName}</h2>
                    <p className="text-gray-500 text-sm">Code: {product.productCode}</p>
                  </div>
                  {product.options.some((p: any) => p.isPromotional) && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      🔥 Promotional Available
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.options.map((plan: any, idx: number) => (
                    <PlanCard
                      key={idx}
                      plan={plan}
                      isSelected={selectedPlan?.name === plan.name && selectedPlan?.rateResponseId === plan.rateResponseId}
                      onSelect={() => handlePlanSelect(plan)}
                    />
                  ))}
                </div>

                {selectedPlan && (
                  <div className="mt-6 pt-4 border-t flex justify-end">
                    <button
                      onClick={handlePurchase}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Purchase {selectedPlan.formattedPrice}
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleBackToForm}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Back to Form
              </button>
              <button
                onClick={handleBackToProducts}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading quotes...</p>
          </div>
        )}

        {/* {showPaymentModal && selectedPlan && customer && vehicle && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            selectedPlan={selectedPlan}
            customer={customer}
            vehicle={vehicle}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )} */}

        {purchaseResult && (
          <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md shadow-lg">
            <h4 className="font-semibold text-green-800">Purchase Successful!</h4>
            <p className="text-sm text-green-700 mt-1">Contract: {purchaseResult.contractNumber}</p>
            <p className="text-sm text-green-700">Amount: ${purchaseResult.customerPaid}</p>
            <p className="text-sm text-green-700 mt-1">{purchaseResult.nextSteps?.[0]}</p>
            <button
              onClick={() => setPurchaseResult(null)}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}