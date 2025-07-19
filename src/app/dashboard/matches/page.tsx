'use client';

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import StatusIndicator from '@/components/ui/StatusIndicator';
import { useUser } from '@/hooks/useUser';
import { getMatchesForUser } from '@/lib/supabase/queries';
import { type Match } from '@/types/match';

export default function MatchesPage() {
  const { user, loading: userLoading } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [userPetIds, setUserPetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    const fetchMatches = async () => {
      if (user) {
        setLoading(true);
        const { matches: fetchedMatches, userPetIds: fetchedUserPetIds } = await getMatchesForUser(user.id);
        setMatches(fetchedMatches);
        setUserPetIds(fetchedUserPetIds);
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user, userLoading]);



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">我的配對</h1>
      <StatusIndicator 
        loading={loading || userLoading}
        user={user}
        data={matches}
        emptyMessage="您目前沒有任何配對。趕快去滑動卡片，尋找新朋友吧！"
      />
      {matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => {
            // Determine which pet is the user's and which is the other pet
            const otherPet = userPetIds.includes(match.pet1_id) ? match.pet2 : match.pet1;

            return (
              <div key={match.id} className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
                <img 
                  src={otherPet.avatar_url || '/placeholder.png'} 
                  alt={otherPet.name} 
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-bold">{otherPet.name}</h2>
                  <p className="text-gray-600">{otherPet.breed}</p>
                  <Link href={`/dashboard/chat/${match.id}`} className="mt-2 inline-block bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 text-sm">
                    開始聊天
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}