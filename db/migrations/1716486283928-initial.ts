import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716486283928 implements MigrationInterface {
    name = 'Initial1716486283928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "status" character varying NOT NULL DEFAULT 'INACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "status"`);
    }

}
