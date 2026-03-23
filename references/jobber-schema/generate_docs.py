#!/usr/bin/env python3
"""Generate Jobber GraphQL schema reference docs from introspection data."""

import json
import re
from collections import defaultdict
from pathlib import Path

SCHEMA_FILE = Path(__file__).parent / "schema.json"
OUT_DIR = Path(__file__).parent

def load_schema():
    with open(SCHEMA_FILE) as f:
        data = json.load(f)
    return data["data"]["__schema"]

def type_ref_str(t):
    """Convert a TypeRef to a readable string."""
    if t is None:
        return "Unknown"
    if t["kind"] == "NON_NULL":
        return type_ref_str(t["ofType"]) + "!"
    if t["kind"] == "LIST":
        return "[" + type_ref_str(t["ofType"]) + "]"
    return t["name"]

def get_type_map(schema):
    return {t["name"]: t for t in schema["types"]}

def args_str(args):
    if not args:
        return ""
    parts = []
    for a in args:
        required = type_ref_str(a["type"]).endswith("!")
        default = f" = {a['defaultValue']}" if a.get("defaultValue") else ""
        parts.append(f"{a['name']}: {type_ref_str(a['type'])}{default}")
    return "(" + ", ".join(parts) + ")"

# ─────────────────────────────────────────────────────────────────────────────
# DOMAIN MAPPING FOR MUTATIONS
# ─────────────────────────────────────────────────────────────────────────────
DOMAIN_PATTERNS = {
    "Clients": ["client", "Client"],
    "Invoices": ["invoice", "Invoice"],
    "Quotes": ["quote", "Quote"],
    "Jobs": ["job", "Job"],
    "Visits": ["visit", "Visit"],
    "Requests": ["request", "Request"],
    "Users": ["user", "User", "team"],
    "Expenses": ["expense", "Expense"],
    "Products & Services": ["product", "Product", "service", "lineItem", "LineItem", "workItem", "WorkItem"],
    "Payments": ["payment", "Payment", "payout", "Payout", "bankAccount", "BankAccount", "card", "Card"],
    "Tax Rates": ["tax", "Tax"],
    "Equipment": ["equipment", "Equipment"],
    "Time Sheets": ["timeSheet", "TimeSheet", "timeEntry", "TimeEntry"],
    "Custom Fields": ["customField", "CustomField"],
    "Properties": ["property", "Property"],
    "Notifications": ["notification", "Notification"],
    "Tags": ["tag", "Tag"],
    "Messages": ["message", "Message", "email", "Email"],
    "Scheduling": ["schedule", "Schedule", "appointment", "Appointment"],
    "Attachments": ["attachment", "Attachment", "photo", "Photo"],
    "Account": ["account", "Account", "setting", "Setting"],
}

def get_domain(name):
    for domain, patterns in DOMAIN_PATTERNS.items():
        for p in patterns:
            if p in name:
                return domain
    return "Other"

# ─────────────────────────────────────────────────────────────────────────────
# SCOPE INFERENCE
# ─────────────────────────────────────────────────────────────────────────────
SCOPE_MAP = {
    "Clients": "write_clients",
    "Invoices": "write_invoices",
    "Quotes": "write_quotes",
    "Jobs": "write_jobs",
    "Visits": "write_scheduled_items",
    "Requests": "write_requests",
    "Users": "write_users",
    "Expenses": "write_expenses",
    "Products & Services": "write_products_services",
    "Payments": "write_jobber_payments",
    "Tax Rates": "write_tax_rates",
    "Equipment": "write_equipment",
    "Time Sheets": "write_time_sheets",
    "Custom Fields": "write_custom_field_configurations",
    "Properties": "write_clients",
    "Notifications": "write_notifications",
    "Tags": "write_tags",
    "Messages": "write_messages",
    "Scheduling": "write_scheduled_items",
    "Attachments": "write_attachments",
    "Account": "write_account_settings",
    "Other": "unknown",
}

