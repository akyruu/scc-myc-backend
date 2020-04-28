// TODO shared between frontend and backend
import {BoxHarvest} from './box-harvest';
import {BoxOre} from './box-ore';

export class Box {
  index: number;
  harvests: BoxHarvest[] = [];
  ores: BoxOre[] = [];
}
