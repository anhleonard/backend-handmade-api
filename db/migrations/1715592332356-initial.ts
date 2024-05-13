import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715592332356 implements MigrationInterface {
    name = 'Initial1715592332356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "rejectReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "rejectReason"`);
    }

}
