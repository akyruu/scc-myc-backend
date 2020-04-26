// TODO shared between frontend and backend
export interface Settings {
    version: string;
    harvests: Harvest[];
    ore: Ore[];
    vehicles: Vehicle[];
}

export interface Harvest {
    name: string;
    price: number;
}

export interface Ore {
    name: string;
    density: number;
    price: number;
    mineableBy: ('player' | 'vehicle')[];
}

export interface Vehicle {
    name: string;
    cargo: number;
}