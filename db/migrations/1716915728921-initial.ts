import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716915728921 implements MigrationInterface {
    name = 'Initial1716915728921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "apptransid" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "zp_trans_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "zp_trans_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "apptransid"`);
    }

}
