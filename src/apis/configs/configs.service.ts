import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
@Injectable()
export class ConfigsService {
  getHomeConfig() {
    return {
      data: {
        suggestions: [
          {
            title: 'Memory Lane',
            data: [
              {
                url: 'https://media.tenor.com/sq91_zcvgsIAAAAi/cat-tease.gif',
              },
              {
                url: 'https://media.tenor.com/pjTIYupVw_cAAAAC/talk-to-the-hand-beastie-boys.gif',
              },
              {
                url: 'https://media.tenor.com/zrpyKEyxZGwAAAAM/fat-cat-laser-eyes.gif',
              },
              {
                url: 'https://media.tenor.com/PgCKM6VsY84AAAAd/daymn-e3.gif',
              },
            ],
          },
          {
            title: 'Hidden Messages',
            data: [
              {
                url: 'https://media.tenor.com/B43QChPmpGEAAAAj/cat-bunny.gif',
              },
              {
                url: 'https://media.tenor.com/JaxekKuAfzYAAAAj/rabbit.gif',
              },
              {
                url: 'https://media.tenor.com/SZOI9mnTYIwAAAAj/tanzen-hase.gif',
              },
              {
                url: 'https://media.tenor.com/w4jf8tasIOoAAAAj/dance.gif',
              },
              {
                url: 'https://media.tenor.com/o0kkMEBHvQgAAAAM/dancing-modi-ji-pm-modi.gif',
              },
            ],
          },
        ],
      },
    };
  }
}
