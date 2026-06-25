import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  dob: text("dob"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});


export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  label: text("label"),
  headcount: integer("headcount").notNull(),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").references(() => services.id),
  memberId: integer("member_id").references(() => members.id),
  status: text("status").$default(() => "absent"),
});

export const offerings = sqliteTable("offerings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").references(() => services.id),
  type: text("type").notNull(), // "general" | "seed" | "partnership"
  amount: real("amount").notNull(),
  toward: text("toward"), // only for "partnership"
  note: text("note"),
});
