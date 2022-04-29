import { Body, Controller, Post, Req, Put, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
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
import { JwtRefreshDataDto } from "src/dtos/auth/jwt.refresh.dto";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { UserRefreshTokenDto } from "src/dtos/auth/user.refresh.token.dto";
@Controller('auth')
export class AuthController {
    constructor(
        public administatorService: AdministratorService,
        public userService: UserServise,
    
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
       jwtData.exp = this.getDatePlus(60*5); // 5 minuta da traje token
       jwtData.ip = req.ip.toString();
       jwtData.ua = req.headers["user-agent"];

       //potpisivanje tokena
       let token: string = jwt.sign(jwtData.toPlanObject(), jwtSecret);

       const responseObject = new LoginInfoDto(
       administator.administratorId,
       administator.username,
       token,
       "",
       ""

       );
       
       return new Promise(resolve=>resolve(responseObject));
    }

    //registracija novog korisnika
     @Post('user/register')//Post http://localhost:3000/auth/user/register/
     async userRegister(@Body() data: UserRegistrationDto) {
         return await this.userService.register(data);
     }

     @Post('user/login') //http://localhost:3000/auth/user/login
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

       //pravljenje tokena (JWT) za logovanje korisnika 
       const jwtData = new JwtDataDto();
       jwtData.role = "user";
       jwtData.id = user.userId;
       jwtData.identity = user.email;
       jwtData.exp = this.getDatePlus(60*5); //5 minuta da traje
       jwtData.ip = req.ip.toString();
       jwtData.ua = req.headers["user-agent"];

       //potpisivanje tokena
       let token: string = jwt.sign(jwtData.toPlanObject(), jwtSecret);


       //refresh token
       const jwtRefreshData = new  JwtRefreshDataDto();
       jwtRefreshData.id = jwtData.id;
       jwtRefreshData.role = jwtData.role;
       jwtRefreshData.identity = jwtData.identity;
       jwtRefreshData.exp = this.getDatePlus(60*60*24*31); // 31 dan da vazi
       jwtRefreshData.ip = jwtData.ip;
       jwtRefreshData.ua= jwtData.ua;

       let refreshToken: string = jwt.sign(jwtRefreshData.toPlanObject(), jwtSecret);
      

       const responseObject = new LoginInfoDto(
       user.userId,
       user.email,
       token,
       refreshToken,
       this.getIsoDate(jwtRefreshData.exp),
       );
     //upisivanje tokena u bazu podataka
       await this.userService.addToken(
           user.userId,
           refreshToken, 
           this.getDatabaseDateFormat(this.getIsoDate(jwtRefreshData.exp)));
       
       return new Promise(resolve=>resolve(responseObject));
    }

      //refreshovanje tokena
   //http://localhost:3000/auth/user/refresh
   @Post('user/refresh')
      async userTokenRefresh(@Req() req: Request, @Body() data: UserRefreshTokenDto):Promise<LoginInfoDto | ApiResponse>{
       const userToken = await this.userService.getUserToken(data.token);
      //ako token ne postoji
       if(!userToken){
           return new ApiResponse("error", -10002, "No such refresh token.");
       }
       //ako nije validan
       if(userToken.isValid === 0){
           return new ApiResponse("error", -10003, "The token is no longer valid.");
       }
       //ako je istekao token
       const sada = new Date();
       const datumIsteka = new Date(userToken.expiresAt);

       if(datumIsteka.getTime() < sada.getTime()){
           return new ApiResponse("error", -10004, "The token has expired.");
       }
       
       let jwtRefreshData: JwtRefreshDataDto;
       try {
           jwtRefreshData = jwt.verify(data.token,jwtSecret);
       } catch(e){
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
       }
       //ako je jwtRefreshToken prazan
       if (!jwtRefreshData){
           throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
          }
          
          const ip = req.ip.toString();
         //nepoklapajuca ip adresa
          if(jwtRefreshData.ip !== req.ip.toString()) {
           throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
          }
         //nepoklapajuci user-agent
          if(jwtRefreshData.ua !== req.headers["user-agent"]){
           throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
          }

          //pravljenje novog tokena
          const jwtData = new JwtDataDto();
          jwtData.role = jwtRefreshData.role;
          jwtData.id = jwtRefreshData.id;
          jwtData.identity = jwtRefreshData.identity;
          jwtData.exp = this.getDatePlus(60*5); //5 minuta da traje
          jwtData.ip = jwtRefreshData.ip;
          jwtData.ua = jwtRefreshData.ua;
   
          //potpisivanje tokena
          let token: string = jwt.sign(jwtData.toPlanObject(), jwtSecret);

          
          const responseObject = new LoginInfoDto(
          jwtData.id,
          jwtData.identity,
          token,
          data.token,  //refresh token
          this.getIsoDate(jwtRefreshData.exp),
        );

        return responseObject;
      
   }

    private getDatePlus(numberOfSeconds:number){
         return new Date().getTime()/1000 + numberOfSeconds;
    }
    
    private getIsoDate(timestamp: number){
        const date = new Date();
        date.setTime(timestamp * 1000);
        return date.toISOString();
    }

    private getDatabaseDateFormat(isoFormat: string): string {
        return isoFormat.substring(0,19).replace('T',' ');
    }
}