# ObjectStack Security Model: The "Defense in Depth" Architecture

ObjectStack adopts the **"Salesforce-style"** metadata-driven security model. This is chosen over the Microsoft (Dataverse) model for its superior granularity and decoupling, which is essential for complex enterprise scenarios.

## 1. Comparison of Major Models

| Layer | ObjectStack / Salesforce | Microsoft Dataverse (Dynamics) | Why we chose ObjectStack's way? |
| :--- | :--- | :--- | :--- |
| **Who is this?** | **User + Identity** | User + Azure AD | Standard OIDC/SAML integration. |
| **What can they do?**<br>(Functionality) | **Permission Set / Profile**<br>*(Boolean Flags)* | **Security Role**<br>*(The "Matrix" of Dots)* | Decoupling functional rights (e.g., "Export Data") from data scope allows more flexible assignment. |
| **Where do they sit?**<br>(Hierarchy) | **Role**<br>*(Reporting Line)* | **Business Unit**<br>*(Department Tree)* | "Role" implies logical reporting (VP can see Manager), whereas "BU" implies rigid department silos. |
| **What data can they see?**<br>(Visibility) | **Sharing Rules**<br>*(Criteria & Ownership)* | **Access Teams**<br>*(Ad-hoc)* | **Sharing Rules** are the "Killer Feature". They allow logic like "Share Deal > 1M with Finance", which Microsoft's static hierarchy cannot easily express. |
| **Super Access** | **View All / Modify All** | **Organization Level** (Green Dot) | Separating "Super Access" from standard "Read" prevents accidental data leaks. |

## 2. The Protocols

### A. Functional permissions (`src/data/permission.zod.ts`)
Defines the **Baseline**.
*   If `allowRead = false`, the user cannot see *any* record, regardless of sharing.
*   If `allowRead = true`, the user can see *their own* records (Ownership).

### B. Structural Hierarchy (`src/system/role.zod.ts`)
Defines the **Reporting Line**.
*   A user is assigned to one Role (e.g., "Sales Manager").
*   **Automatic Inheritance**: The "Sales Manager" implicitly sees data owned by "Sales Rep".
*   *Note: This is closest to Microsoft's "Business Unit" concept.*

### C. Data Access Scope (`src/data/sharing.zod.ts`)
Defines the **Expansion**.
*   We start with "Private" (OWD).
*   We expand access via **Sharing Rules**.
    *   **Criteria-based**: "If Status = 'Published', share with All Internal Users."
    *   **Owner-based**: "Share 'Western Region' records with 'Western VP'."

## 3. Terminology Map

If you are coming from the Microsoft/Dynamics ecosystem:

*   **Security Role (User Level)** -> `allowRead: true`
*   **Security Role (BU Level)** -> `allowRead: true` + `Sharing Rule (Share with Role)`
*   **Security Role (Org Level)** -> `viewAllRecords: true`
*   **Business Unit** -> `Role` (Functional) / `OrgUnit` (Physical)

## 4. The Chinese Enterprise Extension (中国企业适配)

In the context of Chinese enterprises, the hierarchy is often strictly defined by **legal entities and departments** (Organization), which is distinct from the **reporting line** (Role).

*   **OrgUnit (组织机构)**: `src/system/org_unit.zod.ts`
    *   **Group (集团)**
    *   **Company (分公司)**
    *   **Department (部门)**
*   **Role (角色)**: `src/system/role.zod.ts`
    *   Defines titles regardless of department (e.g., "Department Manager", "Accountant").

**Example Assignment:**
*   User: "Zhang San"
*   OrgUnit: "Shanghai Branch / Sales Dept"
*   Role: "Sales Manager"

The **Sharing Engine** can then support rules like:
> "Share records owned by [Shanghai Branch] with [Headquarters Audit Role]."

