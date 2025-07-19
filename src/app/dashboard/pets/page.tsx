'use client';

import { type User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

import AddPetModal from '@/components/ui/AddPetModal';
import { createClient } from '@/lib/supabase/client';

// Define the type for a single pet
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  birth_date: string;
  gender: string;
  avatar_url: string;
}

export default function PetsPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  useEffect(() => {
    const fetchUserAndPets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: petsData, error } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id);

        if (error) {
          console.error('Error fetching pets:', error);
        } else {
          setPets(petsData || []);
        }
      }
      setLoading(false);
    };

    fetchUserAndPets();
  }, [supabase]);

  const handlePetAdded = (newPet: Pet) => {
    setPets(prevPets => [...prevPets, newPet]);
  };

  const handlePetUpdated = (updatedPet: Pet) => {
    setPets(prevPets => prevPets.map(p => p.id === updatedPet.id ? updatedPet : p));
    setEditingPet(null); // Close modal after update
  };

  const handleEditClick = (pet: Pet) => {
    setEditingPet(pet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPet(null);
  };

  const handleDeletePet = async (petId: string) => {
    if (window.confirm('您確定要刪除這隻寵物嗎？此操作無法復原。')) {
      const { error } = await supabase.from('pets').delete().eq('id', petId);

      if (error) {
        console.error('Error deleting pet:', error);
        alert('刪除寵物失敗！');
      } else {
        setPets(prevPets => prevPets.filter(p => p.id !== petId));
        alert('寵物已成功刪除。');
      }
    }
  };

  if (loading) {
    return <div>讀取中...</div>;
  }

  if (!user) {
    return <div>請先登入</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">我的寵物</h1>
        <button 
          onClick={() => {
            setEditingPet(null); // Ensure we are in 'add' mode
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          新增寵物
        </button>
      </div>
      
      {pets.length === 0 ? (
        <p>您尚未新增任何寵物。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div key={pet.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{pet.name}</h2>
                <p><strong>物種:</strong> {pet.species}</p>
                <p><strong>品種:</strong> {pet.breed}</p>
                <p><strong>性別:</strong> {pet.gender}</p>
                <p><strong>生日:</strong> {pet.birth_date}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={() => handleEditClick(pet)}
                  className="bg-gray-200 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-300"
                >
                  編輯
                </button>
                <button 
                  onClick={() => handleDeletePet(pet.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPetModal 
        user={user}
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onPetAdded={handlePetAdded}
        petToEdit={editingPet}
        onPetUpdated={handlePetUpdated}
      />
    </div>
  );
}