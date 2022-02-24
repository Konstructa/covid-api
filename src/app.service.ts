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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getUsaAndBrazil() {
    this.processBeginUntilEnd('FOLDER_ID_USA_BRA', 'usa,brazil');
  }

  async getChinaAndRussia() {
    this.processBeginUntilEnd('FOLDER_ID_CHINA_RUSSIA', 'china,russia');
  }

  async processBeginUntilEnd(folderIdConfig: string, countries: string) {
    const folderId = this.configService.get(folderIdConfig);
    const result = await this.getData(countries);
    const csv = await this.parseData(result);
    const [filePath, fileName] = await this.exportCSVfile(csv);
    await this.sendFormData(`${filePath}/${fileName}`, fileName, folderId);
    this.deleteLocalFile(`${filePath}/${fileName}`);
  }

  async parseData(data: any) {
    try {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);
      return csv;
    } catch (error) {
      console.log(error);
    }
  }

  async exportCSVfile(csv: string) {
    const filePath = __dirname + `/../src/archive`;
    const fileName = `covid-${new Date().toISOString()}.csv`;
    try {
      await createFile(filePath, fileName, csv);
      return [filePath, fileName];
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

    return result;
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

  async sendFormData(path: string, fileName: string, folderId: string) {
    const token = this.configService.get('API_TOKEN');
    const urlServer = await this.getBestServer();
    try {
      const file = await getFile(path);

      const form = new FormData();
      form.append('file', file, fileName);
      form.append('token', token);
      form.append('folderId', folderId);
      const headers = {
        ...form.getHeaders(),
      };

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
  }

  deleteLocalFile(path: string) {
    deleteFile(path);
  }
}
