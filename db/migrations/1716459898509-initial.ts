import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716459898509 implements MigrationInterface {
    name = 'Initial1716459898509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "idCards"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "frontCard" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "backCard" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "backCard"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "frontCard"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "idCards" text`);
    }

}
