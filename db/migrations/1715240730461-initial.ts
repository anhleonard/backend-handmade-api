import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715240730461 implements MigrationInterface {
    name = 'Initial1715240730461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "createdAt"`);
    }

}
