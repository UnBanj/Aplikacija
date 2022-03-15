import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";

@Injectable()
export class FeatureServise extends TypeOrmCrudService<Feature>{
  constructor( @InjectRepository(Feature) private readonly feature: Repository<Feature>){//dodaj i u app.module Feature
      super(feature);
  }
}