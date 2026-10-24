// FosterGrid shared TypeScript interfaces

export type DisasterType = 'power_outage' | 'wildfire' | 'heatwave' | 'flooding';

export type AnimalStatus = 'safe' | 'evacuating' | 'matched';

export interface Animal {
  id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  weight: number; // lbs
  medicalNotes: string;
  requiresRefrigeration: boolean;
  mobilityNeeds: boolean;
  emergencyType: DisasterType;
  address: string;
  lat: number;
  lng: number;
  status: AnimalStatus;
}

export type PowerType = 'generator' | 'solar' | 'none';
export type HousingType = 'single_story' | 'multi_story';

export interface Foster {
  id: string;
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  insideHazardZone: boolean;
  hasBackupPower: boolean;
  powerType: PowerType;
  housingType: HousingType;
  catFriendly: boolean;
  dogFriendly: boolean;
  maxWeight: number;
  activeStatus: boolean;
}

export type MatchStatus = 'pending' | 'accepted' | 'en_route';

export interface EmergencyMatch {
  animalId: string;
  fosterId: string;
  matchScore: number;
  reasoning: string;
  matchStatus: MatchStatus;
}
