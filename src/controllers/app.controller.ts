import { Controller, Get } from '@nestjs/common';
import { Administrator } from 'entities/administator.entity';
import { AdministratorService } from '../services/administrator/administrator.service';


@Controller()
export class AppController {
  constructor(
    private administatorService: AdministratorService
  ) { }
  
  
  @Get()
  getIndex(): string {
    return 'Home page'; //http://localhost:3000/
  }

 }
