import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716881877568 implements MigrationInterface {
    name = 'Initial1716881877568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "isPaymentFull" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "isPaymentFull"`);
    }

}
