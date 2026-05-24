import { UI } from '../core/ui.js';
import { consumeHandoff } from '../core/handoff.js';

const SAMPLE_JSON = JSON.stringify({
  name: 'Alex Carter',
  email: 'alex.carter@example.com',
  active: true,
  tags: ['owner', 'beta'],
}, null, 2);

const SAMPLE_SCHEMA = JSON.stringify({
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    active: { type: 'boolean' },
    tags: { type: 'array', items: { type: 'string' } },
  },
}, null, 2);

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validate(value, schema, path = '$', issues = []) {
  if (!schema || typeof schema !== 'object') return issues;
  const actualType = typeOf(value);
  const typeMatches = schema.type === 'integer'
    ? actualType === 'number' && Number.isInteger(value)
    : !schema.type || actualType === schema.type;
  if (schema.type && !typeMatches) {
    issues.push(`${path}: expected ${schema.type}, got ${typeOf(value)}`);
    return issues;
  }
  if (schema.enum && !schema.enum.includes(value)) issues.push(`${path}: not in enum`);
  if (schema.type === 'string') {
    if (schema.minLength && value.length < schema.minLength) issues.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength && value.length > schema.maxLength) issues.push(`${path}: longer than ${schema.maxLength}`);
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) issues.push(`${path}: does not match pattern`);
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    if (schema.minimum !== undefined && value < schema.minimum) issues.push(`${path}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) issues.push(`${path}: above maximum ${schema.maximum}`);
  }
  if (schema.type === 'array') {
    if (schema.minItems && value.length < schema.minItems) issues.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.items) value.forEach((item, index) => validate(item, schema.items, `${path}[${index}]`, issues));
  }
  if (schema.type === 'object') {
    (schema.required || []).forEach(key => {
      if (!(key in value)) issues.push(`${path}.${key}: required property missing`);
    });
    Object.entries(schema.properties || {}).forEach(([key, childSchema]) => {
      if (key in value) validate(value[key], childSchema, `${path}.${key}`, issues);
    });
    if (schema.additionalProperties === false) {
      Object.keys(value).forEach(key => {
        if (!schema.properties || !(key in schema.properties)) issues.push(`${path}.${key}: additional property not allowed`);
      });
    }
  }
  return issues;
}

export default {
  init() {
    const jsonEl = document.getElementById('jsv-json');
    const schemaEl = document.getElementById('jsv-schema');
    const statusEl = document.getElementById('jsv-status');
    const countEl = document.getElementById('jsv-count');
    const resultsEl = document.getElementById('jsv-results');
    const handoff = consumeHandoff('json-schema-validator');
    if (handoff?.value) jsonEl.value = handoff.value;

    const render = (issues) => {
      statusEl.textContent = issues.length ? 'Invalid' : 'Valid';
      statusEl.className = issues.length ? 'status-error' : '';
      countEl.textContent = issues.length.toLocaleString();
      resultsEl.innerHTML = issues.length
        ? issues.map(issue => `<div class="seo-result-row"><strong>${issue}</strong></div>`).join('')
        : '<div class="seo-result-row"><strong>No schema issues found.</strong></div>';
    };

    document.getElementById('btn-jsv-validate').onclick = () => {
      try {
        render(validate(JSON.parse(jsonEl.value), JSON.parse(schemaEl.value)));
      } catch (error) {
        render([error.message]);
      }
    };
    document.getElementById('btn-jsv-sample').onclick = () => {
      jsonEl.value = SAMPLE_JSON;
      schemaEl.value = SAMPLE_SCHEMA;
      document.getElementById('btn-jsv-validate').click();
    };
    document.getElementById('btn-jsv-clear').onclick = () => {
      jsonEl.value = '';
      schemaEl.value = '';
      statusEl.textContent = 'Idle';
      statusEl.className = '';
      countEl.textContent = '0';
      resultsEl.innerHTML = '';
    };
    if (handoff?.value && !schemaEl.value) schemaEl.value = SAMPLE_SCHEMA;
  },
};
