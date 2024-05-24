import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716535718111 implements MigrationInterface {
    name = 'Initial1716535718111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "isBanned"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "bannedReason" character varying`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "notApproveReason" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "notApproveReason"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "bannedReason"`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "isBanned" boolean NOT NULL DEFAULT false`);
    }

}
