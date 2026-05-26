'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Customer, Vehicle, Product } from '../types';
import { fandiApi } from '../utils/api';

interface QuoteFormProps {
  selectedProduct: Product;
  onQuotesReceived: (quotes: any[], customerData: Customer, vehicleData: Vehicle) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onBack: () => void;
}

export default function QuoteForm({ 
  selectedProduct, 
  onQuotesReceived, 
  loading, 
  setLoading,
  onBack 
}: QuoteFormProps) {
  // Test data for easy testing
  const testData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "225-201-3112",
    address: "Street 1",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    vin: "KNDJF723977442330",
    odometer: "25000",
    carStatus: "Used",
    dealType: "Loan",
    contractDate: "2024-03-31",
    purchasePrice: "25000",
    financeTerm: "60", // Default test value remains valid for the drop-down select
    amountFinanced: "20000",
    downPayment: "5000",
    year: "2020",
    make: "Ford",
    model: "Explorer",
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: testData
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const customerData: Customer = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      };

      const vehicleData: Vehicle = {
        vin: data.vin,
        odometer: parseInt(data.odometer),
        carStatus: data.carStatus,
        dealType: data.dealType,
        contractDate: data.contractDate,
        purchasePrice: parseInt(data.purchasePrice) || 25000,
        financeTerm: parseInt(data.financeTerm) || 60,
        amountFinanced: parseInt(data.amountFinanced) || 20000,
        downPayment: parseInt(data.downPayment) || 5000,
        year: data.year ? parseInt(data.year) : 2020,
        make: data.make || 'Ford',
        model: data.model || 'Explorer',
      };

      const quotes = await fandiApi.getQuotes(customerData, vehicleData, [selectedProduct.ex1ProductId]);
      onQuotesReceived(quotes, customerData, vehicleData);
      toast.success('Quotes retrieved successfully!');
    } catch (error: any) {
      console.error('Error getting quotes:', error);
      toast.error(error.response?.data?.message || 'Failed to get quotes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Test Data Indicator */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-sm">🧪 Test Mode:</span>
          <span className="text-xs text-gray-600">Sample data pre-filled for testing</span>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900">Selected Product: {selectedProduct.productName}</h3>
        <p className="text-sm text-blue-700">Code: {selectedProduct.productCode}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name *</label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name *</label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              {...register('address')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input {...register('city')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input {...register('state')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Zip Code</label>
            <input {...register('zipCode')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">VIN *</label>
            <input
              {...register('vin', { required: 'VIN is required', minLength: 17, maxLength: 17 })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.vin && <p className="text-red-500 text-sm mt-1">{errors.vin.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Odometer (miles) *</label>
            <input
              type="number"
              {...register('odometer', { required: 'Odometer is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Car Status *</label>
            <select
              {...register('carStatus', { required: 'Car status is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="CPO">CPO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deal Type *</label>
            <select
              {...register('dealType', { required: 'Deal type is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Lease">Lease</option>
              <option value="Loan">Loan</option>
              <option value="Cash">Cash</option>
              <option value="Balloon Loan">Balloon Loan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contract Date</label>
            <input
              type="date"
              {...register('contractDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
              <input
                type="number"
                {...register('purchasePrice')}
                placeholder="25000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            
            {/* Swapped input element out for select tag down below */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Finance Term</label>
              <select
                {...register('financeTerm', { required: 'Finance term is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
                <option value="72">72 Months</option>
                <option value="84">84 Months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Financed</label>
              <input
                type="number"
                {...register('amountFinanced')}
                placeholder="20000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Down Payment</label>
              <input
                type="number"
                {...register('downPayment')}
                placeholder="5000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                {...register('year')}
                placeholder="2020"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Make</label>
              <input
                {...register('make')}
                placeholder="Ford"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              {...register('model')}
              placeholder="Explorer"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Products
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Getting Quotes...' : 'Get Quotes'}
        </button>
      </div>
    </form>
  );
}