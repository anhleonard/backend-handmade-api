import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1714841771821 implements MigrationInterface {
    name = 'Initial1714841771821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "averageRating"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "averageRating" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "averageRating"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "averageRating" integer NOT NULL DEFAULT '0'`);
    }

}
