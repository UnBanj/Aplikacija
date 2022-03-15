import { Body, Controller, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { Article } from "entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ArticleServise } from "src/services/article/article.servise";
import {diskStorage } from "multer";
import { StorageConfig } from "config/storage.config";
import { Photo } from "entities/photo.entity";
import { PhotoServise } from "src/services/photo/photo.service";
import { ApiResponse } from "src/misc/api.response.class";

@Controller('api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            photos: {
                eager: true
            },
            articlePrices: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            features: {
                eager: true
            }
            
        }
    }
})
export class ArticleController {
    constructor(public service: ArticleServise,
                public photoService: PhotoServise
                ){ }
    
    @Post('createFull') //POST http://localhost:3000/api/article/createFull
    createFullArticle(@Body() data: AddArticleDto){
       return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto/')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
               destination: StorageConfig.photoDestination,
               filename: (req, file, callback) => {
                    //'Neka    slika.jpg'=>     
                    //'2020392930-3230293029-Neka-slika.jpg

                     let original: string = file.originalname;
                     //sve "beline"-razmake zameniti jednom crticom
                     let normalized = original.replace(/\s+/g,'-');
                     //sve sto nije od a-z , od 0-9, tacka ili crtica zameni praznim stringom
                     normalized = normalized.replace(/[^A-z0-9\.\-]/g,'');
                     let sada = new Date();//trenutni datum
                     let datePart = '';
                     datePart+= sada.getFullYear().toString();//uzimamo godinu
                     datePart+= (sada.getMonth()+1 ).toString();//mesec
                     datePart+=sada.getDate().toString();//datum u mesecu

                     let niz10elemenata = new Array(10);
                     //da dobijemo random vrednosti od 0 do 9 kao string
                     let randomPart:string =
                     niz10elemenata
                     .fill(0)
                     .map(e=> (Math.random()*9).toFixed(0).toString())
                     .join('');

                     let fileName = datePart + '-'+ randomPart+'-' +normalized;
                     //da sve bude malim slovima
                     fileName = fileName.toLocaleLowerCase();
                     
                     callback(null,fileName);

               }
            }),
                 fileFilter: (req, file, callback)=> {
                     // proveri ekstenziju: JPG,PNG
                      //zavrsava se sa .jpg ili .png i posle ne sme biti nicega
                     if(!file.originalname.toLowerCase().match(/\.(jpg|png)$/)){
                        callback(new Error('Bad file extensions!'), false);
                        return;
                     }
                      //check tipa sadrzaja : image/jpeg,image/png (mimetype)
                      if (!(file.mimetype.includes('jpeg')|| file.mimetype.includes('png'))){
                          callback(new Error('Bad file content'), false);
                          return;
                      }
                      callback(null, true);
                 }, 
                 //koliko fajlova prihtavamo da bude uploadovano
                 limits: {
                    files: 1,
                    fieldSize: StorageConfig.photoMaxFileSize,
                 },
        })
    )
    async uploadPhoto(@Param('id') articleId: number,@UploadedFile() photo): Promise<ApiResponse | Photo> {
               
        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto){
            return new ApiResponse('error',-4001);
        }
          return savedPhoto;
    }
}