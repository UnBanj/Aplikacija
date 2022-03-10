import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { Administrator } from "entities/administator.entity";
import { resolve } from "path";
import { AddAdministratorDto } from "src/dtos/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/administrator')
export class AdministratorController {
    constructor(
        private administatorService: AdministratorService
      ) { }

      
  @Get() //http://localhost:3000/api/administrator
  getAll(): Promise<Administrator[]>{
     return this.administatorService.getAll();
  }

      
  @Get(':id') //http://localhost:3000/api/administrator/2/
  getById(@Param('id')  administatorId: number): Promise<Administrator | ApiResponse>{
     return new Promise(async (resolve)=>{
     let admin = await this.administatorService.getById(administatorId);

     if (admin === undefined){
        resolve(new ApiResponse("error",-1002));
     }

     resolve(admin);
   });
  }
  //PUT http://localhost:3000/api/administrator
  @Put()
  add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse>{
     return this.administatorService.add(data);
  }

  //POST http://localhost:3000/api/administrator/2/
  @Post(':id')
  edit(@Param('id') id: number, @Body() data: EditAdministratorDto):Promise<Administrator | ApiResponse>{
      return this.administatorService.editById(id, data);
  }
}