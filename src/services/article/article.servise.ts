import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { ArticleFeature } from "src/entities/article-feature.entity";
import { ArticlePrice } from "src/entities/article-price.entity";
import { Article } from "src/entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";
import { EditArticleDto } from "src/dtos/article/edit.article.dto";

@Injectable()
export class ArticleServise extends TypeOrmCrudService<Article>{
  constructor(
     @InjectRepository(Article) private readonly article: Repository<Article>,//dodaj i u app.module Category
      
     @InjectRepository(ArticlePrice) private readonly articlePrice: Repository<ArticlePrice>,

     @InjectRepository(ArticleFeature) private readonly articleFeature: Repository<ArticleFeature>,
  )
     {
     super(article);
     }

  async createFullArticle(data: AddArticleDto): Promise<Article | ApiResponse> {
     let newArticle: Article = new Article();
     newArticle.name = data.name;
     newArticle.categoryId = data.categoryId;
     newArticle.excerpt = data.excerpt;
     newArticle.description = data.description;

     let savedArticle = await this.article.save(newArticle);
     
     let newArticlePrice = new ArticlePrice();
     newArticlePrice.articleId = savedArticle.articleId;
     newArticlePrice.price = data.price;

     await this.articlePrice.save(newArticlePrice);

     for (let feature of data.features) {
       let newArticleFeature = new ArticleFeature();
       newArticleFeature.articleId = savedArticle.articleId;
       newArticleFeature.featureId = feature.featureId;
       newArticleFeature.value = feature.value;

       await this.articleFeature.save(newArticleFeature);

     }

     return await this.article.findOne(savedArticle.articleId,{
        relations: [
          "category",
          "articleFeatures",
          "features",
          "articlePrices"
        ]
     });
  }

  async editFullArticle(articleId: number, data: EditArticleDto): Promise<Article | ApiResponse>{
     const existingArticle: Article = await this.article.findOne(articleId, {
        relations: ['articlePrices','articleFeatures']
     });

     if(!existingArticle){
        return new ApiResponse('error',-5001,'Article not found.');
     }

     existingArticle.name = data.name;
     existingArticle.categoryId=data.categoryId;
     existingArticle.excerpt = data.excerpt;
     existingArticle.description = data.description;
     existingArticle.status = data.status;
     existingArticle.isPromoted = data.isPromoted;

     const savedArticle = await this.article.save(existingArticle);
     if(!savedArticle){
        return new ApiResponse('error',-5002,'Could not save new article data.');
        }
      
     const newPriceString: string = Number(data.price).toFixed(2);// 50 -> "50.00"
     
     const lastPrice = existingArticle.articlePrices[existingArticle.articlePrices.length-1].price;
     const lastPriceString: string = Number(lastPrice).toFixed(2);
     //ako su razlicite cene,pravi novi article price
     if(newPriceString !== lastPriceString){
        const newArticlePrice = new ArticlePrice();
        newArticlePrice.articleId = articleId;
        newArticlePrice.price = data.price;

      const savedArticlePrice = await this.articlePrice.save(newArticlePrice);
           if (!savedArticlePrice){
              return new ApiResponse('error',-5003,'Could not save the new article price.');
           }
     }
     //ako feature nije null pravi ga
      if(data.features !== null){
        //prvo moramo da obrisemo postujuce article feature
        await this.articleFeature.remove(existingArticle.articleFeatures);
        //zatim dodajemo nove
        for (let feature of data.features) {
         let newArticleFeature = new ArticleFeature();
         newArticleFeature.articleId = articleId;
         newArticleFeature.featureId = feature.featureId;
         newArticleFeature.value = feature.value;
  
         await this.articleFeature.save(newArticleFeature);
  
       }
      }
     //vracamo ceo kompletan article
      return await this.article.findOne(articleId,{
         relations: [
           "category",
           "articleFeatures",
           "features",
           "articlePrices"
         ]
      });
  }
}