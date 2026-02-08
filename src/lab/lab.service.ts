import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabDto } from './dto/create-lab.dto';

@Injectable()
export class LabService {
    getHello():string { 
        return "Lab servis testi";
    }

  private items = [];

  findAll() {
    return this.items;
  }

  findOne(id: number) {
    const item = this.items.find(i => i.id === id);
    if (!item) {
      throw new NotFoundException(`ID'si ${id} olan kayıt bulunamadı!`);
    }
    return item;
  }

  create(dto: CreateLabDto) {
    const newItem = {
      id: Date.now(),
      ...dto,
    };
    this.items.push(newItem);
    return newItem;
  }

  remove(id: number) {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new NotFoundException('Silinecek kayıt bulunamadı!');
    this.items.splice(index, 1);
    return { message: 'Başarıyla silindi' };
  }
}
