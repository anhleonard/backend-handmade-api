import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717320597476 implements MigrationInterface {
    name = 'Initial1717320597476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "address" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "address"`);
    }

}
