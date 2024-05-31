import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1717127838566 implements MigrationInterface {
    name = 'Initial1717127838566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bidders" DROP CONSTRAINT "FK_debfca23cc2cecc0019638b97a2"`);
        await queryRunner.query(`ALTER TABLE "bidders" ADD CONSTRAINT "FK_debfca23cc2cecc0019638b97a2" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bidders" DROP CONSTRAINT "FK_debfca23cc2cecc0019638b97a2"`);
        await queryRunner.query(`ALTER TABLE "bidders" ADD CONSTRAINT "FK_debfca23cc2cecc0019638b97a2" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
