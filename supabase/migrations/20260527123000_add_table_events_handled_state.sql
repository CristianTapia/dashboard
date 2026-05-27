alter table public.table_events
  add column if not exists handled_at timestamptz,
  add column if not exists handled_by uuid references auth.users(id) on delete set null;

create index if not exists table_events_tenant_unhandled_attention_idx
  on public.table_events (tenant_id, table_id, created_at desc)
  where handled_at is null
    and event_type in (
      'service',
      'waiter',
      'call_waiter',
      'call_server',
      'waiter_call',
      'service_request',
      'bill',
      'account',
      'check',
      'request_bill',
      'bill_request'
    );
