// TODO shared between frontend and backend
export interface Ore {
  name: string;
  density: number;
  price: number;
  mineableBy: ('player' | 'vehicle')[];
}
