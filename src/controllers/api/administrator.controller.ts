import { Body, Controller, Get, Param, Patch, Post, Put, SetMetadata, UseGuards } from "@nestjs/common";
import { Administrator } from "src/entities/administator.entity";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";

@Controller('api/administrator')
export class AdministratorController {
    constructor(
        private administatorService: AdministratorService
      ) { }

      
  @Get() //http://localhost:3000/api/administrator
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  getAll(): Promise<Administrator[]>{
     return this.administatorService.getAll();
  }

      
  @Get(':id') //http://localhost:3000/api/administrator/2/
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  getById(@Param('id')  administatorId: number): Promise<Administrator | ApiResponse>{
     return new Promise(async (resolve)=>{
     let admin = await this.administatorService.getById(administatorId);

     if (admin === undefined){
        resolve(new ApiResponse("error",-1002));
     }

     resolve(admin);
   });
  }
  //POST http://localhost:3000/api/administrator

  @Post()
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse>{
     return this.administatorService.add(data);
  }

  //Patch http://localhost:3000/api/administrator/2/
  @Patch(':id')
  @UseGuards(RoleCheckerGuard)
  @AllowToRoles('administrator')
  edit(@Param('id') id: number, @Body() data: EditAdministratorDto):Promise<Administrator | ApiResponse>{
      return this.administatorService.editById(id, data);
  }
}