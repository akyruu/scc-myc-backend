// Shared
import {Cargo, CargoOwner, Fragment, FragmentOre, Ore, Settings} from '../../models';
import {SettingsUtils} from './settings.utils';

export class VehicleUtils {
  /* STATIC METHODS ====================================================== */
  static createCargo(owner: CargoOwner): Cargo {
    const cargo = new Cargo();
    cargo.index = owner.cargos.length + 1;
    cargo.vehicle = owner.vehicle;
    return cargo;
  }

  static createFragment(cargo: Cargo, settings: Settings): Fragment {
    const fragment = new Fragment();
    fragment.index = cargo.fragments.length + 1;
    fragment.inertOre = this.createFragmentOre(SettingsUtils.findInertOre(settings));
    return fragment;
  }

  static createFragmentOre(ore: Ore): FragmentOre {
    const fragmentOre = new FragmentOre();
    fragmentOre.ore = ore;
    return fragmentOre;
  }

  static updateFragmentOre(fragmentOre: FragmentOre, fragment: Fragment): void {
    const calculated = fragmentOre.calculated;
    const ore = fragmentOre.ore;
    calculated.mass = ((fragment.mass || 0) / 100) * (fragmentOre.percent || 0);
    calculated.quantity = calculated.mass / ore.density;
    calculated.value = calculated.quantity * ore.price;
  }

  static updateFragment(fragment: Fragment, massUpdated = false): void {
    const calculated = {quantity: 0, value: 0};

    let inertPercent = 100;
    fragment.ores.forEach(fragmentOre => {
      this._updateFragmentCalculated(calculated, fragmentOre, fragment, massUpdated);
      inertPercent -= fragmentOre.percent;
    });

    const inertOre = fragment.inertOre;
    inertOre.percent = Math.max(inertPercent, 0);
    this._updateFragmentCalculated(calculated, inertOre, fragment, massUpdated);

    Object.assign(fragment.calculated, calculated);
  }

  private static _updateFragmentCalculated(
      calculated: { quantity: number, value: number }, fragmentOre: FragmentOre,
      fragment: Fragment, massUpdated: boolean
  ): void {
    if (massUpdated) {
      this.updateFragmentOre(fragmentOre, fragment);
    }
    calculated.quantity += fragmentOre.calculated.quantity;
    calculated.value += fragmentOre.calculated.value;
  }

  static updateCargo(cargo: Cargo, includeCurrent: boolean): void {
    const calculated = {mass: 0, quantity: 0, value: 0};
    if (cargo.fragment && includeCurrent) {
      this._updateCargoCalculated(calculated, cargo.fragment);
    }
    cargo.fragments.forEach(fragment => this._updateCargoCalculated(calculated, fragment));

    Object.assign(cargo.calculated, calculated);
    cargo.calculated.percent = calculated.quantity / cargo.vehicle.cargo;
  }

  private static _updateCargoCalculated(calculated: { mass: number, quantity: number, value: number }, fragment: Fragment): void {
    calculated.mass += fragment.mass;
    calculated.quantity += fragment.calculated.quantity;
    calculated.value += fragment.calculated.value;
  }

  /* CONSTRUCTOR ========================================================= */
  private constructor() {}
}
