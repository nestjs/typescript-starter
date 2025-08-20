import { Injectable } from '@nestjs/common';
import { CatDto } from './create-cat.dto';

@Injectable()
export class AppService {
  private cats: CatDto[] = [
    { name: 'cat1', age: 1, breed: true },
    { name: 'cat2', age: 2, breed: false },
    { name: 'cat3', age: 3, breed: true },
  ];

  getAllCats(): CatDto[] {
    return this.cats;
  }

  getCatById(id: number): CatDto {
    return this.cats[id];
  }

  createCat(createCatDto: CatDto): CatDto {
    if (!createCatDto) {
      throw new Error('Data is required');
    }
    return createCatDto;
  }

  filterCats(age: number, breed: boolean): CatDto[] {
    return this.cats.filter((cat) => cat.age === age && cat.breed === breed);
  }
}
