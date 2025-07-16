'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Pet, PetFormData, ValidationErrors } from '@/types';
import { LoadingSpinner, EmptyState } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { PetList } from '@/components/PetList';
import { SearchInput } from '@/components/SearchInput';
import { validatePetForm as validatePet, hasValidationErrors as hasErrors } from '@/utils/validation';
import { petApi as petAPI } from '@/utils/api';

export default function PetsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const supabase = createClient();
  const router = useRouter();

  // 表單狀態
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    pet_type: '',
    breed: '',
    age: 0,
    notes: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);
    fetchPets(user.id);
  };

  const fetchPets = async (userId: string) => {
    try {
      setError(null);
      const data = await petAPI.getUserPets(userId);
      setPets(data);
    } catch (error) {
      console.error('獲取寵物資料失敗:', error);
      setError('無法載入寵物資料，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 驗證表單
    const errors = validatePet(formData);
    setValidationErrors(errors);

    if (hasErrors(errors)) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingPet) {
        await petAPI.updatePet(editingPet.id, formData);
      } else {
        await petAPI.createPet({ ...formData, user_id: user.id });
      }

      // 重新獲取資料
      await fetchPets(user.id);
      resetForm();
    } catch (error) {
      console.error('操作失敗:', error);
      setError(editingPet ? '更新寵物資料失敗' : '新增寵物失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // 使用 useCallback 優化函數，避免不必要的重新渲染
  const handleEdit = useCallback((pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      pet_type: pet.pet_type,
      breed: pet.breed,
      age: pet.age,
      notes: pet.notes
    });
    setShowAddForm(true);
  }, []);

  const handleDelete = useCallback(
    async (petId: string) => {
      if (!confirm('確定要刪除這隻寵物嗎？')) return;

      setDeletingPetId(petId);
      try {
        setError(null);
        await petAPI.deletePet(Number(petId));
        if (user) await fetchPets(user.id);
      } catch (error) {
        console.error('刪除失敗:', error);
        setError('刪除寵物失敗，請稍後再試');
      } finally {
        setDeletingPetId(null);
      }
    },
    [user]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const resetForm = () => {
    setFormData({ name: '', pet_type: '', breed: '', age: 0, notes: '' });
    setValidationErrors({});
    setError(null);
    setShowAddForm(false);
    setEditingPet(null);
  };

  if (loading) {
    return <LoadingSpinner size='large' text='載入寵物資料中...' fullScreen />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* 頁面標題 */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
          <h1 className='text-3xl font-bold text-gray-900'>我的寵物</h1>
          <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
            {/* 搜尋框 */}
            <SearchInput onSearch={handleSearch} placeholder='搜尋寵物名稱、類型或品種...' className='w-full sm:w-64' />
            <div className='flex space-x-4'>
              <button
                onClick={() => router.push('/')}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                返回首頁
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                新增寵物
              </button>
            </div>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && <ErrorMessage message={error} onClose={() => setError(null)} className='mb-6' />}

        {/* 新增/編輯表單 */}
        {showAddForm && (
          <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
            <h2 className='text-xl font-semibold mb-4'>{editingPet ? '編輯寵物資料' : '新增寵物'}</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>寵物名稱 *</label>
                  <input
                    type='text'
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.name && <p className='mt-1 text-sm text-red-600'>{validationErrors.name}</p>}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>寵物類型 *</label>
                  <select
                    required
                    value={formData.pet_type}
                    onChange={e => setFormData({ ...formData, pet_type: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.pet_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value=''>請選擇</option>
                    <option value='Dog'>狗</option>
                    <option value='Cat'>貓</option>
                    <option value='Bird'>鳥</option>
                    <option value='Rabbit'>兔子</option>
                    <option value='Other'>其他</option>
                  </select>
                  {validationErrors.pet_type && (
                    <p className='mt-1 text-sm text-red-600'>{validationErrors.pet_type}</p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>品種</label>
                  <input
                    type='text'
                    value={formData.breed}
                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>年齡</label>
                  <input
                    type='number'
                    min='0'
                    max='30'
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.age && <p className='mt-1 text-sm text-red-600'>{validationErrors.age}</p>}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>注意事項</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='例如：特殊飲食需求、健康狀況、行為特點等'
                />
              </div>
              <div className='flex space-x-4'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
                >
                  {submitting && <LoadingSpinner size='small' className='mr-2' />}
                  {editingPet ? '更新' : '新增'}
                </button>
                <button
                  type='button'
                  onClick={resetForm}
                  disabled={submitting}
                  className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50'
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 寵物列表 */}
        <PetList
          pets={pets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingPetId={deletingPetId}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}
