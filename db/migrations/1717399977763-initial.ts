import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717399977763 implements MigrationInterface {
    name = 'Initial1717399977763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "score" integer NOT NULL DEFAULT '1000'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "score"`);
    }

}
