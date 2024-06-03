import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717405165380 implements MigrationInterface {
    name = 'Initial1717405165380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "isMinusPoint" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "isMinusPoint"`);
    }

}
