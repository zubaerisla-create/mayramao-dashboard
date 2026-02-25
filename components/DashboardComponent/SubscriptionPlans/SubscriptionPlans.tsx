// app/dashboard/subscription-plans/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, PlusCircle, Infinity } from "lucide-react";
import { useGetSubscriptionsQuery, useCreateSubscriptionMutation, useUpdateSubscriptionMutation, useDeleteSubscriptionMutation } from "@/lib/store/apiSlice";
import toast from 'react-hot-toast';

interface Subscription {
  _id: string
  planName: string
  planType: 'monthly' | 'yearly' | 'forever'
  price: number
  duration: number
  simulationsLimit?: number
  simulationsUnlimited?: boolean
  features: string[]
  isActive: boolean
  activePlan: boolean
  createdAt: string
  updatedAt: string
}

export default function SubscriptionPlan() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Subscription | null>(null);

  // Fetch subscriptions with auto-refresh
  const { 
    data: subscriptionsData, 
    isLoading, 
    error,
    refetch 
  } = useGetSubscriptionsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Mutations
  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
  const [deleteSubscription, { isLoading: isDeleting }] = useDeleteSubscriptionMutation();

  // New plan form state
  const [newPlan, setNewPlan] = useState({
    planName: "",
    planType: "monthly" as 'monthly' | 'yearly' | 'forever',
    price: 0,
    duration: 30,
    simulationsUnlimited: true,
    simulationsLimit: 10,
    features: [] as string[],
    activePlan: true,
  });

  const [featureInputs, setFeatureInputs] = useState<string[]>([""]);

  // Edit plan form state
  const [editForm, setEditForm] = useState({
    planName: "",
    planType: "monthly" as 'monthly' | 'yearly' | 'forever',
    price: 0,
    duration: 30,
    simulationsUnlimited: true,
    simulationsLimit: 10,
    features: [] as string[],
    activePlan: true,
  });

  // Reset feature inputs when modal closes
  useEffect(() => {
    if (!showAddModal) {
      setFeatureInputs([""]);
      setNewPlan({
        planName: "",
        planType: "monthly",
        price: 0,
        duration: 30,
        simulationsUnlimited: true,
        simulationsLimit: 10,
        features: [],
        activePlan: true,
      });
    }
  }, [showAddModal]);

  // Set edit form when editing plan changes
  useEffect(() => {
    if (editingPlan) {
      setEditForm({
        planName: editingPlan.planName,
        planType: editingPlan.planType,
        price: editingPlan.price,
        duration: editingPlan.duration,
        simulationsUnlimited: editingPlan.simulationsUnlimited ?? !editingPlan.simulationsLimit,
        simulationsLimit: editingPlan.simulationsLimit || 10,
        features: [...editingPlan.features],
        activePlan: editingPlan.activePlan,
      });
    }
  }, [editingPlan]);

  const openEdit = (plan: Subscription) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  const handleCreate = async () => {
    // Filter out empty features
    const nonEmptyFeatures = featureInputs.filter(feature => feature.trim() !== "");
    
    if (!newPlan.planName.trim()) {
      toast.error('Plan name is required');
      return;
    }

    if (nonEmptyFeatures.length === 0) {
      toast.error('At least one feature is required');
      return;
    }

    if (newPlan.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (newPlan.duration <= 0 && newPlan.planType !== 'forever') {
      toast.error('Duration must be greater than 0');
      return;
    }

    // Base payload with required fields
    const payload: any = {
      planName: newPlan.planName,
      planType: newPlan.planType,
      price: newPlan.price,
      duration: newPlan.planType === 'forever' ? 36500 : newPlan.duration,
      features: nonEmptyFeatures,
      activePlan: newPlan.activePlan,
    };

    // OPTION 1: Send simulationsLimit with special value for unlimited
    if (newPlan.simulationsUnlimited) {
      // Send a very large number or -1 to indicate unlimited
      payload.simulationsLimit = 999999; // or -1 if your backend supports negative
    } else {
      if (newPlan.simulationsLimit <= 0) {
        toast.error('Simulations limit must be greater than 0');
        return;
      }
      payload.simulationsLimit = newPlan.simulationsLimit;
    }

    // OPTION 2: If backend expects a different field for unlimited
    // Uncomment this if option 1 doesn't work
    /*
    if (newPlan.simulationsUnlimited) {
      payload.unlimited = true;
      payload.simulationsLimit = 0; // or null
    } else {
      payload.unlimited = false;
      payload.simulationsLimit = newPlan.simulationsLimit;
    }
    */

    // OPTION 3: If backend expects both fields
    /*
    payload.simulationsUnlimited = newPlan.simulationsUnlimited;
    if (!newPlan.simulationsUnlimited) {
      payload.simulationsLimit = newPlan.simulationsLimit;
    }
    */

    console.log('Sending payload:', payload); // Debug log

    try {
      const response = await createSubscription(payload).unwrap();

      if (response.success) {
        toast.success('Subscription plan created successfully!');
        setShowAddModal(false);
        refetch();
      }
    } catch (err: any) {
      console.error('Create error:', err);
      console.error('Error data:', err.data); // Debug log
      toast.error(err.data?.message || 'Failed to create subscription');
    }
  };

  const handleUpdate = async () => {
    if (!editingPlan) return;

    if (!editForm.planName.trim()) {
      toast.error('Plan name is required');
      return;
    }

    if (editForm.features.length === 0) {
      toast.error('At least one feature is required');
      return;
    }

    if (editForm.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    // Base payload with required fields
    const payload: any = {
      planName: editForm.planName,
      planType: editForm.planType,
      price: editForm.price,
      duration: editForm.planType === 'forever' ? 36500 : editForm.duration,
      features: editForm.features,
      activePlan: editForm.activePlan,
    };

    // OPTION 1: Send simulationsLimit with special value for unlimited
    if (editForm.simulationsUnlimited) {
      // Send a very large number or -1 to indicate unlimited
      payload.simulationsLimit = 999999; // or -1 if your backend supports negative
    } else {
      if (editForm.simulationsLimit <= 0) {
        toast.error('Simulations limit must be greater than 0');
        return;
      }
      payload.simulationsLimit = editForm.simulationsLimit;
    }

    // OPTION 2: If backend expects a different field for unlimited
    // Uncomment this if option 1 doesn't work
    /*
    if (editForm.simulationsUnlimited) {
      payload.unlimited = true;
      payload.simulationsLimit = 0; // or null
    } else {
      payload.unlimited = false;
      payload.simulationsLimit = editForm.simulationsLimit;
    }
    */

    // OPTION 3: If backend expects both fields
    /*
    payload.simulationsUnlimited = editForm.simulationsUnlimited;
    if (!editForm.simulationsUnlimited) {
      payload.simulationsLimit = editForm.simulationsLimit;
    }
    */

    console.log('Sending update payload:', payload); // Debug log

    try {
      const response = await updateSubscription({
        id: editingPlan._id,
        data: payload,
      }).unwrap();

      if (response.success) {
        toast.success('Subscription plan updated successfully!');
        setShowEditModal(false);
        setEditingPlan(null);
        refetch();
      }
    } catch (err: any) {
      console.error('Update error:', err);
      console.error('Error data:', err.data); // Debug log
      toast.error(err.data?.message || 'Failed to update subscription');
    }
  };

  const handleDelete = async (id: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete "${planName}"?`)) {
      return;
    }

    try {
      const response = await deleteSubscription(id).unwrap();
      if (response.success) {
        toast.success('Subscription deleted successfully!');
        refetch();
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.data?.message || 'Failed to delete subscription');
    }
  };

  const handleToggleActive = async (plan: Subscription) => {
    try {
      const response = await updateSubscription({
        id: plan._id,
        data: {
          activePlan: !plan.activePlan,
        },
      }).unwrap();

      if (response.success) {
        toast.success(`Plan ${!plan.activePlan ? 'activated' : 'deactivated'} successfully!`);
        refetch();
      }
    } catch (err: any) {
      console.error('Toggle error:', err);
      toast.error(err.data?.message || 'Failed to update plan status');
    }
  };

  const addFeatureField = () => {
    setFeatureInputs([...featureInputs, ""]);
  };

  const updateFeatureField = (index: number, value: string) => {
    const updated = [...featureInputs];
    updated[index] = value;
    setFeatureInputs(updated);
  };

  const removeFeatureField = (index: number) => {
    if (featureInputs.length > 1) {
      setFeatureInputs(featureInputs.filter((_, i) => i !== index));
    }
  };

  const handleEditFeatureChange = (index: number, value: string) => {
    const updated = [...editForm.features];
    updated[index] = value;
    setEditForm({ ...editForm, features: updated });
  };

  const removeEditFeature = (index: number) => {
    if (editForm.features.length > 1) {
      setEditForm({
        ...editForm,
        features: editForm.features.filter((_, i) => i !== index)
      });
    }
  };

  const addEditFeature = () => {
    setEditForm({
      ...editForm,
      features: [...editForm.features, ""]
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number, isEdit: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEdit) {
        if (index === editForm.features.length - 1) {
          addEditFeature();
        }
      } else {
        if (index === featureInputs.length - 1) {
          addFeatureField();
        }
      }
    }
  };

  const getDurationText = (plan: Subscription) => {
    if (plan.planType === 'forever') return 'Forever';
    if (plan.duration === 30) return '1 Month';
    if (plan.duration === 90) return '3 Months';
    if (plan.duration === 365) return '12 Months';
    if (plan.duration === 36500) return 'Forever';
    return `${plan.duration} Days`;
  };

  const getSimulationsText = (plan: Subscription) => {
    if (plan.simulationsUnlimited) return 'Unlimited simulations';
    return `${plan.simulationsLimit} simulations per month`;
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to load subscriptions</div>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const plans = subscriptionsData?.subscriptions || [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-9xl space-y-8">
        {/* Header with auto-refresh indicator */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[30px] font-bold text-gray-900">Subscription Plans</h1>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>live</span>
              </div>
            </div>
            <p className="mt-1.5 text-sm text-gray-600">
              Create and manage subscription plan types
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            <Plus size={18} /> Add Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-2xl border p-6 shadow-sm ${
                plan.planType === "yearly" ? "border-amber-200 bg-gradient-to-b from-amber-50/70 to-white" : "bg-white"
              }`}
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{plan.planName}</h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        plan.activePlan
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {plan.activePlan ? "Active" : "Inactive"}
                    </span>
                    {plan.planType !== "forever" && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 capitalize">
                        {plan.planType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(plan)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id, plan.planName)}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-5">
                <p className="text-3xl font-bold text-gray-900">
                  ${formatPrice(plan.price)}
                  {plan.planType !== 'forever' && (
                    <span className="text-lg font-normal text-gray-500">
                      /{getDurationText(plan)}
                    </span>
                  )}
                </p>
              </div>

              {/* Simulations Limit with Unlimited Indicator */}
              <div className="mb-4 flex items-center gap-2">
                {plan.simulationsUnlimited ? (
                  <>
                    <Infinity size={18} className="text-emerald-600" />
                    <p className="text-sm font-medium text-gray-700">Unlimited simulations</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-700">
                    {plan.simulationsLimit} simulations per month
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="mb-6 space-y-2.5 text-sm text-gray-700">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <button
                onClick={() => handleToggleActive(plan)}
                className={`w-full rounded-lg py-2.5 text-sm font-medium transition ${
                  plan.activePlan
                    ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {plan.activePlan ? "× Deactivate Plan" : "✓ Activate Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ──────── ADD NEW PLAN MODAL ──────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Add New Subscription Plan</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-full p-1.5 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Premium Monthly"
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({...newPlan, planName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan Type *</label>
                  <select 
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    value={newPlan.planType}
                    onChange={(e) => setNewPlan({...newPlan, planType: e.target.value as 'monthly' | 'yearly' | 'forever'})}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {newPlan.planType !== 'forever' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (days) *</label>
                  <select 
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({...newPlan, duration: parseInt(e.target.value)})}
                  >
                    <option value={30}>1 Month (30 days)</option>
                    <option value={90}>3 Months (90 days)</option>
                    <option value={365}>12 Months (365 days)</option>
                  </select>
                </div>
              )}

              {/* Simulations Unlimited Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Simulations
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setNewPlan({...newPlan, simulationsUnlimited: true})}
                    className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                      newPlan.simulationsUnlimited
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Infinity size={18} />
                    <span className="text-sm font-medium">Unlimited</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlan({...newPlan, simulationsUnlimited: false})}
                    className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                      !newPlan.simulationsUnlimited
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">Limited</span>
                  </button>
                </div>

                {!newPlan.simulationsUnlimited && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simulations Limit (per month) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newPlan.simulationsLimit}
                      onChange={(e) => setNewPlan({...newPlan, simulationsLimit: parseInt(e.target.value)})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Enter simulation limit"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Features *</label>
                
                {/* Dynamic Feature Input Fields */}
                <div className="mt-2 space-y-2">
                  {featureInputs.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Feature ${index + 1}`}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        value={feature}
                        onChange={(e) => updateFeatureField(index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                      />
                      {featureInputs.length > 1 && (
                        <button
                          onClick={() => removeFeatureField(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Feature Button */}
                <button
                  onClick={addFeatureField}
                  className="mt-3 flex items-center gap-1 rounded-lg bg-white px-4 py-2.5 text-sm text-black cursor-pointer border border-gray-300 hover:bg-gray-100 transition w-full justify-center"
                >
                  <PlusCircle size={16} /> Add Another Feature
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activePlan"
                  checked={newPlan.activePlan}
                  onChange={(e) => setNewPlan({...newPlan, activePlan: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activePlan" className="text-sm text-gray-700">
                  Activate plan immediately
                </label>
              </div>

              <p className="text-xs text-gray-500">
                Note: Changes to subscription plans will affect new subscriptions. Existing user
                subscriptions will remain unchanged unless manually updated.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────── EDIT PLAN MODAL ──────── */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Subscription Plan</h2>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-1.5 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name *</label>
                <input
                  type="text"
                  value={editForm.planName}
                  onChange={(e) => setEditForm({...editForm, planName: e.target.value})}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan Type *</label>
                  <select 
                    value={editForm.planType}
                    onChange={(e) => setEditForm({...editForm, planType: e.target.value as 'monthly' | 'yearly' | 'forever'})}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              {editForm.planType !== 'forever' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (days) *</label>
                  <select 
                    value={editForm.duration}
                    onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value)})}
                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                  >
                    <option value={30}>1 Month (30 days)</option>
                    <option value={90}>3 Months (90 days)</option>
                    <option value={365}>12 Months (365 days)</option>
                  </select>
                </div>
              )}

              {/* Simulations Unlimited Toggle for Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Simulations
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({...editForm, simulationsUnlimited: true})}
                    className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                      editForm.simulationsUnlimited
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Infinity size={18} />
                    <span className="text-sm font-medium">Unlimited</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({...editForm, simulationsUnlimited: false})}
                    className={`flex-1 py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
                      !editForm.simulationsUnlimited
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">Limited</span>
                  </button>
                </div>

                {!editForm.simulationsUnlimited && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simulations Limit (per month) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.simulationsLimit}
                      onChange={(e) => setEditForm({...editForm, simulationsLimit: parseInt(e.target.value)})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Enter simulation limit"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Features *</label>
                <div className="mt-2 space-y-2">
                  {editForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleEditFeatureChange(index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index, true)}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      {editForm.features.length > 1 && (
                        <button
                          onClick={() => removeEditFeature(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addEditFeature}
                    className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400"
                  >
                    <PlusCircle size={16} /> Add Feature
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editActivePlan"
                  checked={editForm.activePlan}
                  onChange={(e) => setEditForm({...editForm, activePlan: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="editActivePlan" className="text-sm text-gray-700">
                  Plan is active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  'Update Plan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}