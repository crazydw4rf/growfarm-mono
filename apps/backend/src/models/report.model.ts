import zod from "zod/v4";

export const zGenProjectReport = zod.object({
  start_date: zod.coerce.date().default(new Date()),
  end_date: zod.coerce.date(),
});

export type GenProjectReportDto = zod.infer<typeof zGenProjectReport>;
