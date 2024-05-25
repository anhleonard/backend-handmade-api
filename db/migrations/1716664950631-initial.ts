import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716664950631 implements MigrationInterface {
    name = 'Initial1716664950631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "image"`);
    }

}
