'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plan, Customer, Vehicle, PaymentDetails } from '../types';
import { fandiApi } from '../utils/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan;
  customer: Customer;
  vehicle: Vehicle;
  onPurchaseComplete: (result: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  selectedPlan,
  customer,
  vehicle,
  onPurchaseComplete,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm();
  const paymentMethod = watch('method');

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const paymentDetails: PaymentDetails = {
        method: data.method,
        downPayment: data.downPayment ? parseFloat(data.downPayment) : undefined,
        termMonths: data.termMonths ? parseInt(data.termMonths) : undefined,
        apr: data.apr ? parseFloat(data.apr) : undefined,
        checkNumber: data.checkNumber,
      };

      const result = await fandiApi.purchasePlan(
        {
          ...selectedPlan,
          productId: (selectedPlan as any).id,
          ex1ProductId: (selectedPlan as any).id,
          providerDealerId: 'SAMP17064',
        },
        customer,
        vehicle,
        paymentDetails
      );

      toast.success('Purchase completed successfully!');
      onPurchaseComplete(result);
      onClose();
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Complete Purchase</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">{selectedPlan.name}</p>
          <p className="text-2xl font-bold text-gray-900">{selectedPlan.formattedPrice}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
            <select
              {...register('method', { required: 'Payment method is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select payment method</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="check">Check</option>
              <option value="financed">Finance (Add to loan)</option>
            </select>
          </div>

          {paymentMethod === 'financed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Down Payment</label>
                <input
                  type="number"
                  {...register('downPayment')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Term (months)</label>
                <input
                  type="number"
                  {...register('termMonths')}
                  defaultValue="60"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">APR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('apr')}
                  defaultValue="5.9"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {paymentMethod === 'check' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Check Number</label>
              <input
                {...register('checkNumber')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ${selectedPlan.formattedPrice}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}