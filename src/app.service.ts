import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { Resultado } from './interface/result.interface';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async getUsaAndBrazil() {
    const result: Resultado[] = [];

    const url = 'https://disease.sh/v3/covid-19/countries/brazil,usa';

    for (let i = 0; i < 2; i++) {
      const data = this.httpService.get(url).pipe(
        map((res) => res.data[i]),
        map(
          (data): Resultado => ({
            país: data.country,
            casosHoje: data.todayCases,
            mortesHoje: data.todayDeaths,
            data: new Date(),
            ativos: data.active,
            estadoCritico: data.critical,
          }),
        ),
      );

      const observable = await lastValueFrom(data);
      result.push(observable);
    }

    return result;
  }

  async getChinaAndRussia() {
    const result: Resultado[] = [];

    const url = 'https://disease.sh/v3/covid-19/countries/china,russia';

    for (let i = 0; i < 2; i++) {
      const data = this.httpService.get(url).pipe(
        map((res) => res.data[i]),
        map(
          (data): Resultado => ({
            país: data.country,
            casosHoje: data.todayCases,
            mortesHoje: data.todayDeaths,
            data: new Date(),
            ativos: data.active,
            estadoCritico: data.critical,
          }),
        ),
      );

      const observable = await lastValueFrom(data);
      result.push(observable);
    }

    return result;
  }
}
