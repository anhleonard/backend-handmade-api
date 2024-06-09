import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717909945726 implements MigrationInterface {
    name = 'Initial1717909945726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "additions" ("id" SERIAL NOT NULL, "days" integer NOT NULL, "comment" character varying NOT NULL, "isAccepted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "auctionId" integer, "userId" integer, CONSTRAINT "REL_f8796bcb6fa55df05970a3a804" UNIQUE ("auctionId"), CONSTRAINT "PK_0db9a59220d75aa9870aa7e0c01" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "additionsId" integer`);
        await queryRunner.query(`ALTER TABLE "additions" ADD CONSTRAINT "FK_f8796bcb6fa55df05970a3a8044" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "additions" ADD CONSTRAINT "FK_d32a49874d97c76dd680d3af047" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_41b7a22a79eaeb4f636d82db75d" FOREIGN KEY ("additionsId") REFERENCES "additions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_41b7a22a79eaeb4f636d82db75d"`);
        await queryRunner.query(`ALTER TABLE "additions" DROP CONSTRAINT "FK_d32a49874d97c76dd680d3af047"`);
        await queryRunner.query(`ALTER TABLE "additions" DROP CONSTRAINT "FK_f8796bcb6fa55df05970a3a8044"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "additionsId"`);
        await queryRunner.query(`DROP TABLE "additions"`);
    }

}
