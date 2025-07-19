import { createClient } from './client';

import { type Match } from '@/types/match'; // Assuming you have a type definition for Match
import { type Pet } from '@/types/pet'; // Assuming you have a type definition for Pet

const supabase = createClient();

export const getMatchesForUser = async (userId: string): Promise<{ matches: Match[]; userPetIds: string[] }> => {
  if (!userId) return { matches: [], userPetIds: [] };

  // Get the IDs of the current user's pets
  const { data: userPets, error: userPetsError } = await supabase.from('pets').select('id').eq('owner_id', userId);

  if (userPetsError) {
    console.error('Error fetching user pets:', userPetsError);
    return { matches: [], userPetIds: [] };
  }

  const petIds = userPets.map(p => p.id);

  // Fetch matches where either pet1_id or pet2_id is one of the user's pets
  const { data: matchData, error: matchesError } = await supabase
    .from('matches')
    .select(
      `
      id, 
      created_at,
      pet1_id, 
      pet2_id,
      pet1:pet1_id (*),
      pet2:pet2_id (*)
    `
    )
    .or(`pet1_id.in.(${petIds.join(',')}),pet2_id.in.(${petIds.join(',')})`);

  if (matchesError) {
    console.error('Error fetching matches:', matchesError);
    return { matches: [], userPetIds: petIds };
  }

  const matches: Match[] = ((matchData as any[]) || [])
    .map(m => ({
      ...m,
      pet1: m.pet1[0],
      pet2: m.pet2[0]
    }))
    .filter(m => m.pet1 && m.pet2);

  return { matches, userPetIds: petIds };
};

export const getSwipeProfilesForUser = async (userId: string): Promise<Pet[]> => {
  if (!userId) return [];

  // Get the IDs of the current user's pets
  const { data: userPets, error: userPetsError } = await supabase.from('pets').select('id').eq('owner_id', userId);

  if (userPetsError || !userPets) {
    console.error('Error fetching user pets:', userPetsError);
    return [];
  }
  const userPetIds = userPets.map(p => p.id);

  // Fetch pets that have been swiped by any of the user's pets
  const { data: swipedPetIds, error: swipesError } = await supabase
    .from('swipes')
    .select('swiped_pet_id')
    .in('swiper_pet_id', userPetIds);

  if (swipesError) {
    console.error('Error fetching swipes:', swipesError);
    return [];
  }

  const swipedIds = swipedPetIds.map(s => s.swiped_pet_id);
  const allIdsToExclude = [...userPetIds, ...swipedIds];

  // Fetch pets that are not owned by the current user and have not been swiped
  const { data: petProfiles, error: petsError } = await supabase
    .from('pets')
    .select('*')
    .not('id', 'in', `(${allIdsToExclude.join(',')})`);

  if (petsError) {
    console.error('Error fetching pet profiles:', petsError);
    return [];
  }

  return petProfiles || [];
};

export const recordSwipe = async (
  userId: string,
  swipedPetId: string,
  liked: boolean
): Promise<{ success: boolean; error?: string | null }> => {
  if (!userId) return { success: false, error: 'User not found' };

  // For simplicity, we'll assume the first pet of the user is the swiper
  const { data: userPets, error: userPetsError } = await supabase
    .from('pets')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (userPetsError || !userPets || userPets.length === 0) {
    console.error('Could not find a pet for the current user to swipe with.');
    return { success: false, error: 'User pet not found' };
  }
  const swiperPetId = userPets[0].id;

  const { error } = await supabase.from('swipes').insert({
    swiper_pet_id: swiperPetId,
    swiped_pet_id: swipedPetId,
    liked: liked
  });

  if (error) {
    console.error('Error recording swipe:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
