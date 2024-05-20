import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716189293907 implements MigrationInterface {
    name = 'Initial1716189293907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bidders" ADD "acceptedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bidders" DROP COLUMN "acceptedAt"`);
    }

}
