/*
  # Fix Security Issues

  1. Dropped Indexes
    - `idx_frame_data_session_id` on `frame_data` - unused, redundant with foreign key
    - `idx_frame_data_driver_label` on `frame_data` - unused composite index
    - `idx_comparison_results_session_id` on `comparison_results` - unused

  2. Security Changes
    - Replaced overly permissive `Allow anonymous insert telemetry sessions` policy
      with a restricted version that only allows inserts where session_name is not empty
      and driver file names are constrained to reasonable length, preventing abuse

  3. Notes
    - The Auth DB connection strategy is a project-level setting and cannot be changed via migration
*/

DROP INDEX IF EXISTS idx_frame_data_session_id;
DROP INDEX IF EXISTS idx_frame_data_driver_label;
DROP INDEX IF EXISTS idx_comparison_results_session_id;

DROP POLICY IF EXISTS "Allow anonymous insert telemetry sessions" ON telemetry_sessions;

CREATE POLICY "Anon can insert sessions with valid data"
  ON telemetry_sessions
  FOR INSERT
  TO anon
  WITH CHECK (
    session_name IS NOT NULL
    AND length(session_name) > 0
    AND length(session_name) <= 500
    AND length(driver_a_name) <= 500
    AND length(driver_b_name) <= 500
  );
