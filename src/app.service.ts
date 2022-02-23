import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { Resultado } from './interface/result.interface';
import { Parser } from 'json2csv';
import {
  getFile,
  createFile,
  deleteFile,
} from './common/helpers/storage.helper';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  getUsaAndBrazil() {
    return this.getData('usa,brazil');
  }

  getChinaAndRussia() {
    return this.getData('china,russia');
  }

  async parseData(data: any) {
    try {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);
      this.exportCSVfile(csv);
    } catch (error) {
      console.log(error);
    }
  }

  exportCSVfile(csv: string) {
    try {
      const filePath = __dirname + `/../src/archive`;
      const fileName = `country-${new Date().toISOString()}.csv`;
      console.log(csv);
      return createFile(filePath, fileName, csv);
    } catch (error) {
      console.log(error);
    }
  }

  async getData(c: string) {
    const result: Resultado[] = [];

    const url = 'https://disease.sh/v3/covid-19/countries/' + c;

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

    this.parseData(result);
  }
}
