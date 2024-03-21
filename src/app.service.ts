import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      app_name: "Avado Finance",
      version: 1.0
    };
  }
}
