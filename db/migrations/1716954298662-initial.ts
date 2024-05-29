import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716954298662 implements MigrationInterface {
    name = 'Initial1716954298662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "paid_auctions" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "apptransid" character varying NOT NULL, "zp_trans_id" character varying NOT NULL, "auctionId" integer, CONSTRAINT "PK_772d90f5ab21ae9243607229089" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "paid_auctions" ADD CONSTRAINT "FK_d8959c4dc3344dc4ca02d2881ef" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paid_auctions" DROP CONSTRAINT "FK_d8959c4dc3344dc4ca02d2881ef"`);
        await queryRunner.query(`DROP TABLE "paid_auctions"`);
    }

}
