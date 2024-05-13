import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1715572401900 implements MigrationInterface {
  name = 'Initial1715572401900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "expirationAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "expirationAt"`,
    );
  }
}
