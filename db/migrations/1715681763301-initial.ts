import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715681763301 implements MigrationInterface {
    name = 'Initial1715681763301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variant_items" DROP CONSTRAINT "FK_55c0eb4d488aff313a86ec8570c"`);
        await queryRunner.query(`CREATE TABLE "items_variants" ("variantsId" integer NOT NULL, "variantItemsId" integer NOT NULL, CONSTRAINT "PK_a40e29ea59cbb0f4483a276b831" PRIMARY KEY ("variantsId", "variantItemsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae3e697eb995bc24da49c98912" ON "items_variants" ("variantsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_587688ecf504dc21852cd1e947" ON "items_variants" ("variantItemsId") `);
        await queryRunner.query(`ALTER TABLE "variant_items" DROP COLUMN "variantsId"`);
        await queryRunner.query(`ALTER TABLE "items_variants" ADD CONSTRAINT "FK_ae3e697eb995bc24da49c989128" FOREIGN KEY ("variantsId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "items_variants" ADD CONSTRAINT "FK_587688ecf504dc21852cd1e9476" FOREIGN KEY ("variantItemsId") REFERENCES "variant_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items_variants" DROP CONSTRAINT "FK_587688ecf504dc21852cd1e9476"`);
        await queryRunner.query(`ALTER TABLE "items_variants" DROP CONSTRAINT "FK_ae3e697eb995bc24da49c989128"`);
        await queryRunner.query(`ALTER TABLE "variant_items" ADD "variantsId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_587688ecf504dc21852cd1e947"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae3e697eb995bc24da49c98912"`);
        await queryRunner.query(`DROP TABLE "items_variants"`);
        await queryRunner.query(`ALTER TABLE "variant_items" ADD CONSTRAINT "FK_55c0eb4d488aff313a86ec8570c" FOREIGN KEY ("variantsId") REFERENCES "variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
