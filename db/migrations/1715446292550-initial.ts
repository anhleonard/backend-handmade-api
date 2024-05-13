import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715446292550 implements MigrationInterface {
    name = 'Initial1715446292550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variants" ADD "addedById" integer`);
        await queryRunner.query(`ALTER TABLE "variants" ADD CONSTRAINT "FK_074203470ab8b7638f531554824" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variants" DROP CONSTRAINT "FK_074203470ab8b7638f531554824"`);
        await queryRunner.query(`ALTER TABLE "variants" DROP COLUMN "addedById"`);
    }

}
