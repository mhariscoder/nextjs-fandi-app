'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import ProductSelector from './components/ProductSelector';
import QuoteForm from './components/QuoteForm';
import PlanCard from './components/PlanCard';
import PaymentModal from './components/PaymentModal';
import { QuoteResponse, Plan, Product, Customer, Vehicle } from './types';
import { fandiApi } from './utils/api';

export default function Home() {
  // Added 'success' type to the step state tracker
  const [step, setStep] = useState<'product' | 'form' | 'quotes' | 'success'>('product');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [quotes, setQuotes] = useState<any[] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Strongly typed state structure to perfectly handle your purchase response payload
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    contractNumber: string;
    contractFormId: number;
    redirectUrl?: string;
  } | null>(null);

  // Holds dynamic input values using FieldName keys (e.g. { ETCH_NUMBER: '...' })
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, string>>({});

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
    setDynamicFormValues({});
  };

  const handleDynamicFieldChange = (fieldName: string, value: string) => {
    setDynamicFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !customer || !vehicle) return;

    const missingFields = (selectedPlan as any).requiredFields?.filter(
      (field: any) => field.Required === "true" && !dynamicFormValues[field.FieldName]
    );

    if (missingFields && missingFields.length > 0) {
      toast.error(`Please fill out the missing field: ${missingFields[0].Prompt}`);
      return;
    }

    setLoading(true);
    try {
      const cleanedPlan = {
        productId: selectedProduct?.ex1ProductId || (selectedPlan as any).productId || 30, 
        planName: selectedPlan.name,       
        retailPrice: selectedPlan.price,   
        termMonths: selectedPlan.termMonths,
        contractFormId: selectedPlan.contractFormId,
        rateResponseId: selectedPlan.rateResponseId,
        dealerCost: selectedPlan.dealerCost,
      };

      const paymentDetails = {
        method: "ACH",
        apr: 6.0,
        formFields: {
          ...dynamicFormValues
        }
      };

      const result = await fandiApi.purchasePlan(
        cleanedPlan,
        customer,
        vehicle,
        paymentDetails
      );

      handlePurchaseComplete(result);
    } catch (error: any) {
      console.error("Purchase Error:", error.response?.data);
      const messages = error.response?.data?.message;
      toast.error(Array.isArray(messages) ? messages[0] : "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseComplete = (result: any) => {
    setPurchaseResult(result);
    setStep('success'); // Instantly transition viewport display layout
    toast.success(`Contract processed successfully!`);
    setShowPaymentModal(false);
    
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  const handleStartOver = () => {
    setStep('product');
    setSelectedProduct(null);
    setCustomer(null);
    setVehicle(null);
    setQuotes(null);
    setSelectedPlan(null);
    setPurchaseResult(null);
    setDynamicFormValues({});
  };

  const handleBackToForm = () => {
    setStep('form');
    setQuotes(null);
    setSelectedPlan(null);
    setDynamicFormValues({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hide header on final success viewport to let receipt design stand out */}
        {step !== 'success' && (
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Protection Plans</h1>
            <p className="text-gray-600 mt-2">Select a protection plan, get quotes, and purchase coverage for your vehicle</p>
          </header>
        )}

        {step === 'product' && (
          <div className="bg-white rounded-lg shadow p-6">
            <ProductSelector onProductSelected={handleProductSelected} />
          </div>
        )}

        {step === 'form' && selectedProduct && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customer & Vehicle Information</h2>
            <QuoteForm
              selectedProduct={selectedProduct}
              onQuotesReceived={handleQuotesReceived}
              loading={loading}
              setLoading={setLoading}
              onBack={handleStartOver}
            />
          </div>
        )}

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

            {quotes.map((product) => (
              <div key={product.productId} className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{product.productName}</h2>
                    <p className="text-gray-500 text-sm">Code: {product.productCode}</p>
                  </div>
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

                {selectedPlan && product.options.some((p: any) => p.name === selectedPlan.name) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    {(selectedPlan as any).requiredFields && (selectedPlan as any).requiredFields.length > 0 && (
                      <div className="max-w-md bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Plan Requirements</h4>
                        
                        {(selectedPlan as any).requiredFields.map((field: any) => (
                          <div key={field.FieldName} className="mb-3 last:mb-0">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {field.Prompt} {field.Required === "true" && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              value={dynamicFormValues[field.FieldName] || ''}
                              onChange={(e) => handleDynamicFieldChange(field.FieldName, e.target.value)}
                              placeholder={`Enter ${field.FormName}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handlePurchase}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium shadow-sm"
                      >
                        Purchase {selectedPlan.formattedPrice}
                      </button>
                    </div>
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
                onClick={handleStartOver}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </>
        )}

        {/* === STEP 4 SUCCESS VIEW: Enrolled Confirmation Screen === */}
        {step === 'success' && purchaseResult && customer && vehicle && selectedPlan && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 my-8">
            <div className="bg-green-600 p-8 text-center text-white">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white text-green-600 mb-4 shadow-sm">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Plan Enrolled Successfully!</h2>
              <p className="text-green-100 text-sm mt-1">Your coverage is locked in and completely registered</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Core API Response Fields Component Block */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200/60">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">API Processing Indicators</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Contract Number</p>
                    <p className="font-mono text-base font-bold text-gray-900 select-all tracking-tight">{purchaseResult.contractNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contract Form ID</p>
                    <p className="font-sans text-base font-semibold text-gray-800">{purchaseResult.contractFormId}</p>
                  </div>
                </div>
              </div>

              {/* Package and Vehicle Detail Metadata Layout Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Coverage Summary</h4>
                  <p className="font-semibold text-gray-900 text-base">{selectedPlan.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">Term: {selectedPlan.termMonths} Months</p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">Price Paid: {selectedPlan.formattedPrice}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Linked Vehicle</h4>
                  <p className="text-sm font-medium text-gray-900 font-mono uppercase tracking-wider">{vehicle.vin}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                  <p className="text-xs text-gray-500 italic mt-0.5">{vehicle.carStatus} Status • {vehicle.odometer.toLocaleString()} mi</p>
                </div>
              </div>

              {/* Customer Accountability Footnote Section */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contract Owner</h4>
                <p className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                <p className="text-xs text-gray-500 font-mono">{customer.email}</p>
              </div>

              {/* PayLink Financing Intercept Callout Box */}
              {purchaseResult.redirectUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-800 mb-3">Action Required: Finalize recurring payment schedules on the processor site:</p>
                  <a 
                    href={purchaseResult.redirectUrl}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded shadow transition-colors"
                  >
                    Complete setup on PayLink →
                  </a>
                </div>
              )}

              {/* Interface Footers */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={handleStartOver}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-md text-sm font-medium transition-colors"
                >
                  Process Another Coverage
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Processing order...</p>
          </div>
        )}

        {showPaymentModal && selectedPlan && customer && vehicle && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            selectedPlan={selectedPlan}
            customer={customer}
            vehicle={vehicle}
            onPurchaseComplete={handlePurchaseComplete}
          />
        )}
      </div>
    </div>
  );
}