import { Body, Controller, Post, Req, Put } from "@nestjs/common";
import { LoginAdministratorDto } from "src/dtos/administrator/login.administrator.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as crypto from 'crypto';
import { LoginInfoDto} from "src/dtos/auth/loginInfo.administrator.dto";
import * as jwt from 'jsonwebtoken';
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { Request } from "express";
import { jwtSecret } from "config/jwt.secret";
import { DatabaseConfiguration } from "config/database.configuration";
import { UserRegistrationDto } from "src/dtos/user/user.registation.dto";
import { UserServise } from "src/services/user/user.servise";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
@Controller('auth')
export class AuthController {
    constructor(
        public administatorService: AdministratorService,
        public userService: UserServise
        ){ }
    
    @Post('administrator/login') //http://localhost:3000/auth/administrator/login
    async doAdministratorLogin(@Body() data: LoginAdministratorDto,@Req() req: Request): Promise<LoginInfoDto | ApiResponse>{
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

       //token (JWT) za logovanje admina
       const jwtData = new JwtDataDto();
       jwtData.role = "administrator";
       jwtData.id = administator.administratorId;
       jwtData.identity = administator.username;
       
       let sada = new Date();//trenutni datum
       sada.setDate(sada.getDate()+ 14);//trenutni datum + 14 dana
       const istekTimestamp = sada.getTime()/1000; //da bismo dobili broj sekundi
       jwtData.exp = istekTimestamp;

       jwtData.ip = req.ip.toString();
       jwtData.ua = req.headers["user-agent"];

       //potpisivanje tokena
       let token: string = jwt.sign(jwtData.toPlanObject(), jwtSecret);

       const responseObject = new LoginInfoDto(
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

     @Post('user/login') //http://localhost:3000/auth/administrator/login
    async doUserLogin(@Body() data: LoginUserDto,@Req() req: Request): Promise<LoginInfoDto| ApiResponse>{
       const user = await this.userService.getByEmail(data.email);

       if(!user){
          return new Promise(resolve=> {
              resolve(new ApiResponse('error',-3001))
          })
       }

       const passwordHash = crypto.createHash('sha512');
       passwordHash.update(data.password);
       const passwordHashString = passwordHash.digest('hex').toUpperCase();

       if (user.passwordHash !== passwordHashString) {
           return new Promise(resolve => (new ApiResponse('error',-3002)));
       }

       //token (JWT) za logovanje korisnika
       const jwtData = new JwtDataDto();
       jwtData.role = "user";
       jwtData.id = user.userId;
       jwtData.identity = user.email;
       
       let sada = new Date();//trenutni datum
       sada.setDate(sada.getDate()+ 14);//trenutni datum + 14 dana
       const istekTimestamp = sada.getTime()/1000; //da bismo dobili broj sekundi
       jwtData.exp = istekTimestamp;

       jwtData.ip = req.ip.toString();
       jwtData.ua = req.headers["user-agent"];

       //potpisivanje tokena
       let token: string = jwt.sign(jwtData.toPlanObject(), jwtSecret);

       const responseObject = new LoginInfoDto(
       user.userId,
       user.email,
       token

       );
       
       return new Promise(resolve=>resolve(responseObject));
    }

       
}