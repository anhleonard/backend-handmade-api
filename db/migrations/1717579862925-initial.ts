import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717579862925 implements MigrationInterface {
    name = 'Initial1717579862925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."auctions_status_enum" RENAME TO "auctions_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."auctions_status_enum" AS ENUM('SENT_SELLER', 'AUCTIONING', 'PROGRESS', 'DELIVERY', 'COMPLETED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "status" TYPE "public"."auctions_status_enum" USING "status"::"text"::"public"."auctions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."auctions_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."auctions_status_enum_old" AS ENUM('AUCTIONING', 'PROGRESS', 'DELIVERY', 'COMPLETED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "status" TYPE "public"."auctions_status_enum_old" USING "status"::"text"::"public"."auctions_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."auctions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."auctions_status_enum_old" RENAME TO "auctions_status_enum"`);
    }

}
