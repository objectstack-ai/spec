# 🧮 ObjectStack Formula & Expression Guide

**Role:** You are the **Platform Logic Expert**.
**Goal:** Write valid expressions for Formulas, Validation Rules, and Filter Logic.
**Syntax:** Microsoft Excel / Salesforce-like syntax.

---

## 1. Where to use Formulas?

| Usage | Context (Variable) | Return Type | Example |
| :--- | :--- | :--- | :--- |
| **Formula Field** | Current Record | Any (Text, Number, Boolean) | `amount * 0.1` |
| **Validation Rule** | Current Record | Boolean (`true` = Error) | `amount < 0` |
| **Default Value** | User / Global | Value of Field Type | `NOW()` |
| **Visibility** | Record + User | Boolean (`true` = Show) | `record.status == 'new'` |

---

## 2. Syntax Basics

*   **Operators:** `+`, `-`, `*`, `/`, `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&` (AND), `||` (OR).
*   **Strings:** Use single quotes: `'Open'`.
*   **Merge Fields:**
    *   Direct access: `amount`, `status`
    *   Relationship: `account.name`, `owner.email`
    *   Global: `$user.id`, `$today`

---

## 3. Function Reference

### 🧠 Logical Functions
*   **IF(condition, true_val, false_val)**: `IF(amount > 1000, 'High', 'Low')`
*   **ISBLANK(expression)**: Checks if value is null or empty string. `ISBLANK(end_date)`
*   **ISPICKVAL(field, "value")**: Checks dropdown value. `ISPICKVAL(stage, "Closed Won")`
*   **CASE(expression, val1, result1, val2, result2, default)**: Multiple if-else.

### 🔤 Text Functions
*   **CONCAT(text1, text2, ...)** or `text1 + " " + text2`
*   **LEFT(text, num_chars)**
*   **LEN(text)**: Length of string.
*   **LOWER(text)** / **UPPER(text)**
*   **TEXT(value)**: Converts Number/Date to String.

### 🔢 Math Functions
*   **ABS(number)**: Absolute value.
*   **ROUND(number, decimals)**: `ROUND(3.14159, 2)` -> `3.14`
*   **MIN(num1, num2)** / **MAX(num1, num2)**

### 📅 Date Functions
*   **TODAY()**: Current Date.
*   **NOW()**: Current Date & Time.
*   **YEAR(date)**, **MONTH(date)**, **DAY(date)**.
*   **DATE(year, month, day)**.

---

## 4. Common Recipes

### 🛑 Validation Rules (Return TRUE to block save)

**Scenario 1: End Date must be after Start Date**
```javascript
end_date < start_date
```
*Message: "End Date cannot be earlier than Start Date."*

**Scenario 2: Phone is required if Contact Method is 'Phone'**
```javascript
ISPICKVAL(contact_method, 'Phone') && ISBLANK(phone)
```
*Message: "Please provide a phone number."*

**Scenario 3: Discount cannot exceed limit based on User Role**
```javascript
discount > 0.30 && $user.role != 'manager'
```
*Message: "Only Managers can approve discounts over 30%."*

---

### 🧪 Formula Fields

**Scenario 1: Full Name (Text)**
```javascript
first_name + " " + last_name
```

**Scenario 2: Days Open (Number)**
```javascript
IF(ISPICKVAL(status, 'Closed'), closed_date - created_date, TODAY() - created_date)
```

**Scenario 3: Priority Flag (Text/Emoji)**
```javascript
IF(amount > 100000, "🔥 High Value", "Standard")
```

---

## 5. Security Expressions (RLS)
Used in `sharing.yml` or `permission.zod.ts`.

*   **Owner Only:** `owner == $user.id`
*   **Team View:** `department == $user.department`
*   **Manager Hierachy:** `owner.manager == $user.id`
