-- Laporan untuk banyak project dengan filter tanggal
WITH project_details AS (
  SELECT
    p.id AS project_id,
    p.project_name,
    p.budget AS project_budget,
    f.id AS farm_id,
    f.farm_name,
    f.farm_status,
    f.soil_type,
    f.farm_budget,
    COALESCE(f.total_harvest, 0) AS total_harvest,
    COALESCE(f.product_price, 0) * COALESCE(f.total_harvest, 0) AS total_revenue
  FROM "Project" p 
  JOIN "Farm" f ON p.id = f.project_id
  WHERE p.user_id = $1
    AND p.start_date >= $2
    AND p.target_date <= $3
),
project_summary AS (
  SELECT
    project_id,
    project_name,
    project_budget,
    SUM(farm_budget) AS total_farm_budget,
    AVG(farm_budget) AS average_farm_budget,
    SUM(total_harvest) AS total_harvest,
    SUM(total_revenue) AS total_revenue,
    COUNT(farm_id) AS total_farms
  FROM project_details
  GROUP BY project_id, project_name, project_budget
)
SELECT
  'PROJECT_SUMMARY' AS row_type,
  project_id,
  project_name,
  project_budget,
  total_farm_budget,
  average_farm_budget,
  total_harvest,
  total_revenue,
  total_farms,
  NULL AS farm_id,
  NULL AS farm_name,
  NULL AS farm_status,
  NULL AS soil_type,
  NULL AS farm_budget_individual,
  NULL AS farm_harvest,
  NULL AS farm_revenue
FROM project_summary
UNION ALL
SELECT
  'FARM_DETAIL' AS row_type,
  project_id,
  project_name,
  project_budget,
  NULL AS total_farm_budget,
  NULL AS average_farm_budget,
  NULL AS total_harvest,
  NULL AS total_revenue,
  NULL AS total_farms,
  farm_id,
  farm_name,
  farm_status,
  soil_type,
  farm_budget AS farm_budget_individual,
  total_harvest AS farm_harvest,
  total_revenue AS farm_revenue
FROM project_details
ORDER BY project_name, row_type DESC;