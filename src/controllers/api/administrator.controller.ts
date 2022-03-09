import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { Administrator } from "entities/administator.entity";
import { AddAdministratorDto } from "src/dtos/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
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
  getById(@Param('id')  administatorId: number): Promise<Administrator>{
     return this.administatorService.getById(administatorId);
  }
  //PUT http://localhost:3000/api/administrator
  @Put()
  add(@Body() data: AddAdministratorDto): Promise<Administrator>{
     return this.administatorService.add(data);
  }

  //POST http://localhost:3000/api/administrator/2/
  @Post(':id')
  edit(@Param('id') id: number, @Body() data: EditAdministratorDto):Promise<Administrator>{
      return this.administatorService.editById(id, data);
  }
}