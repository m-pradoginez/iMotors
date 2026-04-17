import * as dotenv from "dotenv";
import { query } from "./src/db/connection";
import { tcoCalculator } from "./src/tco/tcoCalculator";

dotenv.config();

async function run() {
  const result = await query("SELECT * FROM vehicles_unified WHERE price IS NOT NULL AND city_km_l IS NOT NULL LIMIT 1");
  const row = result.rows[0];
  console.log("DB row:", row);

  if (row) {
    const input = {
      vehicle: {
        fipe_code: row.fipe_code,
        price: row.price,
        category: row.category,
        fuel_type: row.fuel_type,
        city_km_l: row.city_km_l,
        highway_km_l: row.highway_km_l,
      },
      user: {
        budget_monthly: 2500,
        mileage_annual_km: 15000,
        city_highway_ratio: 0.6,
        state: "SP",
      },
    };
    console.log("Calculated:", tcoCalculator.calculate(input));
  }
}

run().catch(console.error).finally(() => process.exit(0));
