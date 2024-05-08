import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715142757731 implements MigrationInterface {
    name = 'Initial1715142757731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bidders" ("id" SERIAL NOT NULL, "bidderMoney" integer NOT NULL, "estimatedDay" integer NOT NULL, "selfIntroduce" character varying NOT NULL, "isSelected" boolean NOT NULL DEFAULT false, "storeId" integer, "auctionId" integer, CONSTRAINT "PK_7d6bd2cbe086459533d45ff1bcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "progresses" ("id" SERIAL NOT NULL, "percentage" integer, "comment" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "auctionId" integer, "userId" integer, CONSTRAINT "PK_8bd707ae89e9482ebf23658011e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auctions_status_enum" AS ENUM('AUCTIONING', 'PROGRESS', 'DELIVERY', 'COMPLETED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "auctions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "images" text NOT NULL, "requiredNumber" integer NOT NULL, "maxAmount" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "closedDate" TIMESTAMP NOT NULL, "deposit" integer NOT NULL, "readyToLaunch" boolean NOT NULL DEFAULT false, "status" "public"."auctions_status_enum" NOT NULL DEFAULT 'AUCTIONING', "ownerId" integer, "shippingId" integer, CONSTRAINT "PK_87d2b34d4829f0519a5c5570368" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bidders" ADD CONSTRAINT "FK_debfca23cc2cecc0019638b97a2" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bidders" ADD CONSTRAINT "FK_dad2e275de5505cac5fbab3ea02" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progresses" ADD CONSTRAINT "FK_d76b55f171bac7223944383596a" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progresses" ADD CONSTRAINT "FK_53521976154b5eca84f568ecee1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_ec74ccf82cc14ed760d18742fe4" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_068f95adc7d2440e822dba61ab4" FOREIGN KEY ("shippingId") REFERENCES "shippings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_068f95adc7d2440e822dba61ab4"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_ec74ccf82cc14ed760d18742fe4"`);
        await queryRunner.query(`ALTER TABLE "progresses" DROP CONSTRAINT "FK_53521976154b5eca84f568ecee1"`);
        await queryRunner.query(`ALTER TABLE "progresses" DROP CONSTRAINT "FK_d76b55f171bac7223944383596a"`);
        await queryRunner.query(`ALTER TABLE "bidders" DROP CONSTRAINT "FK_dad2e275de5505cac5fbab3ea02"`);
        await queryRunner.query(`ALTER TABLE "bidders" DROP CONSTRAINT "FK_debfca23cc2cecc0019638b97a2"`);
        await queryRunner.query(`DROP TABLE "auctions"`);
        await queryRunner.query(`DROP TYPE "public"."auctions_status_enum"`);
        await queryRunner.query(`DROP TABLE "progresses"`);
        await queryRunner.query(`DROP TABLE "bidders"`);
    }

}
