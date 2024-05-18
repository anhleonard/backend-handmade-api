import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716011831858 implements MigrationInterface {
    name = 'Initial1716011831858'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "isReadyDelivery" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "isReadyDelivery"`);
    }

}
