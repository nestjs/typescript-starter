export class Product {
  constructor(
    public id: string,
    public title: string,
    public status: taskStatusEnum,
    public createdAt: string,
    public updatedAt: string,
    public description?: string,
  ) {}
}

export enum taskStatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}
