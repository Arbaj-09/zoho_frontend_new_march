import { backendApi } from "@/services/api";

export const CRM_FIELD_ENTITY = {
  product: {
    definitionEndpoint: "/product-fields",
    valuesEndpoint: (id) => `/products/${id}/fields`,
  },
  bank: {
    definitionEndpoint: "/bank-fields",
    valuesEndpoint: (id) => `/banks/${id}/fields`,
  },
  deal: {
    definitionEndpoint: "/deal-fields",
    valuesEndpoint: (id) => `/deals/${id}/fields`,
  },
};

export async function fetchFieldDefinitions(entityType) {
  const cfg = CRM_FIELD_ENTITY[entityType];
  if (!cfg) throw new Error(`Unknown entityType: ${entityType}`);
  return backendApi.get(cfg.definitionEndpoint);
}

export async function createFieldDefinition(entityType, payload) {
  const cfg = CRM_FIELD_ENTITY[entityType];
  if (!cfg) throw new Error(`Unknown entityType: ${entityType}`);
  return backendApi.post(cfg.definitionEndpoint, payload);
}

export async function updateFieldDefinition(entityType, id, payload) {
  const cfg = CRM_FIELD_ENTITY[entityType];
  if (!cfg) throw new Error(`Unknown entityType: ${entityType}`);
  return backendApi.put(`${cfg.definitionEndpoint}/${id}`, payload);
}

export async function deleteFieldDefinition(entityType, id) {
  const cfg = CRM_FIELD_ENTITY[entityType];
  if (!cfg) throw new Error(`Unknown entityType: ${entityType}`);
  return backendApi.delete(`${cfg.definitionEndpoint}/${id}`);
}

export async function fetchFieldValues(entityType, recordId) {
  const cfg = CRM_FIELD_ENTITY[entityType];
  if (!cfg) throw new Error(`Unknown entityType: ${entityType}`);
  return backendApi.get(cfg.valuesEndpoint(recordId));
}

export async function upsertFieldValue(entityType, recordId, fieldKey, value) {
  const cfg = CRM_FIELD_ENTITY[entityType];
  if (!cfg) throw new Error(`Unknown entityType: ${entityType}`);
  return backendApi.post(cfg.valuesEndpoint(recordId), {
    fieldKey,
    value: value == null ? "" : String(value),
  });
}

export function normalizeDefinitions(defs) {
  const list = Array.isArray(defs?.content) ? defs.content : Array.isArray(defs) ? defs : [];
  return list
    .filter((d) => d && d.fieldKey)
    .map((d) => ({
      id: d.id,
      fieldName: d.fieldName || d.fieldKey,
      fieldKey: d.fieldKey,
      fieldType: String(d.fieldType || "TEXT").toUpperCase(),
      required: Boolean(d.required),
      active: d.active !== false,
      optionsJson: Array.isArray(d.optionsJson) ? d.optionsJson : [],
    }));
}

export function normalizeValues(values) {
  const list = Array.isArray(values?.content) ? values.content : Array.isArray(values) ? values : [];
  // Values returned are entities: { id, fieldDefinition: { fieldKey }, value }
  const map = {};
  for (const v of list) {
    const key = v?.fieldDefinition?.fieldKey;
    if (!key) continue;
    map[key] = v?.value ?? "";
  }
  return map;
}
