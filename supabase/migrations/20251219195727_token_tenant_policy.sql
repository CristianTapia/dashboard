create policy "tenant_isolation" on categories
  for all using (tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenantId')::uuid);
