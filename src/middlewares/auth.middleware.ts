import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AdministratorService } from "src/services/administrator/administrator.service";
import * as jwt from 'jsonwebtoken';
import { JwtDataAdministratorDto } from "src/dtos/administrator/jwt.data.administrator.dto";
import { jwtSecret } from "config/jwt.secret";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
   constructor(private readonly administratorService: AdministratorService){ }
   
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
       const jwtData: JwtDataAdministratorDto = jwt.verify(tokenString,jwtSecret);
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
      //nepostojeci korisnik
       const administator = await this.administratorService.getById(jwtData.administratorId);
       if(!administator){
        throw new HttpException('Account not found', HttpStatus.UNAUTHORIZED);
       }

       //provera da li je istekao token
       let sada = new Date();//trenutni datum
       const trenutniTimestamp = sada.getTime()/1000; //da bismo dobili broj sekundi
       
       if(trenutniTimestamp >= jwtData.ext){//da li je datum isteka manji od trenutnog timestampa(ako je manji znaci da je u proslosti)
        throw new HttpException('The token has expired', HttpStatus.UNAUTHORIZED);
       }
     

        next();
    }

}