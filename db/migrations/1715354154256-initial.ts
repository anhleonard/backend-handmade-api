import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715354154256 implements MigrationInterface {
    name = 'Initial1715354154256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variant_categories" DROP CONSTRAINT "FK_c556b6f62b5e4c2962ec96ae084"`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" DROP CONSTRAINT "FK_cc5155f00da6c11607b1ed17902"`);
        await queryRunner.query(`ALTER TABLE "variant_categories" ADD CONSTRAINT "FK_c556b6f62b5e4c2962ec96ae084" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" ADD CONSTRAINT "FK_cc5155f00da6c11607b1ed17902" FOREIGN KEY ("variantCategoriesId") REFERENCES "variant_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variant_category_product" DROP CONSTRAINT "FK_cc5155f00da6c11607b1ed17902"`);
        await queryRunner.query(`ALTER TABLE "variant_categories" DROP CONSTRAINT "FK_c556b6f62b5e4c2962ec96ae084"`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" ADD CONSTRAINT "FK_cc5155f00da6c11607b1ed17902" FOREIGN KEY ("variantCategoriesId") REFERENCES "variant_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "variant_categories" ADD CONSTRAINT "FK_c556b6f62b5e4c2962ec96ae084" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
