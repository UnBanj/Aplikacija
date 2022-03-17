import { Body, Controller, Post, Req, Put } from "@nestjs/common";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import {LoginInfoAdministratorDto} from "src/dtos/administrator/loginInfo.administrator.dto";
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { DatabaseConfiguration } from "config/database.configuration";
import { UserRegistrationDto } from "src/dtos/user/user.registation.dto";
import { UserServise } from "src/services/user/user.servise";
@Controller('auth')
export class AuthController {
    constructor(
        public administatorService: AdministratorService,
        public userService: UserServise
        ){ }
    
    @Post('login') //http://localhost:3000/auth/login
    async doLogin(@Body() data: LoginAdministratorDto,@Req() req: Request): Promise<LoginInfoAdministratorDto | ApiResponse>{
       const administator = await this.administatorService.getByUsername(data.username);

       if(!administator){
          return new Promise(resolve=> {
              resolve(new ApiResponse('error',-3001))
          })
       }

       const passwordHash = crypto.createHash('sha512');
       passwordHash.update(data.password);
       const passwordHashString = passwordHash.digest('hex').toUpperCase();

       if (administator.passwordHash !== passwordHashString) {
           return new Promise(resolve => (new ApiResponse('error',-3002)));
       }

       //token (JWT)
       const jwtData = new JwtDataAdministratorDto();
       jwtData.administratorId = administator.administratorId;
       jwtData.username = administator.username;
       
       let sada = new Date();//trenutni datum
       sada.setDate(sada.getDate()+ 14);//trenutni datum + 14 dana
       const istekTimestamp = sada.getTime()/1000; //da bismo dobili broj sekundi
       jwtData.exp = istekTimestamp;

       jwtData.ip = req.ip.toString();
       jwtData.ua = req.headers["user-agent"];

       //potpisivanje tokena
       let token: string = jwt.sign(jwtData.toPlanObject(), jwtSecret);

       const responseObject = new LoginInfoAdministratorDto(
       administator.administratorId,
       administator.username,
       token

       );
       
       return new Promise(resolve=>resolve(responseObject));
    }

    //registracija novog korisnika
     @Put('user/register')//PUT http://localhost:3000/auth/user/register/
     async userRegister(@Body() data: UserRegistrationDto) {
         return await this.userService.register(data);
     }
       
}