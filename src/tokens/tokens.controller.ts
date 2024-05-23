import { Body, Controller, Post } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Post('/random-token')
  async randomToken() {
    return await this.tokensService.randomToken();
  }

  @Post('/checking-already-token')
  async checkAlreadyToken(@Body() body: any) {
    return await this.tokensService.checkAlreadyToken(body);
  }
}