CURRENT_SCOPES = {
    "read_clients", "read_requests", "read_quotes", "read_jobs",
    "read_scheduled_items", "read_invoices", "read_jobber_payments",
    "read_users", "write_tax_rates", "read_equipment", "read_expenses",
    "read_custom_field_configurations", "read_time_sheets"
}

def write_queries(schema):
    query_type = next(t for t in schema["types"] if t["name"] == "Query")
    fields = sorted(query_type["fields"], key=lambda f: f["name"])

    lines = ["# Jobber GraphQL — Queries Reference\n",
             f"Total: {len(fields)} root query fields\n",
             "_All queries require appropriate read_* scope._\n",
             "---\n"]

    for f in fields:
        rt = type_ref_str(f["type"])
        a = args_str(f.get("args", []))
        lines.append(f"## `{f['name']}{a}`\n")
        lines.append(f"**Returns:** `{rt}`\n")
        if f.get("description"):
            lines.append(f"\n{f['description']}\n")
        if f.get("args"):
            lines.append("\n**Arguments:**\n")
            for arg in f["args"]:
                req = "**required**" if type_ref_str(arg["type"]).endswith("!") else "optional"
                desc = f" — {arg['description']}" if arg.get("description") else ""
                default = f" (default: `{arg['defaultValue']}`)" if arg.get("defaultValue") else ""
                lines.append(f"- `{arg['name']}: {type_ref_str(arg['type'])}` ({req}){default}{desc}\n")
        if f.get("isDeprecated"):
            lines.append(f"\n> ⚠️ **Deprecated:** {f.get('deprecationReason', '')}\n")
        lines.append("\n---\n")

    with open(OUT_DIR / "queries.md", "w") as fh:
        fh.write("".join(lines))
    print(f"queries.md: {len(fields)} fields")

def write_mutations(schema):
    mutation_type = next(t for t in schema["types"] if t["name"] == "Mutation")
    fields = mutation_type["fields"]

    by_domain = defaultdict(list)
    for f in fields:
        domain = get_domain(f["name"])
        by_domain[domain].append(f)

    lines = ["# Jobber GraphQL — Mutations Reference\n",
             f"Total: {len(fields)} mutations\n",
             "\n## Current Write Scopes\n",
             "Only `write_tax_rates` is currently active. All other mutations require additional write scopes.\n",
             "\n## Domains\n"]

    for domain in sorted(by_domain.keys()):
        count = len(by_domain[domain])
        scope = SCOPE_MAP.get(domain, "unknown")
        lines.append(f"- [{domain}](#{domain.lower().replace(' ', '-').replace('&', '').replace('--', '-')}) ({count} mutations) — scope: `{scope}`\n")

    lines.append("\n---\n")

    for domain in sorted(by_domain.keys()):
        scope = SCOPE_MAP.get(domain, "unknown")
        can_use = scope in CURRENT_SCOPES
        scope_status = "✅ available" if can_use else "🔒 requires additional scope"
        lines.append(f"\n## {domain}\n")
        lines.append(f"**Required scope:** `{scope}` — {scope_status}\n\n")

        for f in sorted(by_domain[domain], key=lambda x: x["name"]):
            rt = type_ref_str(f["type"])
            lines.append(f"### `{f['name']}`\n")
            lines.append(f"**Returns:** `{rt}`\n")
            if f.get("description"):
                lines.append(f"\n{f['description']}\n")
            if f.get("args"):
                lines.append("\n**Input Arguments:**\n")
                for arg in f["args"]:
                    req = "**required**" if type_ref_str(arg["type"]).endswith("!") else "optional"
                    desc = f" — {arg['description']}" if arg.get("description") else ""
                    default = f" (default: `{arg['defaultValue']}`)" if arg.get("defaultValue") else ""
                    lines.append(f"- `{arg['name']}: {type_ref_str(arg['type'])}` ({req}){default}{desc}\n")
            if f.get("isDeprecated"):
                lines.append(f"\n> ⚠️ **Deprecated:** {f.get('deprecationReason', '')}\n")
            lines.append("\n")

        lines.append("---\n")

    with open(OUT_DIR / "mutations.md", "w") as fh:
        fh.write("".join(lines))
    print(f"mutations.md: {len(fields)} mutations across {len(by_domain)} domains")

