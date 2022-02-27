import { AssertionConcern } from '../../assertion-concern';

export class IdentifiedDomainObject extends AssertionConcern {
  private _id: number;

  protected constructor() {
    super();
    this.setId(-1);
  }

  id(): number {
    return this._id;
  }

  setId(id: number): void {
    this._id = id;
  }
}
