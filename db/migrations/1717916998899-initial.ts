import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717916998899 implements MigrationInterface {
    name = 'Initial1717916998899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paid_auctions" DROP CONSTRAINT "FK_d8959c4dc3344dc4ca02d2881ef"`);
        await queryRunner.query(`ALTER TABLE "paid_auctions" ADD CONSTRAINT "FK_d8959c4dc3344dc4ca02d2881ef" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paid_auctions" DROP CONSTRAINT "FK_d8959c4dc3344dc4ca02d2881ef"`);
        await queryRunner.query(`ALTER TABLE "paid_auctions" ADD CONSTRAINT "FK_d8959c4dc3344dc4ca02d2881ef" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
