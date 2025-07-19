'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { FullPageLoading, LoadingSpinner } from '@/components/LoadingSpinner';
import { PetList } from '@/components/PetList';
import { SearchInput } from '@/components/SearchInput';
import { FormContainer, FormGroup, Label, Input, Button } from '@/components/ui/Form';
import ErrorMessage from '@/components/ui/messages/ErrorMessage';
import { createClient } from '@/lib/supabase/client';
import { Pet, PetFormData, ValidationErrors } from '@/types';
import { petApi as petAPI } from '@/utils/api';
import { validatePetForm as validatePet, hasValidationErrors as hasErrors } from '@/utils/validation';

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

    checkUser();
  }, [supabase.auth, router]);

  const fetchPets = async (userId: string) => {
    setLoading(true);
    setError(null);
    const response = await petAPI.getUserPets(userId);
    if (response.success && response.data) {
      setPets(response.data);
    } else {
      setError(response.error || '無法載入寵物資料，請稍後再試');
      setPets([]); // 清空舊資料
    }
    setLoading(false);
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

    const apiCall = editingPet ? petAPI.updatePet(editingPet.id, formData) : petAPI.createPet(user.id, formData);

    const response = await apiCall;

    if (response.success) {
      await fetchPets(user.id);
      resetForm();
    } else {
      setError(response.error || (editingPet ? '更新寵物資料失敗' : '新增寵物失敗'));
    }
    setSubmitting(false);
  };

  // 使用 useCallback 優化函數，避免不必要的重新渲染
  const handleEdit = useCallback((pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      pet_type: pet.pet_type,
      breed: pet.breed || '',
      age: pet.age ?? null,
      notes: pet.notes || ''
    });
    setShowAddForm(true);
  }, []);

  const handleDelete = useCallback(
    async (petId: string) => {
      if (!confirm('確定要刪除這隻寵物嗎？')) return;

      setDeletingPetId(petId);
      setError(null);
      const response = await petAPI.deletePet(petId);
      if (response.success) {
        if (user) await fetchPets(user.id);
      } else {
        setError(response.error || '刪除寵物失敗，請稍後再試');
      }
      setDeletingPetId(null);
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
    return <FullPageLoading text='載入寵物資料中...' />;
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
        {error && <ErrorMessage message={error} />}

        {/* 新增/編輯表單 */}
        {showAddForm && (
          <FormContainer title={editingPet ? '編輯寵物資料' : '新增寵物'}>
            <form onSubmit={handleSubmit}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormGroup>
                  <Label htmlFor='name'>寵物名稱 *</Label>
                  <Input
                    id='name'
                    type='text'
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && <p className='mt-1 text-sm text-red-600'>{validationErrors.name}</p>}
                </FormGroup>
                <FormGroup>
                  <Label htmlFor='pet_type'>寵物類型 *</Label>
                  <select
                    id='pet_type'
                    required
                    value={formData.pet_type}
                    onChange={e => setFormData({ ...formData, pet_type: e.target.value })}
                      className={validationErrors.pet_type ? 'border-red-500' : ''}
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
                </FormGroup>
                <FormGroup>
                  <Label htmlFor='breed'>品種</Label>
                  <Input
                    id='breed'
                    type='text'
                    value={formData.breed}
                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor='age'>年齡</Label>
                  <Input
                    id='age'
                    type='number'
                    min='0'
                    max='30'
                    value={formData.age ?? ''}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className={validationErrors.age ? 'border-red-500' : ''}
                  />
                  {validationErrors.age && <p className='mt-1 text-sm text-red-600'>{validationErrors.age}</p>}
                </FormGroup>
              </div>
              <FormGroup>
                <Label htmlFor='notes'>注意事項</Label>
                <textarea
                  id='notes'
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='例如：特殊飲食需求、健康狀況、行為特點等'
                />
              </FormGroup>
              <div className='flex space-x-4'>
                <Button type='submit' disabled={submitting}>
                  {submitting && <LoadingSpinner size='sm' className='mr-2' />}
                  {editingPet ? '更新' : '新增'}
                </Button>
                <Button type='button' onClick={resetForm} disabled={submitting} className='bg-gray-200 text-gray-800 hover:bg-gray-300'>
                  取消
                </Button>
              </div>
            </form>
          </FormContainer>
        )}

        {/* 寵物列表 */}
        <PetList
          pets={pets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingPetId={deletingPetId ?? undefined}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
}
