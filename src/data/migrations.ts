import { addColumns, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: "assets",
          columns: [{ name: "currency", type: "string", isOptional: true }],
        }),
        addColumns({
          table: "debts",
          columns: [{ name: "currency", type: "string", isOptional: true }],
        }),
      ],
    },
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
