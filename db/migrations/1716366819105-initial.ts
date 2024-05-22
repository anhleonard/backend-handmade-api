import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716366819105 implements MigrationInterface {
    name = 'Initial1716366819105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "canceledById" integer`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_c292614970ddb8b8f504567ca6b" FOREIGN KEY ("canceledById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_c292614970ddb8b8f504567ca6b"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "canceledById"`);
    }

}
