import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715876569379 implements MigrationInterface {
    name = 'Initial1715876569379'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryFee" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryFee"`);
    }

}
