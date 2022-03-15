import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Photo } from "src/entities/photo.entity";
import { Repository } from "typeorm";

@Injectable()
export class PhotoServise extends TypeOrmCrudService<Photo>{
  constructor(
     @InjectRepository(Photo) private readonly photo: Repository<Photo>,//dodaj i u app.module Photo
)
     {
     super(photo);
     }
      //fja uzima gotovu fotog. i cuva je
     add(newPhoto:Photo): Promise<Photo>{
        return this.photo.save(newPhoto);
     }
 }