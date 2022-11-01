import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import DistinctFeatureValuesDto from "src/dtos/feature/distinct.feature.values.dto";
import { ArticleFeature } from "src/entities/article-feature.entity";
import { Feature } from "src/entities/feature.entity";
import { Repository } from "typeorm";

@Injectable()
export class FeatureServise extends TypeOrmCrudService<Feature>{
  constructor( @InjectRepository(Feature) private readonly feature: Repository<Feature>,
               @InjectRepository(ArticleFeature) private readonly artcleFeature: Repository<ArticleFeature>){//dodaj i u app.module Feature
      super(feature);
  }
 //izvlacimo spisak svih kategorija
  async getDistinctValuesByCategoryId(categoryId: number): Promise<DistinctFeatureValuesDto>{
    //izvlacimo sve feature za tu kategoriju
     const features = await this.feature.find({
         categoryId: categoryId,
     });
     
     const result: DistinctFeatureValuesDto = {
         features: [],
     };

     //ako nema feature-a
     if(!features || features.length=== 0){
       return result;
     }
     
     result.features = await Promise.all( features.map(async feature => {
        const values: string[]= 
        ( await this.artcleFeature.createQueryBuilder("af")
            .select("DISTINCT af.value", 'value')
            .where('af.featureId = :featureId', { featureId: feature.featureId})
            .orderBy('af.value', 'ASC')
            .getRawMany()
        ).map(item=> item.value);
                                    
        return {
           featureId: feature.featureId,
           name: feature.name,
           values: values,
        };
     }));

     return result;
     
  }

}