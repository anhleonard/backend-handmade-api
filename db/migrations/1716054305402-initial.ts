import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716054305402 implements MigrationInterface {
    name = 'Initial1716054305402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "status" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "status" SET DEFAULT 'AUCTIONING'`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "status" SET NOT NULL`);
    }

}
