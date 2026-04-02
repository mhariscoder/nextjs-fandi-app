'use client';

import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}

export default function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {plan.isPromotional && (
        <div className="mb-2">
          <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            🔥 Promotional Price!
          </span>
        </div>
      )}
      
      <h4 className="font-semibold text-gray-900 mb-2">{plan.name}</h4>
      
      <div className="space-y-1 text-sm text-gray-600">
        <p>Term: {plan.termMonths} months</p>
        {plan.termMiles && <p>Miles: {plan.termMiles}</p>}
        {plan.deductible !== 'N/A' && <p>Deductible: {plan.deductible}</p>}
      </div>
      
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{plan.formattedPrice}</p>
        {plan.monthlyPayment && (
          <p className="text-sm text-gray-500">or {plan.monthlyPayment}/month</p>
        )}
      </div>
      
      <button
        className={`mt-4 w-full py-2 rounded-md transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
}