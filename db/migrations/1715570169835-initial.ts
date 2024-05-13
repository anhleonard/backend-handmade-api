import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715570169835 implements MigrationInterface {
    name = 'Initial1715570169835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "isAccepted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('ALL', 'NO_ITEM', 'PENDING', 'VIOLATE', 'SELLING', 'OFF')`);
        await queryRunner.query(`ALTER TABLE "products" ADD "status" "public"."products_status_enum" NOT NULL DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "isAccepted"`);
    }

}