def write_types(schema):
    types = [t for t in schema["types"]
             if t["kind"] == "OBJECT"
             and not t["name"].startswith("__")
             and t["name"] not in ("Query", "Mutation", "Subscription")]

    types.sort(key=lambda t: t["name"])
    lines = ["# Jobber GraphQL — Object Types Reference\n",
             f"Total: {len(types)} object types\n",
             "---\n"]

    for t in types:
        lines.append(f"\n## `{t['name']}`\n")
        if t.get("description"):
            lines.append(f"\n{t['description']}\n")
        if t.get("interfaces"):
            ifaces = ", ".join(f"`{i['name']}`" for i in t["interfaces"])
            lines.append(f"\n**Implements:** {ifaces}\n")
        if t.get("fields"):
            lines.append("\n**Fields:**\n")
            for f in t["fields"]:
                ft = type_ref_str(f["type"])
                desc = f" — {f['description']}" if f.get("description") else ""
                dep = " ⚠️ *deprecated*" if f.get("isDeprecated") else ""
                lines.append(f"| `{f['name']}` | `{ft}` |{dep}{desc} |\n")
            # Replace inline table header
            lines.insert(-len(t["fields"]), "| Field | Type | Notes |\n|-------|------|-------|\n")
        lines.append("\n---\n")

    with open(OUT_DIR / "types.md", "w") as fh:
        fh.write("".join(lines))
    print(f"types.md: {len(types)} object types")

def write_enums(schema):
    enums = [t for t in schema["types"]
             if t["kind"] == "ENUM" and not t["name"].startswith("__")]
    enums.sort(key=lambda t: t["name"])

    lines = ["# Jobber GraphQL — Enums Reference\n",
             f"Total: {len(enums)} enum types\n",
             "---\n"]

    for t in enums:
        lines.append(f"\n## `{t['name']}`\n")
        if t.get("description"):
            lines.append(f"\n{t['description']}\n")
        if t.get("enumValues"):
            lines.append("\n**Values:**\n")
            for v in t["enumValues"]:
                desc = f" — {v['description']}" if v.get("description") else ""
                dep = " ⚠️ *deprecated*" if v.get("isDeprecated") else ""
                lines.append(f"- `{v['name']}`{dep}{desc}\n")
        lines.append("\n---\n")

    with open(OUT_DIR / "enums.md", "w") as fh:
        fh.write("".join(lines))
    print(f"enums.md: {len(enums)} enum types")

def write_inputs(schema):
    inputs = [t for t in schema["types"]
              if t["kind"] == "INPUT_OBJECT" and not t["name"].startswith("__")]
    inputs.sort(key=lambda t: t["name"])

    lines = ["# Jobber GraphQL — Input Types Reference\n",
             f"Total: {len(inputs)} input object types\n",
             "---\n"]

    for t in inputs:
        lines.append(f"\n## `{t['name']}`\n")
        if t.get("description"):
            lines.append(f"\n{t['description']}\n")
        if t.get("inputFields"):
            lines.append("\n**Fields:**\n")
            for f in t["inputFields"]:
                ft = type_ref_str(f["type"])
                req = "**required**" if ft.endswith("!") else "optional"
                desc = f" — {f['description']}" if f.get("description") else ""
                default = f" (default: `{f['defaultValue']}`)" if f.get("defaultValue") else ""
                lines.append(f"- `{f['name']}: {ft}` ({req}){default}{desc}\n")
        lines.append("\n---\n")

    with open(OUT_DIR / "inputs.md", "w") as fh:
        fh.write("".join(lines))
    print(f"inputs.md: {len(inputs)} input types")

