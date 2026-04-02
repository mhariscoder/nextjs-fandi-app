import axios from 'axios';
import { Customer, Vehicle } from '../types';

export interface PaymentDetails {
  method: string;
  transactionId?: string;
}
// ----------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web.safehunt.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add an interceptor to catch errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fandiApi = {
  // Get products
  getProducts: async () => {
    const response = await api.get('/fandi/products');
    return response.data;
  },

  // Get formatted quotes
  getQuotes: async (customer: Customer, vehicle: Vehicle, productIds?: number[]) => {
    const response = await api.post('/fandi/quotes', {
      customer,
      vehicle,
      productIds,
    });
    return response.data;
  },

  // Purchase plan
  purchasePlan: async (
    selectedPlan: any,
    customer: Customer,
    vehicle: Vehicle,
    paymentDetails: PaymentDetails
  ) => {
    const response = await api.post('/fandi/purchase', {
      selectedPlan,
      customer,
      vehicle,
      paymentDetails,
    });
    return response.data;
  },

  // Get contract status
  getContractStatus: async (contractNumber: string) => {
    const response = await api.post('/fandi/contracts/status', {
      EX1ContractStatusRequest: {
        // Ensure this is a number
        EX1DealerID: Number(process.env.NEXT_PUBLIC_FANDI_DEALER_ID) || 16549,
        ContractNumber: contractNumber,
        EX1ProviderID: 'SAMP17064',
      },
    });
    return response.data;
  },

  // Void contract
  voidContract: async (contractNumber: string, reason: string) => {
    const response = await api.post('/fandi/contracts/void', {
      EX1ContractVoidRequest: {
        EX1DealerID: Number(process.env.NEXT_PUBLIC_FANDI_DEALER_ID) || 16549,
        ContractNumber: contractNumber,
        EX1ProviderID: 'SAMP17064',
        VoidReason: reason,
      },
    });
    return response.data;
  },
};