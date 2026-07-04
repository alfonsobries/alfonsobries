import type { FamilyMember } from './auth';

// Everyone with a profile in the app. The parents (`alfonso`, `saida`) are real
// signed-in users and carry a mood; the kids are profiles only, for now.
export type PersonKey = FamilyMember | 'regina' | 'andres';

export type Person = {
  key: PersonKey;
  name: string;
  hasMood: boolean;
};

export const PEOPLE: Person[] = [
  { key: 'alfonso', name: 'Alfonso', hasMood: true },
  { key: 'saida', name: 'Saida', hasMood: true },
  { key: 'regina', name: 'Regina', hasMood: false },
  { key: 'andres', name: 'Andrés', hasMood: false },
];

export function getPerson(key: string | undefined): Person | undefined {
  return PEOPLE.find((person) => person.key === key);
}

export function isMoodPerson(key: PersonKey): key is FamilyMember {
  return key === 'alfonso' || key === 'saida';
}

export function isKid(key: PersonKey): key is 'regina' | 'andres' {
  return key === 'regina' || key === 'andres';
}
