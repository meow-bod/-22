import { type Pet } from './pet';

export interface Match {
  id: string;
  pet1_id: string;
  pet2_id: string;
  created_at: string;
  pet1: Pet;
  pet2: Pet;
}