import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716104521649 implements MigrationInterface {
    name = 'Initial1716104521649'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "updatedAt"`);
    }

}
