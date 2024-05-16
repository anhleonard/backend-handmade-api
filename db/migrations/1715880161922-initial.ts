import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1715880161922 implements MigrationInterface {
    name = 'Initial1715880161922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders_order_products" ("ordersId" integer NOT NULL, "orderProductsId" integer NOT NULL, CONSTRAINT "PK_22fdee21eb5a8438896ecdcb936" PRIMARY KEY ("ordersId", "orderProductsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a206de90cc4a89e8212698525f" ON "orders_order_products" ("ordersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ca2aaf4b36d994ca8e772709a6" ON "orders_order_products" ("orderProductsId") `);
        await queryRunner.query(`ALTER TABLE "orders_order_products" ADD CONSTRAINT "FK_a206de90cc4a89e8212698525fa" FOREIGN KEY ("ordersId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "orders_order_products" ADD CONSTRAINT "FK_ca2aaf4b36d994ca8e772709a6a" FOREIGN KEY ("orderProductsId") REFERENCES "order_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_order_products" DROP CONSTRAINT "FK_ca2aaf4b36d994ca8e772709a6a"`);
        await queryRunner.query(`ALTER TABLE "orders_order_products" DROP CONSTRAINT "FK_a206de90cc4a89e8212698525fa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ca2aaf4b36d994ca8e772709a6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a206de90cc4a89e8212698525f"`);
        await queryRunner.query(`DROP TABLE "orders_order_products"`);
    }

}
