import { Module } from "@nestjs/common";
import { PayoutsService } from "./payouts.service";
import { PayoutsController } from "./payouts.controller";
import { AdminPayoutsController } from "./admin-payouts.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  imports: [PrismaModule, TransactionsModule],
  controllers: [PayoutsController, AdminPayoutsController],
  providers: [PayoutsService],
  exports: [PayoutsService],
})
export class PayoutsModule {}

