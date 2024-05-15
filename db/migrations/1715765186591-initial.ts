import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715765186591 implements MigrationInterface {
    name = 'Initial1715765186591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_products" ADD "code" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_products" DROP COLUMN "code"`);
    }

}
