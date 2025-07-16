import React from 'react';
import { Pet } from '@/types';

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
  isDeleting?: boolean;
}

// 使用 React.memo 優化效能，避免不必要的重新渲染
const PetCard = React.memo(({ pet, onEdit, onDelete, isDeleting = false }: PetCardProps) => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='text-xl font-semibold text-gray-800'>{pet.name}</h3>
          <p className='text-gray-600'>
            {pet.pet_type} • {pet.breed}
          </p>
          <p className='text-sm text-gray-500'>{pet.age} 歲</p>
        </div>
        <div className='flex space-x-2'>
          <button
            onClick={() => onEdit(pet)}
            className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            disabled={isDeleting}
          >
            編輯
          </button>
          <button
            onClick={() => onDelete(pet.id)}
            disabled={isDeleting}
            className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50'
          >
            {isDeleting ? '刪除中...' : '刪除'}
          </button>
        </div>
      </div>

      {pet.notes && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>注意事項：</h4>
          <p className='text-sm text-gray-600 bg-gray-50 p-3 rounded'>{pet.notes}</p>
        </div>
      )}
    </div>
  );
});

// 設定 displayName 以便於除錯
PetCard.displayName = 'PetCard';

export { PetCard };
