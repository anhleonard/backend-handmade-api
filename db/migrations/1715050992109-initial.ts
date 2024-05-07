import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715050992109 implements MigrationInterface {
    name = 'Initial1715050992109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "updatedAt"`);
    }

}
