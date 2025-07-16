'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AddPetModal({ user, isOpen, onClose, onPetAdded, petToEdit, onPetUpdated }) {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(petToEdit);

  useEffect(() => {
    if (isEditMode && petToEdit) {
      setName(petToEdit.name || '');
      setSpecies(petToEdit.species || '');
      setBreed(petToEdit.breed || '');
      setBirthDate(petToEdit.birth_date || '');
      setGender(petToEdit.gender || '');
    } else {
      // Reset form when opening for a new pet
      setName('');
      setSpecies('');
      setBreed('');
      setBirthDate('');
      setGender('');
    }
  }, [petToEdit, isEditMode, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !species.trim() || !gender) {
      alert('請填寫所有必填欄位：名字、物種和性別。');
      return;
    }

    setLoading(true);

    const petData = {
      owner_id: user.id,
      name,
      species,
      breed,
      birth_date: birthDate,
      gender,
    };

    try {
      if (isEditMode) {
        const { data, error } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', petToEdit.id)
          .select()
          .single();
        
        if (error) throw error;
        onPetUpdated(data);

      } else {
        const { data, error } = await supabase
          .from('pets')
          .insert(petData)
          .select()
          .single();

        if (error) throw error;
        onPetAdded(data);
      }

      onClose(); // Close modal on success

    } catch (error) {
      console.error('Error adding pet:', error);
      alert('新增寵物失敗！');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{isEditMode ? '編輯您的寵物' : '新增您的寵物'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">名字</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700">物種 (例如: 狗, 貓)</label>
              <input id="species" type="text" value={species} onChange={(e) => setSpecies(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700">品種</label>
              <input id="breed" type="text" value={breed} onChange={(e) => setBreed(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">生日</label>
              <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">請選擇</option>
                <option value="Male">公</option>
                <option value="Female">母</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
              取消
            </button>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
              {loading ? (isEditMode ? '更新中...' : '新增中...') : (isEditMode ? '更新寵物' : '新增寵物')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}