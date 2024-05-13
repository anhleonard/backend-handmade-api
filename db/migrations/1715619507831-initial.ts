import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715619507831 implements MigrationInterface {
    name = 'Initial1715619507831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "editHint" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "editHint"`);
    }

}
