export interface Product {
  ex1ProductId: number;
  productCode: string;
  productName: string;
  providerDealerId: string;
  contractPrefix: string | null;
  approved: boolean;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Vehicle {
  vin: string;
  odometer: number;
  carStatus: 'New' | 'Used' | 'CPO';
  dealType: 'Lease' | 'Loan' | 'Cash' | 'Balloon Loan';
  contractDate?: string;
  purchasePrice?: number;
  financeTerm?: number;
  amountFinanced?: number;
  downPayment?: number;
  year?: number;
  make?: string;
  model?: string;
}

// Updated to match the API's ProductOption structure
export interface Plan {
  name: string;
  termMonths: number;
  termMiles: string | number | null;
  price: number;
  formattedPrice: string;
  monthlyPayment: string | null;
  deductible: string;
  contractFormId: number; // Changed from string to number
  rateResponseId: string;
  isPromotional: boolean;
  dealerCost?: number;
  profit?: number;
}

// Fixed the naming to match your actual API Response keys
export interface ProductWithPlans {
  productId: number;
  productName: string;
  productCode: string;
  options: Plan[]; // API returns 'options', containing Plan-shaped data
}

export interface QuoteResponse {
  customer: Customer;
  vehicle: Vehicle;
  products: ProductWithPlans[];
}

export interface PaymentDetails {
  method: 'cash' | 'credit_card' | 'financed' | 'check';
  downPayment?: number;
  termMonths?: number;
  apr?: number;
  checkNumber?: string;
  paymentMethodId?: string;
}