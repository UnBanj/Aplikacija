import { Body, Controller, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { Article } from "src/entities/article.entity";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { ArticleServise } from "src/services/article/article.servise";
import {diskStorage } from "multer";
import { StorageConfig } from "config/storage.config";
import { Photo } from "src/entities/photo.entity";
import { PhotoServise } from "src/services/photo/photo.service";
import { ApiResponse } from "src/misc/api.response.class";
import * as sharp from 'sharp';

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
               destination: StorageConfig.photo.destination,
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
                        req.fileFilterError = 'Bad file extension!';
                        callback(null, false);
                        return;
                     }
                      //check tipa sadrzaja : image/jpeg,image/png (mimetype)
                      if (!(file.mimetype.includes('jpeg')|| file.mimetype.includes('png'))){
                        req.fileFilterError = 'Bad file content!';  
                        callback(null, false);
                        return;
                      }
                      callback(null, true);
                 }, 
                 //koliko fajlova prihtavamo da bude uploadovano
                 limits: {
                    files: 1,
                    fileSize: StorageConfig.photo.maxSize,
                 },
        })
    )
    //kada je fajl uploadovan,upis u bazu
    async uploadPhoto(
        @Param('id') articleId: number,
        @UploadedFile() photo,
        @Req() req 
        ): Promise<ApiResponse | Photo> { 
       //Prvo proveravamo da li je doslo do greske 
        if (req.fileFilterError ) {
            return new ApiResponse('error',-4002, req.fileFilterError);
        }

        if(!photo){
            return new ApiResponse('error',-4002,'File not uploaded!');
        }
        //save resized photo
        await  this.createResizedImage(photo, StorageConfig.photo.resize.thumb);
        await this.createResizedImage(photo, StorageConfig.photo.resize.small); 
                     
        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto){
            return new ApiResponse('error',-4001);
        }
          return savedPhoto;

    }
      //Create resized photo 
      
      async createResizedImage(photo,resizedSettings){
        const originalFilePath = photo.path;
        const fileName = photo.filename;

        const destinationFilePath = 
        StorageConfig.photo.destination+ 
        resizedSettings.small.directory+
        fileName;
        
       await sharp(originalFilePath)
           .resize({
               fit: 'cover',
               width: resizedSettings.small.width,
               height: resizedSettings.small.height,
           })
           .toFile(destinationFilePath);
      }
}