import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1714838778264 implements MigrationInterface {
    name = 'Initial1714838778264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "averageRating" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "soldNumber" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "soldNumber"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "averageRating"`);
    }

}
