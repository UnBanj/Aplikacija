import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Article } from "entities/article.entity";
import { Repository } from "typeorm";

@Injectable()
export class ArticleServise extends TypeOrmCrudService<Article>{
  constructor( @InjectRepository(Article) private readonly article: Repository<Article>){//dodaj i u app.module Category
      super(article);
  }
}