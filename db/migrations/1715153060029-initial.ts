import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715153060029 implements MigrationInterface {
    name = 'Initial1715153060029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "additionalComment" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "additionalComment"`);
    }

}
