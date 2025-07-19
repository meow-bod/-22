import React, { useMemo } from 'react';

import { EmptyState } from './ErrorMessage';
import { PetCard } from './PetCard';

import { Pet } from '@/types';

interface PetListProps {
  pets: Pet[];
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
  deletingPetId?: string;
  searchTerm?: string;
}

// 使用 React.memo 優化效能
const PetList = React.memo(({ pets, onEdit, onDelete, deletingPetId, searchTerm = '' }: PetListProps) => {
  // 使用 useMemo 優化搜尋過濾，避免每次渲染都重新計算
  const filteredPets = useMemo(() => {
    if (!searchTerm.trim()) {
      return pets;
    }

    const term = searchTerm.toLowerCase();
    return pets.filter(
      pet =>
        pet.name.toLowerCase().includes(term) ||
        pet.pet_type.toLowerCase().includes(term) ||
        (pet.breed && pet.breed.toLowerCase().includes(term))
    );
  }, [pets, searchTerm]);

  // 使用 useMemo 優化統計資料計算
  const petStats = useMemo(() => {
    const total = filteredPets.length;
    const types = filteredPets.reduce(
      (acc, pet) => {
        acc[pet.pet_type] = (acc[pet.pet_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, types };
  }, [filteredPets]);

  if (pets.length === 0) {
    return <EmptyState title='還沒有寵物' message='開始新增您的第一隻寵物吧！' actionText='新增寵物' />;
  }

  if (filteredPets.length === 0 && searchTerm) {
    return <EmptyState title='找不到符合的寵物' message={`沒有找到包含「${searchTerm}」的寵物`} />;
  }

  return (
    <div className='space-y-6'>
      {/* 統計資訊 */}
      {searchTerm && (
        <div className='bg-blue-50 p-4 rounded-lg'>
          <p className='text-sm text-blue-700'>
            找到 {petStats.total} 隻寵物
            {Object.entries(petStats.types).length > 0 && (
              <span className='ml-2'>
                (
                {Object.entries(petStats.types)
                  .map(([type, count]) => `${type}: ${count}`)
                  .join(', ')}
                )
              </span>
            )}
          </p>
        </div>
      )}

      {/* 寵物列表 */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredPets.map(pet => (
          <PetCard key={pet.id} pet={pet} onEdit={onEdit} onDelete={onDelete} isDeleting={deletingPetId === pet.id} />
        ))}
      </div>
    </div>
  );
});

// 設定 displayName 以便於除錯
PetList.displayName = 'PetList';

export { PetList };
