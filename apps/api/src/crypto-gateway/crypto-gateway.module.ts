import { Module } from "@nestjs/common";
import { CryptoGatewayService } from "./crypto-gateway.service";

@Module({
  providers: [CryptoGatewayService],
  exports: [CryptoGatewayService],
})
export class CryptoGatewayModule {}


