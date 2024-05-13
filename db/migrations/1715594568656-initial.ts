import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715594568656 implements MigrationInterface {
    name = 'Initial1715594568656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "profitMoney" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "profitMoney"`);
    }

}
