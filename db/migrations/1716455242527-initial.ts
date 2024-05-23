import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716455242527 implements MigrationInterface {
    name = 'Initial1716455242527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "hasStore" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hasStore"`);
    }

}
