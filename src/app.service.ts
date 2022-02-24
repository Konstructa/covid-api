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
import * as FormData from 'form-data';

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

  async exportCSVfile(csv: string) {
    const filePath = __dirname + `/../src/archive`;
    const fileName = `country-${new Date().toISOString()}.csv`;
    try {
      await createFile(filePath, fileName, csv);
      return this.sendFormData(`${filePath}/${fileName}`);
    } catch (error) {
      console.log(error);
    }
  }

  async getData(countries: string) {
    const result: Resultado[] = [];

    const url = 'https://disease.sh/v3/covid-19/countries/' + countries;

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

  async getBestServer() {
    const url2 = 'https://api.gofile.io/getServer';

    try {
      const data = this.httpService.get(url2).pipe(
        map((res) => res.data),
        map((data) => data.data.server),
      );
      const server = await lastValueFrom(data);
      return `https://${server}.gofile.io/uploadFile`;
    } catch (error) {
      console.log(error);
    }
  }

  async sendFormData(path: string) {
    const urlServer = await this.getBestServer();
    try {
      const file = await getFile(path);

      const form = new FormData();
      form.append('file', file, 'teste2.csv');
      form.append('token', '8LsjfkT4OIGWwDq18VtzCOvknAChoG77');
      form.append('folderId', '37728105-9830-4616-a45f-6facf1ce5518');
      const headers = {
        ...form.getHeaders(),
      };

      setTimeout(async () => {
        try {
          console.log(file);
          const teste = this.httpService
            .post(urlServer, form, {
              headers,
            })
            .pipe(map((res) => res.data));
          const observable = await lastValueFrom(teste);
          console.log(observable);
        } catch (error) {
          console.log(error);
        }
      }, 1);
    } catch (error) {
      console.log(error);
    }
  }
}
