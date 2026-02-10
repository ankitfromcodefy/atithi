import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailPipelineSchema1770704459700 implements MigrationInterface {
  name = 'EmailPipelineSchema1770704459700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."guests_source_enum" AS ENUM('whatsapp', 'email')`,
    );
    await queryRunner.query(
      `CREATE TABLE "guests" ("hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255), "phone" character varying(20), "email" character varying(255), "whatsapp_id" character varying(50), "source" "public"."guests_source_enum" NOT NULL, CONSTRAINT "UQ_3b4092a0d3f8a7e18a3fff2df0e" UNIQUE ("hash"), CONSTRAINT "PK_3b4092a0d3f8a7e18a3fff2df0e" PRIMARY KEY ("hash"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b4092a0d3f8a7e18a3fff2df0" ON "guests" ("hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d015793afb5c9a11cf89a93ed0" ON "guests" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7239439a51b72e2008985c59c" ON "guests" ("updated_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1eb6342f78ae46deb71c586b7b" ON "guests" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_85d472bf0e9dd55ce9a8268c3e" ON "guests" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."raw_webhook_events_channel_enum" AS ENUM('whatsapp', 'email')`,
    );
    await queryRunner.query(
      `CREATE TABLE "raw_webhook_events" ("hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "channel" "public"."raw_webhook_events_channel_enum" NOT NULL, "event_type" character varying(50) NOT NULL, "external_message_id" character varying(255) NOT NULL, "raw_payload" jsonb NOT NULL, "processed" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_4e002408f2bd0572f56b5233f42" UNIQUE ("hash"), CONSTRAINT "PK_4e002408f2bd0572f56b5233f42" PRIMARY KEY ("hash"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4e002408f2bd0572f56b5233f4" ON "raw_webhook_events" ("hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ff61cfaff9862e891cbc9b8b2" ON "raw_webhook_events" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_777dba0192528b76eeedff6ba9" ON "raw_webhook_events" ("updated_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a53c10ac14945e03c86f7ea194" ON "raw_webhook_events" ("external_message_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "system_state" ("key" character varying(100) NOT NULL, "value" text NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a291c88459a85c912ca5f83eb83" PRIMARY KEY ("key"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_channel_enum" AS ENUM('whatsapp', 'email')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_direction_enum" AS ENUM('inbound', 'outbound')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_message_type_enum" AS ENUM('text', 'image', 'audio', 'document', 'system')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_messages_processing_status_enum" AS ENUM('received', 'processing', 'processed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "guest_id" character varying NOT NULL, "booking_id" character varying, "channel" "public"."chat_messages_channel_enum" NOT NULL, "direction" "public"."chat_messages_direction_enum" NOT NULL, "message_type" "public"."chat_messages_message_type_enum" NOT NULL DEFAULT 'text', "content" text, "subject" character varying(500), "external_message_id" character varying(255), "thread_id" character varying(255), "sender_name" character varying(255), "sender_identifier" character varying(255), "processing_status" "public"."chat_messages_processing_status_enum" NOT NULL DEFAULT 'received', "metadata" jsonb NOT NULL DEFAULT '{}', "raw_event_id" character varying, CONSTRAINT "UQ_5ccef90d04c7c7937bb4cc94d33" UNIQUE ("hash"), CONSTRAINT "PK_5ccef90d04c7c7937bb4cc94d33" PRIMARY KEY ("hash"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ccef90d04c7c7937bb4cc94d3" ON "chat_messages" ("hash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52d89390506ed998a56a73c04c" ON "chat_messages" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c0503b92bed2f0a6b286b68042" ON "chat_messages" ("updated_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f1c7b48946aca87a0c913e8cc7" ON "chat_messages" ("external_message_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0456a7195c0297a0542efeca54" ON "chat_messages" ("guest_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4a4efd477b76c6c1874af885f" ON "chat_messages" ("guest_id", "processing_status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_549ed0e09eb4244eb3a2b7124cc" FOREIGN KEY ("guest_id") REFERENCES "guests"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_cf8f6866b52f5bcf2568bdecefe" FOREIGN KEY ("raw_event_id") REFERENCES "raw_webhook_events"("hash") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_cf8f6866b52f5bcf2568bdecefe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_549ed0e09eb4244eb3a2b7124cc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4a4efd477b76c6c1874af885f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0456a7195c0297a0542efeca54"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f1c7b48946aca87a0c913e8cc7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c0503b92bed2f0a6b286b68042"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52d89390506ed998a56a73c04c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ccef90d04c7c7937bb4cc94d3"`,
    );
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(
      `DROP TYPE "public"."chat_messages_processing_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chat_messages_message_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chat_messages_direction_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."chat_messages_channel_enum"`);
    await queryRunner.query(`DROP TABLE "system_state"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a53c10ac14945e03c86f7ea194"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_777dba0192528b76eeedff6ba9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ff61cfaff9862e891cbc9b8b2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4e002408f2bd0572f56b5233f4"`,
    );
    await queryRunner.query(`DROP TABLE "raw_webhook_events"`);
    await queryRunner.query(
      `DROP TYPE "public"."raw_webhook_events_channel_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85d472bf0e9dd55ce9a8268c3e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1eb6342f78ae46deb71c586b7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7239439a51b72e2008985c59c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d015793afb5c9a11cf89a93ed0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b4092a0d3f8a7e18a3fff2df0"`,
    );
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TYPE "public"."guests_source_enum"`);
  }
}
