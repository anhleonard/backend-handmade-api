import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715049577634 implements MigrationInterface {
    name = 'Initial1715049577634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "isCanceled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "canceledReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "canceledReason"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "isCanceled"`);
    }

}
