import React, { useState } from 'react';
import { CustomExpense } from '../types';

interface CustomExpensesSectionProps {
  expenses: CustomExpense[];
  dayId: string;
  onAddExpense: (dayId: string, expense: Omit<CustomExpense, 'id'>) => any;
  onUpdateExpense: (dayId: string, expenseId: string, updates: Partial<CustomExpense>) => void;
  onRemoveExpense: (dayId: string, expenseId: string) => void;
  currency: string;
}

const CustomExpensesSection: React.FC<CustomExpensesSectionProps> = ({
  expenses,
  dayId,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  currency
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  const [newExpense, setNewExpense] = useState<Omit<CustomExpense, 'id'>>({
    name: '',
    amount: 0,
    category: 'other',
    date: '', // This will be set based on the day's date
    notes: '',
    isPaid: false
  });
  
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense(dayId, newExpense);
    setNewExpense({
      name: '',
      amount: 0,
      category: 'other',
      date: '',
      notes: '',
      isPaid: false
    });
    setShowAddForm(false);
  };
  
  const handleEditExpense = (expense: CustomExpense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || '',
      isPaid: expense.isPaid || false
    });
    setShowAddForm(true);
  };
  
  const handleUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpenseId) {
      onUpdateExpense(dayId, editingExpenseId, newExpense);
      setEditingExpenseId(null);
      setNewExpense({
        name: '',
        amount: 0,
        category: 'other',
        date: '',
        notes: '',
        isPaid: false
      });
      setShowAddForm(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setNewExpense({
        ...newExpense,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else if (name === 'amount') {
      setNewExpense({
        ...newExpense,
        [name]: parseFloat(value) || 0
      });
    } else {
      setNewExpense({
        ...newExpense,
        [name]: value
      });
    }
  };
  
  // Group expenses by category
  const expensesByCategory: Record<string, CustomExpense[]> = {};
  
  expenses.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = [];
    }
    expensesByCategory[expense.category].push(expense);
  });
  
  // Currency symbol
  const currencySymbol = currency === 'JPY' ? '¥' : '$';
  
  // Category labels
  const categoryLabels: Record<string, string> = {
    accommodation: 'Accommodation',
    food: 'Food & Drinks',
    activities: 'Activities',
    transportation: 'Transportation',
    shopping: 'Shopping',
    other: 'Other'
  };
  
  // Category icons
  const categoryIcons: Record<string, string> = {
    accommodation: '🏨',
    food: '🍴',
    activities: '🎭',
    transportation: '🚆',
    shopping: '🛍️',
    other: '📝'
  };
  
  return (
    <div className="mt-4 border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Custom Expenses</h3>
        <button
          onClick={() => {
            setEditingExpenseId(null);
            setNewExpense({
              name: '',
              amount: 0,
              category: 'other',
              date: '',
              notes: '',
              isPaid: false
            });
            setShowAddForm(!showAddForm);
          }}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150"
        >
          {showAddForm ? 'Cancel' : 'Add Expense'}
        </button>
      </div>
      
      {showAddForm && (
        <form 
          onSubmit={editingExpenseId ? handleUpdateExpense : handleAddExpense}
          className="mb-6 p-4 border rounded bg-gray-50"
        >
          <h4 className="font-medium mb-3">
            {editingExpenseId ? 'Edit Expense' : 'New Expense'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Name
              </label>
              <input
                type="text"
                name="name"
                value={newExpense.name}
                onChange={handleChange}
                required
                placeholder="e.g., Bus Pass, Souvenir Shopping"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                name="amount"
                value={newExpense.amount || ''}
                onChange={handleChange}
                required
                min="0"
                step="any"
                placeholder="0.00"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={newExpense.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="accommodation">Accommodation</option>
                <option value="food">Food & Drinks</option>
                <option value="activities">Activities</option>
                <option value="transportation">Transportation</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center h-full pt-2">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={newExpense.isPaid}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                />
                <span className="text-sm">Paid</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={newExpense.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              className="w-full p-2 border border-gray-300 rounded-md h-20"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
            >
              {editingExpenseId ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      )}
      
      {expenses.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">
          No custom expenses added yet
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => (
            <div key={category} className="mb-4">
              <h4 className="font-medium text-gray-700 flex items-center mb-2">
                <span className="mr-2">{categoryIcons[category]}</span>
                {categoryLabels[category]}
                <span className="ml-2 text-sm text-gray-500">
                  ({categoryExpenses.length} {categoryExpenses.length === 1 ? 'item' : 'items'})
                </span>
              </h4>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryExpenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expense.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          {currencySymbol}{expense.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            expense.isPaid 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {expense.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate">
                          {expense.notes || '-'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onRemoveExpense(dayId, expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomExpensesSection; 