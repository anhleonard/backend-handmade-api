import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716106469833 implements MigrationInterface {
    name = 'Initial1716106469833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "maxDays" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "maxDays" DROP NOT NULL`);
    }

}
