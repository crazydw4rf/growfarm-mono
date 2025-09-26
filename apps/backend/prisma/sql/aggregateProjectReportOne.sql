-- -- Laporan untuk satu project dengan banyak lahan atau farm
-- SELECT 
--   f.total_harvest AS total_harvest,
--   f.product_price * f.total_harvest AS total_revenue,
--   f.farm_status AS farm_status,
--   f.farm_name AS farm_name,
--   f.soil_type AS soil_type
-- FROM "Project" p JOIN "Farm" f ON p.id = f.project_id
-- WHERE p.id = $1
-- GROUP BY total_harvest, farm_status, total_revenue, farm_name, soil_type;

WITH farm_details AS (
  SELECT
    f.id AS farm_id,
    f.farm_name,
    f.farm_status,
    f.soil_type,
    COALESCE(f.total_harvest, 0) AS total_harvest,
    COALESCE(f.product_price, 0) * COALESCE(f.total_harvest, 0) AS total_revenue
  FROM "Farm" f
  WHERE f.project_id = $1
)
SELECT
  'PROJECT_TOTAL' AS row_type,
  NULL AS farm_id,
  NULL AS farm_name,
  NULL AS farm_status,
  NULL AS soil_type,
  SUM(total_harvest) AS total_harvest,
  SUM(total_revenue) AS total_revenue
FROM farm_details
UNION ALL
SELECT
  'FARM_DETAIL' AS row_type,
  farm_id,
  farm_name,
  farm_status,
  soil_type,
  total_harvest,
  total_revenue
FROM farm_details;

