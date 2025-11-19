export interface Seeder {
  run(): Promise<void>;
}
