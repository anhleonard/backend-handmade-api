import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716016735227 implements MigrationInterface {
    name = 'Initial1716016735227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "profitMoney"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "profitMoney" integer`);
    }

}
