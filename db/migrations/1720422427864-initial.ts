import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1720422427864 implements MigrationInterface {
    name = 'Initial1720422427864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "bankName" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "accountNumber" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bankName"`);
    }

}
