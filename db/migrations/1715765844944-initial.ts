import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715765844944 implements MigrationInterface {
    name = 'Initial1715765844944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_products" ALTER COLUMN "code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_products" ADD CONSTRAINT "UQ_b491cdb245e396696cb4a0c36d8" UNIQUE ("code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_products" DROP CONSTRAINT "UQ_b491cdb245e396696cb4a0c36d8"`);
        await queryRunner.query(`ALTER TABLE "order_products" ALTER COLUMN "code" DROP NOT NULL`);
    }

}
