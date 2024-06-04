import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717492699247 implements MigrationInterface {
    name = 'Initial1717492699247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "embeddings" ("id" SERIAL NOT NULL, "vector" character varying NOT NULL, "storeId" integer, CONSTRAINT "REL_cd42250347182ac003857346b6" UNIQUE ("storeId"), CONSTRAINT "PK_19b6b451e1ef345884caca1f544" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "embeddingId" integer`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "UQ_cfe6df55c0f8e0db50d4bf22b04" UNIQUE ("embeddingId")`);
        await queryRunner.query(`ALTER TABLE "embeddings" ADD CONSTRAINT "FK_cd42250347182ac003857346b60" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_cfe6df55c0f8e0db50d4bf22b04" FOREIGN KEY ("embeddingId") REFERENCES "embeddings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_cfe6df55c0f8e0db50d4bf22b04"`);
        await queryRunner.query(`ALTER TABLE "embeddings" DROP CONSTRAINT "FK_cd42250347182ac003857346b60"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "UQ_cfe6df55c0f8e0db50d4bf22b04"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "embeddingId"`);
        await queryRunner.query(`DROP TABLE "embeddings"`);
    }

}
