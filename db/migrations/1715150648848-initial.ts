import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715150648848 implements MigrationInterface {
    name = 'Initial1715150648848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "isAccepted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "images" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "images" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "isAccepted"`);
    }

}
