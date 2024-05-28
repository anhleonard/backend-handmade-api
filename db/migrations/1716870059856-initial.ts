import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716870059856 implements MigrationInterface {
    name = 'Initial1716870059856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "isPaymentDeposit" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "isPaymentDeposit"`);
    }

}
