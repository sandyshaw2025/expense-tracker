'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, DollarSign, TrendingUp, Edit2, Trash2, Check, X, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

type Expense = Database['public']['Tables']['expenses']['Row']
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']

interface Props {
  user: User
}

export default function ExpenseTracker({ user }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('transactions')
  
  // Form states
  const [formData, setFormData] = useState<Omit<ExpenseInsert, 'user_id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense',
    category: '',
    description: '',
    entity: '',
    payment_method: '',
    payment_details: '',
    account_used: ''
  })

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    period: '',
    category: '',
    entity: '',
    type: '',
    minAmount: '',
    maxAmount: ''
  })

  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    'Salary', 'Freelance/Contract', 'Business Income', 'Investment Income', 
    'Dividends', 'Interest', 'Rental Income', 'Side Hustle', 'Tax Refund', 
    'Gifts Received', 'Other Income', 'Housing/Rent', 'Mortgage', 'Property Tax', 
    'Home Insurance', 'Utilities', 'Phone', 'Internet', 'Groceries', 'Transportation', 
    'Gas/Fuel', 'Car Payment', 'Auto Insurance', 'Car Maintenance', 'Healthcare', 
    'Health Insurance', 'Prescription Meds', 'Childcare', 'Home Repairs', 
    'Home Improvement', 'Lawn Care', 'Pest Control', 'House Cleaning', 
    'Home Security', 'Appliances', 'Furniture', 'Dining Out', 'Coffee/Drinks', 
    'Entertainment', 'Streaming Services', 'Gym/Fitness', 'Beauty/Personal Care', 
    'Clothing', 'Shopping', 'Hobbies', 'Books/Education', 'Gifts Given', 
    'Charity/Donations', 'Bank Fees', 'Credit Card Fees', 'Investment Fees', 
    'Tax Preparation', 'Professional Services', 'Legal Fees', 'Accounting', 
    'Travel/Vacation', 'Hotels', 'Flights', 'Travel Food', 'Pet Food', 
    'Veterinary', 'Pet Supplies', 'Pet Insurance', 'Miscellaneous', 'Cash Withdrawal', 'Other'
  ]

  const paymentMethods = [
    'Cash', 'Check', 'Debit Card', 'Credit Card', 'Bank Transfer', 
    'Zelle', 'Venmo', 'PayPal', 'Apple Pay', 'Google Pay', 'CashApp',
    'Wire Transfer', 'ACH Transfer', 'Direct Deposit', 'Money Order', 'Other'
  ]

  // Load expenses from Supabase
  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading expenses:', error)
        return
      }

      setExpenses(data || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Period calculation helper
  const getPeriodDates = (period: string) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    switch (period) {
      case 'this-month':
        return {
          dateFrom: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          dateTo: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        }
      case 'last-month':
        return {
          dateFrom: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          dateTo: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        }
      case 'this-quarter':
        const quarterStart = Math.floor(currentMonth / 3) * 3
        return {
          dateFrom: new Date(currentYear, quarterStart, 1).toISOString().split('T')[0],
          dateTo: new Date(currentYear, quarterStart + 3, 0).toISOString().split('T')[0]
        }
      case 'this-year':
        return {
          dateFrom: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          dateTo: new Date(currentYear, 11, 31).toISOString().split('T')[0]
        }
      case 'last-30-days':
        return {
          dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: now.toISOString().split('T')[0]
        }
      default:
        return { dateFrom: '', dateTo: '' }
    }
  }

  const handlePeriodChange = (period: string) => {
    if (period === '') {
      setFilters(prev => ({ ...prev, period: '', dateFrom: '', dateTo: '' }))
    } else {
      const dates = getPeriodDates(period)
      setFilters(prev => ({ ...prev, period, dateFrom: dates.dateFrom, dateTo: dates.dateTo }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.amount || !formData.category || !formData.description || !formData.entity) {
      alert('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('expenses')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([formData])

        if (error) throw error
      }

      await loadExpenses()
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        type: 'expense',
        category: '',
        description: '',
        entity: '',
        payment_method: '',
        payment_details: '',
        account_used: ''
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Error saving expense')
    }
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      date: expense.date,
      amount: expense.amount,
      type: expense.type,
      category: expense.category,
      description: expense.description,
      entity: expense.entity,
      payment_method: expense.payment_method,
      payment_details: expense.payment_details,
      account_used: expense.account_used
    })
    setEditingId(expense.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Error deleting expense')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm || 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())

    const effectiveDateFrom = filters.period ? getPeriodDates(filters.period).dateFrom : filters.dateFrom
    const effectiveDateTo = filters.period ? getPeriodDates(filters.period).dateTo : filters.dateTo

    const matchesDateFrom = !effectiveDateFrom || expense.date >= effectiveDateFrom
    const matchesDateTo = !effectiveDateTo || expense.date <= effectiveDateTo
    const matchesCategory = !filters.category || expense.category === filters.category
    const matchesEntity = !filters.entity || expense.entity.toLowerCase().includes(filters.entity.toLowerCase())
    const matchesType = !filters.type || expense.type === filters.type
    const matchesMinAmount = !filters.minAmount || expense.amount >= parseFloat(filters.minAmount)
    const matchesMaxAmount = !filters.maxAmount || expense.amount <= parseFloat(filters.maxAmount)

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesCategory && 
           matchesEntity && matchesType && matchesMinAmount && matchesMaxAmount
  })

  // Analytics
  const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpenses

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Smart Expense Tracker</h1>
            <p className="text-blue-100 text-sm">Welcome, {user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-lg text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 text-center ${
              activeTab === 'transactions' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-1" />
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-3 px-4 text-center ${
              activeTab === 'reports' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Reports
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 text-sm font-medium">Income</div>
            <div className="text-2xl font-bold text-green-700">${totalIncome.toFixed(2)}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-red-600 text-sm font-medium">Expenses</div>
            <div className="text-2xl font-bold text-red-700">${totalExpenses.toFixed(2)}</div>
          </div>
          <div className={`p-4 rounded-lg border ${netIncome >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className={`text-sm font-medium ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net</div>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>${netIncome.toFixed(2)}</div>
          </div>
        </div>

        {activeTab === 'transactions' && (
          <>
            {/* Controls */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Period Filters */}
            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {[
                    { value: 'this-month', label: 'This Month' },
                    { value: 'last-month', label: 'Last Month' },
                    { value: 'this-quarter', label: 'This Quarter' },
                    { value: 'this-year', label: 'This Year' },
                    { value: 'last-30-days', label: 'Last 30 Days' }
                  ].map(period => (
                    <button
                      key={period.value}
                      onClick={() => handlePeriodChange(period.value)}
                      className={`px-3 py-2 text-xs rounded-lg border ${
                        filters.period === period.value
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setFilters({ dateFrom: '', dateTo: '', period: '', category: '', entity: '', type: '', minAmount: '', maxAmount: '' })}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Transaction List */}
            <div className="space-y-4">
              {filteredExpenses.map(expense => (
                <div key={expense.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          expense.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {expense.category}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-600">{expense.entity}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Date: {new Date(expense.date).toLocaleDateString()}</div>
                    {expense.payment_method && (
                      <div>Payment: {expense.payment_method} {expense.payment_details && `(${expense.payment_details})`}</div>
                    )}
                    {expense.account_used && <div>Account: {expense.account_used}</div>}
                  </div>
                </div>
              ))}
            </div>

            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No transactions found. Add your first transaction to get started!
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-md md:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {editingId ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      amount: 0, type: 'expense', category: '', description: '',
                      entity: '', payment_method: '', payment_details: '', account_used: ''
                    })
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity/Company</label>
                <input
                  type="text"
                  value={formData.entity}
                  onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}
                  placeholder="Who you paid or received from"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={formData.payment_method || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                <input
                  type="text"
                  value={formData.payment_details || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_details: e.target.value }))}
                  placeholder="Check #, Card ****1234, etc."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Used</label>
                <input
                  type="text"
                  value={formData.account_used || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_used: e.target.value }))}
                  placeholder="Checking ****1234, Investment Account, etc."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}