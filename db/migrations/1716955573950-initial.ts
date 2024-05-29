import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716955573950 implements MigrationInterface {
    name = 'Initial1716955573950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paid_auctions" ADD "isRefund" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paid_auctions" DROP COLUMN "isRefund"`);
    }

}
