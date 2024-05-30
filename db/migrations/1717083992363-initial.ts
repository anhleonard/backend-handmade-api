import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717083992363 implements MigrationInterface {
    name = 'Initial1717083992363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_c292614970ddb8b8f504567ca6b"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_068f95adc7d2440e822dba61ab4"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_ec74ccf82cc14ed760d18742fe4"`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_ec74ccf82cc14ed760d18742fe4" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_068f95adc7d2440e822dba61ab4" FOREIGN KEY ("shippingId") REFERENCES "shippings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_c292614970ddb8b8f504567ca6b" FOREIGN KEY ("canceledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_c292614970ddb8b8f504567ca6b"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_068f95adc7d2440e822dba61ab4"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_ec74ccf82cc14ed760d18742fe4"`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_ec74ccf82cc14ed760d18742fe4" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_068f95adc7d2440e822dba61ab4" FOREIGN KEY ("shippingId") REFERENCES "shippings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_c292614970ddb8b8f504567ca6b" FOREIGN KEY ("canceledById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
