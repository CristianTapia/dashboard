import "server-only";

import { createAdmin } from "@/app/lib/supabase";

type ActiveTableSessionRow = {
  session_id: string;
};

type RestaurantTableTenantRow = {
  id: string;
  tenant_id: string;
};

type JoinableRestaurantTableRow = {
  id: string;
  tenant_id: string;
  name: string | null;
  number: string | null;
  salon: string | null;
  active: boolean;
};

type ActiveJoinedTableRow = {
  table_id: string;
};

type ActiveTableSessionMembershipRow = {
  session_id: string;
  table_id: string;
  joined_at: string;
};

export type TableSession = {
  id: string;
  tenant_id: string;
  primary_table_id: string | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  opened_by: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JoinableRestaurantTable = {
  id: string;
  tenant_id: string;
  label: string;
  name: string | null;
  number: string | null;
  salon: string;
};

export type ActiveJoinedTableSession = TableSession & {
  tables: JoinableRestaurantTable[];
};

function normalizeTableIds(tableIds: string[]) {
  return Array.from(new Set(tableIds.map((tableId) => tableId.trim()).filter(Boolean)));
}

function buildTableLabel(table: Pick<JoinableRestaurantTableRow, "name" | "number">) {
  if (table.name?.trim()) return table.name.trim();
  if (table.number?.trim()) return `Mesa ${table.number.trim()}`;
  return "Mesa";
}

export async function resolveActiveTableSessionId(input: {
  tenantId: string;
  tableId: string;
}) {
  const db = createAdmin();

  const { data, error } = await db
    .from("table_session_tables")
    .select("session_id")
    .eq("tenant_id", input.tenantId)
    .eq("table_id", input.tableId)
    .is("left_at", null)
    .maybeSingle<ActiveTableSessionRow>();

  if (error) throw new Error(error.message);

  return data?.session_id ?? null;
}

export async function listJoinableRestaurantTables(tenantId: string): Promise<JoinableRestaurantTable[]> {
  const db = createAdmin();

  const [
    { data: tablesData, error: tablesError },
    { data: joinedTablesData, error: joinedTablesError },
  ] = await Promise.all([
    db
      .from("restaurant_tables")
      .select("id,tenant_id,name,number,salon,active")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .order("salon", { ascending: true })
      .order("number", { ascending: true }),
    db
      .from("table_session_tables")
      .select("table_id")
      .eq("tenant_id", tenantId)
      .is("left_at", null),
  ]);

  if (tablesError) throw new Error(tablesError.message);
  if (joinedTablesError) throw new Error(joinedTablesError.message);

  const joinedTableIds = new Set(((joinedTablesData ?? []) as ActiveJoinedTableRow[]).map((row) => row.table_id));

  return ((tablesData ?? []) as JoinableRestaurantTableRow[])
    .filter((table) => !joinedTableIds.has(table.id))
    .map((table) => ({
      id: table.id,
      tenant_id: table.tenant_id,
      label: buildTableLabel(table),
      name: table.name,
      number: table.number,
      salon: table.salon?.trim() || "Salon 1",
    }));
}

export async function listActiveJoinedTableSessions(tenantId: string): Promise<ActiveJoinedTableSession[]> {
  const db = createAdmin();

  const { data: sessionsData, error: sessionsError } = await db
    .from("table_sessions")
    .select("id,tenant_id,primary_table_id,status,opened_at,closed_at,opened_by,closed_by,created_at,updated_at")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("opened_at", { ascending: false });

  if (sessionsError) throw new Error(sessionsError.message);

  const sessions = (sessionsData ?? []) as TableSession[];
  if (sessions.length === 0) return [];

  const sessionIds = sessions.map((session) => session.id);
  const { data: membershipData, error: membershipError } = await db
    .from("table_session_tables")
    .select("session_id,table_id,joined_at")
    .eq("tenant_id", tenantId)
    .in("session_id", sessionIds)
    .is("left_at", null)
    .order("joined_at", { ascending: true });

  if (membershipError) throw new Error(membershipError.message);

  const memberships = (membershipData ?? []) as ActiveTableSessionMembershipRow[];
  const tableIds = Array.from(new Set(memberships.map((membership) => membership.table_id)));
  if (tableIds.length === 0) {
    return sessions.map((session) => ({ ...session, tables: [] }));
  }

  const { data: tablesData, error: tablesError } = await db
    .from("restaurant_tables")
    .select("id,tenant_id,name,number,salon,active")
    .eq("tenant_id", tenantId)
    .in("id", tableIds);

  if (tablesError) throw new Error(tablesError.message);

  const tablesById = new Map(
    ((tablesData ?? []) as JoinableRestaurantTableRow[]).map((table) => [
      table.id,
      {
        id: table.id,
        tenant_id: table.tenant_id,
        label: buildTableLabel(table),
        name: table.name,
        number: table.number,
        salon: table.salon?.trim() || "Salon 1",
      },
    ]),
  );

  const tableIdsBySession = new Map<string, string[]>();
  for (const membership of memberships) {
    tableIdsBySession.set(membership.session_id, [
      ...(tableIdsBySession.get(membership.session_id) ?? []),
      membership.table_id,
    ]);
  }

  return sessions.map((session) => {
    const sessionTableIds = tableIdsBySession.get(session.id) ?? [];
    const tables = sessionTableIds
      .map((tableId) => tablesById.get(tableId))
      .filter((table): table is JoinableRestaurantTable => Boolean(table))
      .sort((a, b) => {
        if (a.id === session.primary_table_id) return -1;
        if (b.id === session.primary_table_id) return 1;
        return a.label.localeCompare(b.label, undefined, { numeric: true });
      });

    return {
      ...session,
      tables,
    };
  });
}

export async function createJoinedTableSession(input: {
  tenantId: string;
  tableIds: string[];
}) {
  const tableIds = normalizeTableIds(input.tableIds);
  if (tableIds.length < 2) {
    throw new Error("Debes seleccionar al menos 2 mesas para unir");
  }

  const db = createAdmin();

  const { data: tablesData, error: tablesError } = await db
    .from("restaurant_tables")
    .select("id,tenant_id")
    .in("id", tableIds);

  if (tablesError) throw new Error(tablesError.message);

  const tables = (tablesData ?? []) as RestaurantTableTenantRow[];
  if (tables.length !== tableIds.length) {
    throw new Error("Una o mas mesas no existen");
  }

  const invalidTenantTable = tables.find((table) => table.tenant_id !== input.tenantId);
  if (invalidTenantTable) {
    throw new Error("Todas las mesas deben pertenecer al mismo tenant");
  }

  const { data: activeSessionsData, error: activeSessionsError } = await db
    .from("table_session_tables")
    .select("table_id,session_id")
    .eq("tenant_id", input.tenantId)
    .in("table_id", tableIds)
    .is("left_at", null);

  if (activeSessionsError) throw new Error(activeSessionsError.message);

  if ((activeSessionsData ?? []).length > 0) {
    throw new Error("Una o mas mesas ya tienen una sesion activa");
  }

  const { data: session, error: sessionError } = await db
    .from("table_sessions")
    .insert({
      tenant_id: input.tenantId,
      status: "active",
      primary_table_id: tableIds[0],
    })
    .select("id,tenant_id,primary_table_id,status,opened_at,closed_at,opened_by,closed_by,created_at,updated_at")
    .single<TableSession>();

  if (sessionError) throw new Error(sessionError.message);

  const { error: sessionTablesError } = await db.from("table_session_tables").insert(
    tableIds.map((tableId) => ({
      tenant_id: input.tenantId,
      session_id: session.id,
      table_id: tableId,
    })),
  );

  if (sessionTablesError) throw new Error(sessionTablesError.message);

  return session;
}

export async function closeTableSession(input: {
  tenantId: string;
  sessionId: string;
}) {
  const db = createAdmin();

  const { data: existingSession, error: existingSessionError } = await db
    .from("table_sessions")
    .select("id,tenant_id,status")
    .eq("id", input.sessionId)
    .eq("tenant_id", input.tenantId)
    .maybeSingle<Pick<TableSession, "id" | "tenant_id" | "status">>();

  if (existingSessionError) throw new Error(existingSessionError.message);
  if (!existingSession) throw new Error("Sesion no encontrada");
  if (existingSession.status !== "active") {
    throw new Error("La sesion no esta activa");
  }

  const closedAt = new Date().toISOString();

  const { data: closedSession, error: closeSessionError } = await db
    .from("table_sessions")
    .update({
      status: "closed",
      closed_at: closedAt,
    })
    .eq("id", input.sessionId)
    .eq("tenant_id", input.tenantId)
    .eq("status", "active")
    .select("id,tenant_id,primary_table_id,status,opened_at,closed_at,opened_by,closed_by,created_at,updated_at")
    .single<TableSession>();

  if (closeSessionError) throw new Error(closeSessionError.message);

  const { error: closeSessionTablesError } = await db
    .from("table_session_tables")
    .update({ left_at: closedAt })
    .eq("tenant_id", input.tenantId)
    .eq("session_id", input.sessionId)
    .is("left_at", null);

  if (closeSessionTablesError) throw new Error(closeSessionTablesError.message);

  return closedSession;
}
