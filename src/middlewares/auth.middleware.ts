import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as jwt from 'jsonwebtoken';
import { JwtDataDto } from "src/dtos/auth/jwt.data.dto";
import { jwtSecret } from "config/jwt.secret";
import { UserServise } from "src/services/user/user.servise";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
   constructor(
       public administratorService: AdministratorService,
       public userService: UserServise
       ){ }
   
    async use(req: Request, res: Response, next: NextFunction) {
      //nemogucnost dopremanja informacije da je authorization token dat
        if( !req.headers.authorization) {
           throw new HttpException('Token not found', HttpStatus.UNAUTHORIZED);
       }
        
       const token = req.headers.authorization;

       const tokenParts = token.split(' ');
       if(tokenParts.length!==2){
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
       }

       const tokenString = tokenParts[1];
       //nemogucnost dekodiranja tokena
       let jwtData: JwtDataDto;
       try {
           jwtData = jwt.verify(tokenString,jwtSecret);
       } catch(e){
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
       }
       //ako je prazan 
       if (!jwtData){
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
       }
       
       const ip = req.ip.toString();
      //nepoklapajuca ip adresa
       if(jwtData.ip !== req.ip.toString()) {
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
       }
      //nepoklapajuci user-agent
       if(jwtData.ua !== req.headers["user-agent"]){
        throw new HttpException('Bad token found', HttpStatus.UNAUTHORIZED);
       }
      //nepostojeci admin ili korisnik 
       if(jwtData.role === "administrator") {

       const administator = await this.administratorService.getById(jwtData.id);
       if(!administator){
        throw new HttpException('Account not found', HttpStatus.UNAUTHORIZED);
           }
       } else if (jwtData.role === "user"){
        const user = await this.userService.getById(jwtData.id);
        if(!user){
         throw new HttpException('Account not found', HttpStatus.UNAUTHORIZED);
            }
       }
       //provera da li je istekao token
       let sada = new Date();//trenutni datum
       const trenutniTimestamp = sada.getTime()/1000; //da bismo dobili broj sekundi
       
       if(trenutniTimestamp >= jwtData.exp){//da li je datum isteka manji od trenutnog timestampa(ako je manji znaci da je u proslosti)
        throw new HttpException('The token has expired', HttpStatus.UNAUTHORIZED);
       }
        
       req.token = jwtData;

        next();
    }

}