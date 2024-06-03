import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717408553415 implements MigrationInterface {
    name = 'Initial1717408553415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "isMinusPoint" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "isMinusPoint"`);
    }

}
