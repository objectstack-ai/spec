# create-objectstack

Scaffold a new [ObjectStack](https://objectstack.com) project in seconds.

## Usage

```bash
# Interactive — creates project in a new directory
npx create-objectstack my-app

# Use a specific template
npx create-objectstack my-app --template full-stack

# Scaffold in the current directory
npx create-objectstack

# Skip automatic dependency installation
npx create-objectstack my-app --skip-install
```

## Templates

| Template | Description |
| --- | --- |
| `minimal-api` *(default)* | Server + memory driver + 1 object + REST API |
| `full-stack` | Server + UI + auth + 3 CRM objects (Contact, Company, Deal) |
| `plugin` | Reusable plugin skeleton with test setup |

## Options

| Option | Description |
| --- | --- |
| `[name]` | Project name (defaults to current directory name) |
| `-t, --template <name>` | Project template (default: `minimal-api`) |
| `--skip-install` | Skip dependency installation |
| `-V, --version` | Show version |
| `-h, --help` | Show help |

## What Gets Generated

### minimal-api

```
my-app/
├── objectstack.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── src/
    └── objects/
        ├── index.ts
        └── task.ts
```

### full-stack

```
my-app/
├── objectstack.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── src/
    ├── objects/
    │   ├── index.ts
    │   ├── contact.ts
    │   ├── company.ts
    │   └── deal.ts
    ├── views/
    │   ├── contact_list.ts
    │   ├── company_list.ts
    │   └── deal_list.ts
    └── apps/
        ├── index.ts
        └── crm.ts
```

### plugin

```
my-plugin/
├── objectstack.config.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── src/
│   ├── index.ts
│   └── objects/
│       ├── index.ts
│       └── sample.ts
└── test/
    └── sample.test.ts
```

## License

Apache-2.0
