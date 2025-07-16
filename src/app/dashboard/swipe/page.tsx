'use client';

'use client';

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import { getSwipeProfilesForUser, recordSwipe } from '@/lib/supabase/queries';
import StatusIndicator from '@/components/ui/StatusIndicator';
import { type Pet } from '@/types/pet';

export default function SwipePage() {
  const { user, loading: userLoading } = useUser();
  const [profiles, setProfiles] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (userLoading) return;

    const initialize = async () => {
      if (user) {
        setLoading(true);
        const fetchedProfiles = await getSwipeProfilesForUser(user.id);
        setProfiles(fetchedProfiles);
        setLoading(false);
      }
    };

    initialize();
  }, [user, userLoading]);

  const handleSwipe = async (swipedPetId: string, liked: boolean) => {
    if (!user) return;

    const { success, error } = await recordSwipe(user.id, swipedPetId, liked);

    if (success) {
      setCurrentIndex(prev => prev + 1);
    } else {
      console.error('Error recording swipe:', error);
      if (error === 'User pet not found') {
        alert('您需要先新增一隻寵物才能滑動！');
      } else {
        alert('滑動失敗，請稍後再試。');
      }
    }
  };

  const currentProfile = useMemo(() => profiles[currentIndex], [profiles, currentIndex]);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">尋找新朋友</h1>
      
      <StatusIndicator 
        loading={loading || userLoading}
        user={user}
        data={profiles} // Use profiles to check if there's data
        emptyMessage="沒有更多寵物可以滑了！"
      />

      {currentProfile && (
        <>
          <div className="relative w-full max-w-sm h-96 bg-white rounded-lg shadow-xl overflow-hidden">
            <img src={currentProfile.avatar_url || '/placeholder.png'} alt={currentProfile.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}</h2>
              <p>{currentProfile.breed}</p>
            </div>
          </div>
          <div className="flex justify-center space-x-8 mt-6">
            <button onClick={() => handleSwipe(currentProfile.id, false)} className="bg-red-500 text-white rounded-full w-20 h-20 flex justify-center items-center text-4xl font-bold shadow-lg">X</button>
            <button onClick={() => handleSwipe(currentProfile.id, true)} className="bg-green-500 text-white rounded-full w-20 h-20 flex justify-center items-center text-4xl font-bold shadow-lg">✓</button>
          </div>
        </>
      )}
    </div>
  );
}