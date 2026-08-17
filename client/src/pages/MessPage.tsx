import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MessMenu, Hostel } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, Edit2, Sparkles, Coffee, Sun, Moon, Flame, Loader2 } from 'lucide-react';
import { MOCK_MESS_MENUS, MOCK_HOSTELS } from '../services/mockData';

export const MessPage: React.FC = () => {
  const [menus, setMenus] = useState<MessMenu[]>(MOCK_MESS_MENUS);
  const [hostels, setHostels] = useState<Hostel[]>(MOCK_HOSTELS);
  const [selectedHostel, setSelectedHostel] = useState('hostel-01');
  const [selectedDay, setSelectedDay] = useState<string>('MONDAY');
  const [loading, setLoading] = useState(false);

  // Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    dayOfWeek: string;
    mealType: string;
    items: string;
    specialItem: string;
    calorieCount: string;
  }>({
    dayOfWeek: 'MONDAY',
    mealType: 'BREAKFAST',
    items: '',
    specialItem: '',
    calorieCount: '500',
  });

  const { success, error } = useToast();
  const { hasRole } = useAuth();

  const daysList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const fetchHostels = async () => {
    try {
      const res = await api.get('/hostels');
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setHostels(res.data.data);
      } else {
        setHostels(MOCK_HOSTELS);
      }
    } catch (err) {
      setHostels(MOCK_HOSTELS);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mess/menu', {
        params: {
          hostelId: selectedHostel,
          dayOfWeek: selectedDay,
        },
      });
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        setMenus(res.data.data);
      } else {
        setMenus(MOCK_MESS_MENUS);
      }
    } catch (err: any) {
      setMenus(MOCK_MESS_MENUS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [selectedHostel, selectedDay]);

  const handleUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/mess/menu', {
        hostelId: selectedHostel,
        ...editingItem,
      });
      if (res.data.success) {
        success('Menu item updated successfully!');
        setIsModalOpen(false);
        fetchMenu();
      }
    } catch (err: any) {
      const updated = menus.map(m =>
        m.dayOfWeek === editingItem.dayOfWeek && m.mealType === editingItem.mealType
          ? { ...m, items: editingItem.items, specialItem: editingItem.specialItem, calorieCount: Number(editingItem.calorieCount) }
          : m
      );
      setMenus(updated);
      success('Meal schedule saved (Preview Mode)!');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'BREAKFAST':
        return <Coffee className="w-5 h-5 text-amber-600" />;
      case 'LUNCH':
        return <Sun className="w-5 h-5 text-orange-600" />;
      case 'SNACKS':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'DINNER':
      default:
        return <Moon className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Weekly Mess & Food Menu</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nutritional schedule, dining hall timings, and daily meal plans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Hostel:</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="p-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold shadow-sm focus:outline-none"
          >
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {daysList.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedDay === day
                ? 'bg-brand-600 text-white shadow-brand-600/30'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 4 Meal Cards (Breakfast, Lunch, Snacks, Dinner) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'].map((mealType) => {
          const menuItem = menus.find((m) => m.mealType === mealType && (m.dayOfWeek === selectedDay || !m.dayOfWeek));
          const mealTiming =
            mealType === 'BREAKFAST'
              ? '07:30 AM - 09:30 AM'
              : mealType === 'LUNCH'
              ? '12:30 PM - 02:30 PM'
              : mealType === 'SNACKS'
              ? '05:00 PM - 06:15 PM'
              : '07:30 PM - 09:30 PM';

          return (
            <div
              key={mealType}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      {getMealIcon(mealType)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{mealType}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{mealTiming}</p>
                    </div>
                  </div>

                  {hasRole(['SUPER_ADMIN', 'ADMIN', 'MESS_STAFF', 'WARDEN']) && (
                    <button
                      onClick={() => {
                        setEditingItem({
                          dayOfWeek: selectedDay,
                          mealType,
                          items: menuItem?.items || '',
                          specialItem: menuItem?.specialItem || '',
                          calorieCount: String(menuItem?.calorieCount || 500),
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Menu Courses & Items
                    </span>
                    <p className="text-slate-800 text-sm font-semibold mt-1 leading-relaxed">
                      {menuItem?.items || (mealType === 'BREAKFAST' ? 'Idli, Sambar, Medu Vada, Tea / Milk' : mealType === 'LUNCH' ? 'Dal Fry, Jeera Rice, Paneer Butter Masala, Roti, Salad' : mealType === 'SNACKS' ? 'Samosa, Mint Chutney, Masala Chai' : 'Kadai Paneer, Dal Tadka, Rice, Butter Naan, Sweet Kheer')}
                    </p>
                  </div>

                  {menuItem?.specialItem && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Daily Special:</span> {menuItem.specialItem}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Est. Calories: <strong className="text-slate-700">{menuItem?.calorieCount || 550} kcal</strong></span>
                </div>
                <Badge variant="success">ACTIVE MENU</Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Menu Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit ${editingItem.mealType} (${editingItem.dayOfWeek})`}>
        <form onSubmit={handleUpdateMenu} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Meal Food Items (Comma-separated) *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Masala Dosa, Sambar, Coconut Chutney, Tea"
              value={editingItem.items}
              onChange={(e) => setEditingItem({ ...editingItem, items: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Special Item / Dessert</label>
              <input
                type="text"
                placeholder="e.g. Gulab Jamun"
                value={editingItem.specialItem}
                onChange={(e) => setEditingItem({ ...editingItem, specialItem: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimated Calories (kcal)</label>
              <input
                type="number"
                value={editingItem.calorieCount}
                onChange={(e) => setEditingItem({ ...editingItem, calorieCount: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Meal Menu'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
