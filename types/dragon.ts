// types/dragon.ts
export type Dragon = {
  id: string;
  side: string; // Allow broader values for `side`
  name: string;
  hatched: string;
  died: string;
  rider: string;
  colors: string;
  description: string;
  history?: string; // Made optional to align with the data
  image: string;
  top: number;
};
