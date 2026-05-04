import { addColumns, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: "investments",
          columns: [
            { name: "exchange", type: "string", isOptional: true },
            { name: "currency", type: "string", isOptional: true },
          ],
        }),
      ],
    },
  ],
});
