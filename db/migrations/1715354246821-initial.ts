import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715354246821 implements MigrationInterface {
    name = 'Initial1715354246821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variant_items" DROP CONSTRAINT "FK_ae7dcd649a345faead51e82e76c"`);
        await queryRunner.query(`ALTER TABLE "variant_items" ADD CONSTRAINT "FK_ae7dcd649a345faead51e82e76c" FOREIGN KEY ("variantCategoryId") REFERENCES "variant_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variant_items" DROP CONSTRAINT "FK_ae7dcd649a345faead51e82e76c"`);
        await queryRunner.query(`ALTER TABLE "variant_items" ADD CONSTRAINT "FK_ae7dcd649a345faead51e82e76c" FOREIGN KEY ("variantCategoryId") REFERENCES "variant_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
