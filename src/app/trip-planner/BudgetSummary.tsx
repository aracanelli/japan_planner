import React, { useState } from 'react';
import { CustomExpense } from '../types';

type BudgetCategory = 'accommodation' | 'food' | 'activities' | 'transportation' | 'shopping' | 'other';

interface BudgetSummaryProps {
  budget: {
    accommodation: number;
    food: number;
    activities: number;
    transportation: number;
    shopping: number;
    other: number;
  };
  customExpenses: CustomExpense[];
  currency: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  budget,
  customExpenses,
  currency
}) => {
  const [expandedCategory, setExpandedCategory] = useState<BudgetCategory | null>(null);
  
  // Calculate totals
  const totalBudget = Object.values(budget).reduce((sum, value) => sum + value, 0);
  
  // Group custom expenses by category
  const expensesByCategory = customExpenses.reduce<Record<BudgetCategory, CustomExpense[]>>((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {
    accommodation: [],
    food: [],
    activities: [],
    transportation: [],
    shopping: [],
    other: []
  });
  
  // Calculate total for each category's custom expenses
  const customExpenseTotals = Object.entries(expensesByCategory).reduce<Record<string, number>>((acc, [category, expenses]) => {
    acc[category] = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return acc;
  }, {});
  
  // Category icons and labels
  const categoryIcons: Record<string, string> = {
    accommodation: '🏨',
    food: '🍴',
    activities: '🎭',
    transportation: '🚆',
    shopping: '🛍️',
    other: '📝'
  };
  
  const categoryLabels: Record<string, string> = {
    accommodation: 'Accommodation',
    food: 'Food & Drinks',
    activities: 'Activities',
    transportation: 'Transportation',
    shopping: 'Shopping',
    other: 'Other'
  };
  
  // Currency symbol
  const currencySymbol = currency === 'JPY' ? '¥' : '$';
  
  // Color classes for each category
  const categoryColors: Record<string, string> = {
    accommodation: 'bg-purple-100 text-purple-800',
    food: 'bg-green-100 text-green-800',
    activities: 'bg-blue-100 text-blue-800',
    transportation: 'bg-yellow-100 text-yellow-800',
    shopping: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
  };
  
  const toggleCategory = (category: BudgetCategory) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600">Total Budget:</div>
        <div className="text-2xl font-bold text-green-600">{currencySymbol}{totalBudget.toLocaleString()}</div>
      </div>
      
      <div className="space-y-3">
        {Object.entries(budget).map(([category, amount]) => (
          <div key={category} className="border rounded-md overflow-hidden">
            <div 
              className={`flex justify-between items-center p-3 cursor-pointer ${categoryColors[category]}`}
              onClick={() => toggleCategory(category as BudgetCategory)}
            >
              <div className="flex items-center">
                <span className="mr-2">{categoryIcons[category]}</span>
                <span className="font-medium">{categoryLabels[category]}</span>
                {customExpenseTotals[category] > 0 && (
                  <span className="ml-2 text-xs bg-white bg-opacity-50 rounded-full px-2 py-0.5">
                    {expensesByCategory[category as BudgetCategory].length} custom items
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="font-semibold">{currencySymbol}{amount.toLocaleString()}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ml-2 transition-transform ${expandedCategory === category ? 'transform rotate-180' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {expandedCategory === category && expensesByCategory[category as BudgetCategory].length > 0 && (
              <div className="bg-white p-3 border-t">
                <div className="text-sm font-medium text-gray-500 mb-2">Custom Expenses</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {expensesByCategory[category as BudgetCategory].map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{expense.name}</div>
                        <div className="text-xs text-gray-500">{expense.notes || 'No notes'}</div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          expense.isPaid 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <span className="ml-2 font-medium">{currencySymbol}{expense.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-2">Expense Breakdown</div>
        <div className="h-6 rounded-full overflow-hidden flex">
          {Object.entries(budget).map(([category, amount]) => {
            if (amount === 0) return null;
            const percentage = (amount / totalBudget) * 100;
            return (
              <div 
                key={category}
                className={`${categoryColors[category].split(' ')[0]} h-full`}
                style={{ width: `${percentage}%` }}
                title={`${categoryLabels[category]}: ${currencySymbol}${amount.toLocaleString()} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap mt-2 text-xs">
          {Object.entries(budget).filter(([_, amount]) => amount > 0).map(([category, amount]) => {
            const percentage = (amount / totalBudget) * 100;
            return (
              <div key={category} className="mr-4 mb-2 flex items-center">
                <div className={`w-3 h-3 mr-1 rounded-sm ${categoryColors[category].split(' ')[0]}`} />
                <span>{categoryLabels[category]}: {percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary; 