def write_connections(schema):
    # Connection types follow the Relay pattern: SomethingConnection, SomethingEdge, PageInfo
    connections = [t for t in schema["types"]
                   if t["kind"] == "OBJECT"
                   and not t["name"].startswith("__")
                   and (t["name"].endswith("Connection") or t["name"].endswith("Edge"))]
    connections.sort(key=lambda t: t["name"])

    page_info = next((t for t in schema["types"] if t["name"] == "PageInfo"), None)

    lines = ["# Jobber GraphQL — Connection / Pagination Types\n",
             "Jobber uses the [Relay Cursor Connections](https://relay.dev/graphql/connections.htm) pattern.\n",
             "\n## Pagination Arguments\n",
             "All paginated queries accept:\n",
             "- `first: Int` — number of records from start\n",
             "- `last: Int` — number of records from end\n",
             "- `after: String` — cursor for forward pagination\n",
             "- `before: String` — cursor for backward pagination\n",
             "\n## PageInfo\n"]

    if page_info and page_info.get("fields"):
        for f in page_info["fields"]:
            lines.append(f"- `{f['name']}: {type_ref_str(f['type'])}`\n")

    lines.append(f"\n## Connection Types ({len([t for t in connections if t['name'].endswith('Connection')])})\n")

    for t in connections:
        if not t["name"].endswith("Connection"):
            continue
        lines.append(f"\n### `{t['name']}`\n")
        entity = t["name"].replace("Connection", "")
        edge_name = entity + "Edge"
        edge_type = next((et for et in connections if et["name"] == edge_name), None)

        if t.get("fields"):
            lines.append("**Fields:**\n")
            for f in t["fields"]:
                lines.append(f"- `{f['name']}: {type_ref_str(f['type'])}`\n")

        if edge_type and edge_type.get("fields"):
            lines.append(f"\n**`{edge_name}` fields:**\n")
            for f in edge_type["fields"]:
                lines.append(f"- `{f['name']}: {type_ref_str(f['type'])}`\n")
        lines.append("\n")

    with open(OUT_DIR / "connections.md", "w") as fh:
        fh.write("".join(lines))
    print(f"connections.md: {len([t for t in connections if t['name'].endswith('Connection')])} connection types")

