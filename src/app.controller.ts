import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/usa-bra')
  getUsaAndBrazi() {
    return this.appService.getUsaAndBrazil();
  }

  @Get('china-russia')
  getChinaAndRussia() {
    return this.appService.getUsaAndBrazil();
  }
}
