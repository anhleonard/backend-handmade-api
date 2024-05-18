import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715934471295 implements MigrationInterface {
    name = 'Initial1715934471295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "processingAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "processingAt"`);
    }

}
