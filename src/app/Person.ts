export interface Person {
    id?: string; // Optional ID if you want to capture document ID
    name: string;
    pname:string;
    pby: number; // year born
    pdy: number; // year died
    by:number;
    dy:number;
    children: number[]; // assuming children are stored as an array of IDs or numbers
  }
  