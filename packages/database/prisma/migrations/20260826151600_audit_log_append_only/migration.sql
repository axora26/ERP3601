-- Enforce append-only AuditLog at the database level, independent of the
-- application layer: no calling code path (API, script, direct psql
-- session) can UPDATE or DELETE an audit row.
CREATE OR REPLACE FUNCTION reject_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog rows are append-only and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update
BEFORE UPDATE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION reject_audit_log_mutation();

CREATE TRIGGER audit_log_no_delete
BEFORE DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION reject_audit_log_mutation();
