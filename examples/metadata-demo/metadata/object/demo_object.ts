import type { ServiceObject } from '@objectstack/spec/data';

export const metadata: ServiceObject = {
  "name": "demo_object",
  "label": "Demo Object",
  "type": "object",
  "fields": {
    "name": {
      "type": "text",
      "label": "Name",
      "required": true
    },
    "status": {
      "type": "select",
      "options": [
        "Draft",
        "Active"
      ]
    }
  },
  "description": "Updated at 2026-02-04T15:41:55.800Z"
};

export default metadata;
