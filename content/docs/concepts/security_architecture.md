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
*   **Business Unit** -> `Role` (Functional Hierarchy)

## 4. Advanced: Matrix Management (Territory Management)

For large global enterprises where a single reporting line ("Role") is insufficient, ObjectStack implements the **Territory Management** protocol (`src/system/territory.zod.ts`).

This solves the "Matrix Organization" problem without breaking the strict Role hierarchy.

*   **Role Hierarchy (HR/Reporting)**: "Who reports to whom?" (Stable)
    *   Example: A Sales Rep reports to a Sales Manager.
*   **Territory Hierarchy (Market/Revenue)**: "Who owns which market?" (Flexible, Multi-assignment)
    *   Example: A Sales Rep might be assigned to both "West Coast (Geo)" and "Healthcare (Industry)".

**How it works:**
1.  **Accounts/Deals** are assigned to **Territories** based on rules (e.g., `State = 'CA'`).
2.  **Users** are assigned to **Territories**.
3.  Users gain access to records in their Territories, *regardless* of their Role.

This aligns with best practices from **Salesforce Enterprise Territory Management** and **Oracle Sales Cloud**.


