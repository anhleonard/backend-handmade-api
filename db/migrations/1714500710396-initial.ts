import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1714500710396 implements MigrationInterface {
    name = 'Initial1714500710396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shippings" ("id" SERIAL NOT NULL, "phone" character varying NOT NULL, "name" character varying NOT NULL DEFAULT ' ', "province" character varying NOT NULL, "district" character varying NOT NULL, "ward" character varying NOT NULL, "detailAddress" character varying NOT NULL, "isDefaultAddress" boolean NOT NULL, "receivePlace" character varying NOT NULL, "companyName" character varying, "userId" integer, CONSTRAINT "PK_665fb613135782a598a2b47e5b2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_products" ("id" SERIAL NOT NULL, "productUnitPrice" numeric(30) NOT NULL DEFAULT '0', "productQuantity" integer NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "PK_3e59f094c2dc3310d585216a813" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "collections" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "storeId" integer, CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stores" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "avatar" character varying NOT NULL, "isBanned" boolean NOT NULL DEFAULT false, "description" character varying NOT NULL, "mainBusiness" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "productAmount" integer NOT NULL DEFAULT '0', "avgStoreRating" integer NOT NULL DEFAULT '0', "followerAmount" integer NOT NULL DEFAULT '0', "returnRate" integer NOT NULL DEFAULT '0', "canceledRate" integer NOT NULL DEFAULT '0', "ownerId" integer, CONSTRAINT "UQ_a205ca5a37fa5e10005f003aaf3" UNIQUE ("name"), CONSTRAINT "REL_a447ba082271c05997a61df26d" UNIQUE ("ownerId"), CONSTRAINT "PK_7aa6e7d71fa7acdd7ca43d7c9cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('processing', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "provisionalAmount" integer NOT NULL, "discountAmount" integer NOT NULL, "totalPayment" integer NOT NULL, "orderAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'processing', "shippedAt" TIMESTAMP, "deliveredAt" TIMESTAMP, "updatedById" integer, "shippingAddressId" integer, "clientId" integer, "storeId" integer, CONSTRAINT "REL_cc4e4adab232e8c05026b2f345" UNIQUE ("shippingAddressId"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "ratings" integer NOT NULL, "comment" character varying NOT NULL, "isReported" boolean NOT NULL DEFAULT false, "reportedReason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "productId" integer, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'USER', 'SELLER')`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "avatar" character varying, "role" "public"."users_role_enum" NOT NULL, "phoneNumber" character varying NOT NULL, "gender" "public"."users_gender_enum" NOT NULL, "dateOfBirth" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "addedById" integer, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "variant_items" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "variantsId" integer, "variantCategoryId" integer, CONSTRAINT "PK_9da8e12c88280439dd6d8c4b51b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "variant_categories" ("id" SERIAL NOT NULL, "variantName" character varying NOT NULL, CONSTRAINT "PK_42a6a16f589c2ca15d9c142550e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "productName" character varying NOT NULL, "productCode" character varying NOT NULL, "description" character varying NOT NULL, "materials" character varying NOT NULL, "mainColors" character varying NOT NULL, "uses" character varying NOT NULL, "productionDate" TIMESTAMP, "expirationDate" TIMESTAMP, "isHeavyGood" boolean NOT NULL, "isMultipleClasses" boolean NOT NULL, "price" numeric(30,0) DEFAULT '0', "inventoryNumber" integer, "images" text, "discount" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "addedById" integer, "storeId" integer, "collectionId" integer, CONSTRAINT "UQ_3146a8c669fc3f362c02fa9e0ba" UNIQUE ("productCode"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "variants" ("id" SERIAL NOT NULL, "unitPrice" integer NOT NULL, "inventoryNumber" integer NOT NULL, "image" character varying NOT NULL, "productId" integer, CONSTRAINT "PK_672d13d1a6de0197f20c6babb5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "store_followers" ("storesId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_94f872efd9d11fae552d6e754c3" PRIMARY KEY ("storesId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8561da9884289408e8d4743dea" ON "store_followers" ("storesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e42a2475b8d84b14261fe1e454" ON "store_followers" ("usersId") `);
        await queryRunner.query(`CREATE TABLE "variant_category_product" ("variantCategoriesId" integer NOT NULL, "productsId" integer NOT NULL, CONSTRAINT "PK_5c101b1e4539b50ba8877ed88b8" PRIMARY KEY ("variantCategoriesId", "productsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cc5155f00da6c11607b1ed1790" ON "variant_category_product" ("variantCategoriesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_95574115dd8d2abb9823ecc485" ON "variant_category_product" ("productsId") `);
        await queryRunner.query(`CREATE TABLE "category_product" ("productsId" integer NOT NULL, "categoriesId" integer NOT NULL, CONSTRAINT "PK_dc156140b2ab493d878d56c2540" PRIMARY KEY ("productsId", "categoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_693a3f2c45dbf86a39b2bce8d6" ON "category_product" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2b6d60cd2a099c0dd13caeeb56" ON "category_product" ("categoriesId") `);
        await queryRunner.query(`CREATE TABLE "user_favourite_product" ("productsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_c6daa1512f509267345c19f0619" PRIMARY KEY ("productsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6f28672786a47836d42f440e7b" ON "user_favourite_product" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7950b4160892f1d925cf5f4a37" ON "user_favourite_product" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "shippings" ADD CONSTRAINT "FK_bf0196789389b7f3bc043b9b053" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_products" ADD CONSTRAINT "FK_28b66449cf7cd76444378ad4e92" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_products" ADD CONSTRAINT "FK_27ca18f2453639a1cafb7404ece" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "collections" ADD CONSTRAINT "FK_068a0507b0e0fc23b06fcffd3f5" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "FK_a447ba082271c05997a61df26df" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1102b5a0c580f845993e2f766f6" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_cc4e4adab232e8c05026b2f345d" FOREIGN KEY ("shippingAddressId") REFERENCES "shippings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1457f286d91f271313fded23e53" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_0f82354e5b05fd87884eff3a7b5" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_f98c5a74d02c74694392026011f" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variant_items" ADD CONSTRAINT "FK_55c0eb4d488aff313a86ec8570c" FOREIGN KEY ("variantsId") REFERENCES "variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variant_items" ADD CONSTRAINT "FK_ae7dcd649a345faead51e82e76c" FOREIGN KEY ("variantCategoryId") REFERENCES "variant_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_d7e7f53b786522ae18147bb853c" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_782da5e50e94b763eb63225d69d" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_53823b875c14daa5e9009ee6839" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variants" ADD CONSTRAINT "FK_bdbfe33a28befefa9723c355036" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "store_followers" ADD CONSTRAINT "FK_8561da9884289408e8d4743dea2" FOREIGN KEY ("storesId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "store_followers" ADD CONSTRAINT "FK_e42a2475b8d84b14261fe1e4546" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" ADD CONSTRAINT "FK_cc5155f00da6c11607b1ed17902" FOREIGN KEY ("variantCategoriesId") REFERENCES "variant_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" ADD CONSTRAINT "FK_95574115dd8d2abb9823ecc4851" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category_product" ADD CONSTRAINT "FK_693a3f2c45dbf86a39b2bce8d69" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "category_product" ADD CONSTRAINT "FK_2b6d60cd2a099c0dd13caeeb56e" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favourite_product" ADD CONSTRAINT "FK_6f28672786a47836d42f440e7b6" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favourite_product" ADD CONSTRAINT "FK_7950b4160892f1d925cf5f4a370" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_favourite_product" DROP CONSTRAINT "FK_7950b4160892f1d925cf5f4a370"`);
        await queryRunner.query(`ALTER TABLE "user_favourite_product" DROP CONSTRAINT "FK_6f28672786a47836d42f440e7b6"`);
        await queryRunner.query(`ALTER TABLE "category_product" DROP CONSTRAINT "FK_2b6d60cd2a099c0dd13caeeb56e"`);
        await queryRunner.query(`ALTER TABLE "category_product" DROP CONSTRAINT "FK_693a3f2c45dbf86a39b2bce8d69"`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" DROP CONSTRAINT "FK_95574115dd8d2abb9823ecc4851"`);
        await queryRunner.query(`ALTER TABLE "variant_category_product" DROP CONSTRAINT "FK_cc5155f00da6c11607b1ed17902"`);
        await queryRunner.query(`ALTER TABLE "store_followers" DROP CONSTRAINT "FK_e42a2475b8d84b14261fe1e4546"`);
        await queryRunner.query(`ALTER TABLE "store_followers" DROP CONSTRAINT "FK_8561da9884289408e8d4743dea2"`);
        await queryRunner.query(`ALTER TABLE "variants" DROP CONSTRAINT "FK_bdbfe33a28befefa9723c355036"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_53823b875c14daa5e9009ee6839"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_782da5e50e94b763eb63225d69d"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_d7e7f53b786522ae18147bb853c"`);
        await queryRunner.query(`ALTER TABLE "variant_items" DROP CONSTRAINT "FK_ae7dcd649a345faead51e82e76c"`);
        await queryRunner.query(`ALTER TABLE "variant_items" DROP CONSTRAINT "FK_55c0eb4d488aff313a86ec8570c"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_f98c5a74d02c74694392026011f"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_0f82354e5b05fd87884eff3a7b5"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1457f286d91f271313fded23e53"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_cc4e4adab232e8c05026b2f345d"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1102b5a0c580f845993e2f766f6"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "FK_a447ba082271c05997a61df26df"`);
        await queryRunner.query(`ALTER TABLE "collections" DROP CONSTRAINT "FK_068a0507b0e0fc23b06fcffd3f5"`);
        await queryRunner.query(`ALTER TABLE "order_products" DROP CONSTRAINT "FK_27ca18f2453639a1cafb7404ece"`);
        await queryRunner.query(`ALTER TABLE "order_products" DROP CONSTRAINT "FK_28b66449cf7cd76444378ad4e92"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "FK_bf0196789389b7f3bc043b9b053"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7950b4160892f1d925cf5f4a37"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f28672786a47836d42f440e7b"`);
        await queryRunner.query(`DROP TABLE "user_favourite_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b6d60cd2a099c0dd13caeeb56"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_693a3f2c45dbf86a39b2bce8d6"`);
        await queryRunner.query(`DROP TABLE "category_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95574115dd8d2abb9823ecc485"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc5155f00da6c11607b1ed1790"`);
        await queryRunner.query(`DROP TABLE "variant_category_product"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e42a2475b8d84b14261fe1e454"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8561da9884289408e8d4743dea"`);
        await queryRunner.query(`DROP TABLE "store_followers"`);
        await queryRunner.query(`DROP TABLE "variants"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "variant_categories"`);
        await queryRunner.query(`DROP TABLE "variant_items"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "stores"`);
        await queryRunner.query(`DROP TABLE "collections"`);
        await queryRunner.query(`DROP TABLE "order_products"`);
        await queryRunner.query(`DROP TABLE "shippings"`);
    }

}