def write_overview(schema):
    type_map = get_type_map(schema)

    types_by_kind = defaultdict(list)
    for t in schema["types"]:
        if not t["name"].startswith("__"):
            types_by_kind[t["kind"]].append(t)

    query_type = type_map["Query"]
    mutation_type = type_map["Mutation"]

    mutation_fields = mutation_type["fields"]
    by_domain = defaultdict(list)
    for f in mutation_fields:
        domain = get_domain(f["name"])
        by_domain[domain].append(f["name"])

    # CRUD analysis
    crud = defaultdict(set)
    for f in mutation_fields:
        name = f["name"]
        if name.startswith("create") or "Create" in name:
            entity = re.sub(r"^create", "", name, flags=re.IGNORECASE)
            crud[entity].add("Create")
        elif name.startswith("update") or "Update" in name:
            entity = re.sub(r"^update", "", name, flags=re.IGNORECASE)
            crud[entity].add("Update")
        elif name.startswith("delete") or "Delete" in name or name.startswith("archive") or "Archive" in name:
            entity = re.sub(r"^(delete|archive)", "", name, flags=re.IGNORECASE)
            crud[entity].add("Delete")

    lines = ["# Jobber GraphQL API — Overview\n",
             f"**API Version:** 2025-04-16\n",
             f"**Introspection Date:** 2025-03-20\n",
             f"**Base URL:** `https://api.getjobber.com/api/graphql`\n",
             "\n## Schema Summary\n",
             f"| Category | Count |\n|----------|-------|\n",
             f"| Root Queries | {len(query_type['fields'])} |\n",
             f"| Mutations | {len(mutation_fields)} |\n",
             f"| Object Types | {len(types_by_kind['OBJECT'])} |\n",
             f"| Input Types | {len(types_by_kind['INPUT_OBJECT'])} |\n",
             f"| Enum Types | {len(types_by_kind['ENUM'])} |\n",
             f"| Interface Types | {len(types_by_kind['INTERFACE'])} |\n",
             f"| Union Types | {len(types_by_kind['UNION'])} |\n",
             f"| Scalar Types | {len(types_by_kind['SCALAR'])} |\n",
             f"| **Total Types** | **{len([t for t in schema['types'] if not t['name'].startswith('__')])}** |\n",
             "\n## Current OAuth Scopes\n",
             "```\n",
             "read_clients\n",
             "read_requests\n",
             "read_quotes\n",
             "read_jobs\n",
             "read_scheduled_items\n",
             "read_invoices\n",
             "read_jobber_payments\n",
             "read_users\n",
             "write_tax_rates          ← only write scope\n",
             "read_equipment\n",
             "read_expenses\n",
             "read_custom_field_configurations\n",
             "read_time_sheets\n",
             "```\n",
             "\n## Mutations by Domain\n",
             "| Domain | Count | Required Scope | Status |\n",
             "|--------|-------|---------------|--------|\n"]

    for domain in sorted(by_domain.keys()):
        scope = SCOPE_MAP.get(domain, "unknown")
        can_use = scope in CURRENT_SCOPES
        status = "✅" if can_use else "🔒"
        lines.append(f"| {domain} | {len(by_domain[domain])} | `{scope}` | {status} |\n")

    lines.append("\n## Read Coverage (Queries)\n")
    lines.append("| Domain | Example Queries | Scope |\n")
    lines.append("|--------|----------------|-------|\n")

    # Group queries by inferred domain
    query_domains = defaultdict(list)
    for f in query_type["fields"]:
        domain = get_domain(f["name"])
        query_domains[domain].append(f["name"])

    for domain in sorted(query_domains.keys()):
        examples = ", ".join(f"`{q}`" for q in query_domains[domain][:3])
        scope = SCOPE_MAP.get(domain, "unknown").replace("write_", "read_")
        lines.append(f"| {domain} | {examples} | `{scope}` |\n")

    lines.append("\n## What's Possible with Current Scopes\n")
    lines.append("### ✅ Read Operations (all available)\n")
    lines.append("- Clients, properties, contacts\n")
    lines.append("- Service requests\n")
    lines.append("- Quotes\n")
    lines.append("- Jobs (with line items, visits)\n")
    lines.append("- Scheduled items / visits\n")
    lines.append("- Invoices\n")
    lines.append("- Jobber Payments (payouts, transactions, bank accounts)\n")
    lines.append("- Users / team members\n")
    lines.append("- Equipment\n")
    lines.append("- Expenses\n")
    lines.append("- Custom field configurations\n")
    lines.append("- Time sheets\n")

    lines.append("\n### ✅ Write Operations (currently available)\n")
    lines.append("- `write_tax_rates` — create/update/delete tax rates\n")

    lines.append("\n### 🔒 Write Operations (require additional scopes)\n")
    for domain in sorted(by_domain.keys()):
        scope = SCOPE_MAP.get(domain, "unknown")
        if scope not in CURRENT_SCOPES and scope != "write_tax_rates":
            mutations = ", ".join(f"`{m}`" for m in by_domain[domain][:4])
            if len(by_domain[domain]) > 4:
                mutations += f" + {len(by_domain[domain])-4} more"
            lines.append(f"- `{scope}`: {mutations}\n")

    lines.append("\n## Files in this Reference\n")
    lines.append("| File | Contents |\n|------|----------|\n")
    lines.append("| [queries.md](queries.md) | All 58 root queries with args and return types |\n")
    lines.append("| [mutations.md](mutations.md) | All 99 mutations grouped by domain |\n")
    lines.append("| [types.md](types.md) | All object types with fields |\n")
    lines.append("| [enums.md](enums.md) | All enum types with values |\n")
    lines.append("| [inputs.md](inputs.md) | All input object types |\n")
    lines.append("| [connections.md](connections.md) | Relay pagination connection types |\n")
    lines.append("| [schema.json](schema.json) | Raw introspection JSON (~1MB) |\n")

    with open(OUT_DIR / "overview.md", "w") as fh:
        fh.write("".join(lines))
    print("overview.md: written")

if __name__ == "__main__":
    print("Loading schema...")
    schema = load_schema()
    print("Generating docs...")
    write_queries(schema)
    write_mutations(schema)
    write_types(schema)
    write_enums(schema)
    write_inputs(schema)
    write_connections(schema)
    write_overview(schema)
    print("Done.")
