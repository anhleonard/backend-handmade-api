import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1716632192803 implements MigrationInterface {
    name = 'Initial1716632192803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_53823b875c14daa5e9009ee6839"`);
        await queryRunner.query(`CREATE TABLE "products_collections" ("collectionsId" integer NOT NULL, "productsId" integer NOT NULL, CONSTRAINT "PK_f16e56c2210820e69d551b11937" PRIMARY KEY ("collectionsId", "productsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_520d9f440d6c8b161c15c441ac" ON "products_collections" ("collectionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6f720ab379200e7ed1d8847ab2" ON "products_collections" ("productsId") `);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "collectionId"`);
        await queryRunner.query(`ALTER TABLE "products_collections" ADD CONSTRAINT "FK_520d9f440d6c8b161c15c441acd" FOREIGN KEY ("collectionsId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_collections" ADD CONSTRAINT "FK_6f720ab379200e7ed1d8847ab27" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products_collections" DROP CONSTRAINT "FK_6f720ab379200e7ed1d8847ab27"`);
        await queryRunner.query(`ALTER TABLE "products_collections" DROP CONSTRAINT "FK_520d9f440d6c8b161c15c441acd"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "collectionId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f720ab379200e7ed1d8847ab2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_520d9f440d6c8b161c15c441ac"`);
        await queryRunner.query(`DROP TABLE "products_collections"`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_53823b875c14daa5e9009ee6839" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
