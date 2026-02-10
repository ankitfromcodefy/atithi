import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Index,
  UpdateDateColumn,
} from "typeorm";
import KSUID from "ksuid";

export enum PrefixType {
  Base = "bas",
  User = "usr",
  Question = "qst",
  Answer = "ans",
  Quiz = "qiz",
  QuizAttempt = "qat",
  Category = "cat",
  StudySession = "ses",
  Guest = "gst",
  RawWebhookEvent = "rwe",
  ChatMessage = "msg",
}

export function generateSid(prefix: PrefixType = PrefixType.Base): string {
  return `${prefix}_${KSUID.randomSync().string}`;
}

export abstract class Base {
  objectID?: string;
  prefix?: PrefixType = PrefixType.Base;

  @Column({ primary: true, unique: true, type: "varchar" })
  @Index()
  hash!: string;

  @CreateDateColumn({ name: "created_at" })
  @Index()
  createdAt: Date = new Date();

  @UpdateDateColumn({ name: "updated_at" })
  @Index()
  updatedAt: Date = new Date();

  @BeforeInsert()
  private generateHash() {
    if (!this.hash) {
      this.hash = generateSid(this.prefix || PrefixType.Base);
    }
    this.prefix = undefined;
    delete this.objectID;
  }

  @BeforeUpdate()
  private cleanFields() {
    delete this.prefix;
    delete this.objectID;
  }

  @AfterLoad()
  public assignObjectId() {
    this.objectID = this.hash;
  }

  constructor(prefix: PrefixType = PrefixType.Base) {
    this.prefix = prefix;
  }
}
