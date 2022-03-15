import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Category } from "src/entities/category.entity";
import { Repository } from "typeorm";

@Injectable()
export class CategoryServise extends TypeOrmCrudService<Category>{
  constructor( @InjectRepository(Category) private readonly category: Repository<Category>){//dodaj i u app.module Category
      super(category);
  }
}