import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715590193675 implements MigrationInterface {
    name = 'Initial1715590193675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "expirationAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "expirationAt" TIMESTAMP`);
    }

}
