import { Controller, Get } from '@nestjs/common';


@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World'; //http://localhost:3000/
  }
   @Get('world')
  getWorld(): string {
    return 'World!!!';
  }
}
