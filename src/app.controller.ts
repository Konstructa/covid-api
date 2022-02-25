import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Cron('0 21 */1 * *')
  getUsaAndBrazi() {
    return this.appService.getUsaAndBrazil();
  }

  @Cron('0 21 */1 * *')
  getChinaAndRussia() {
    return this.appService.getChinaAndRussia();
  }
}
