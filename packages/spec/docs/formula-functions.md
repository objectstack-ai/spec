# Formula Function Library

Formula fields in ObjectStack allow you to create calculated values using expressions. This document provides a comprehensive reference of all available formula functions.

## Overview

Formula fields use the `expression` property in field definitions:

```typescript
// Direct subpath import (Style 3)
import { Field } from '@objectstack/spec/data';

const totalPrice = Field.formula({
  name: 'total_price',
  label: 'Total Price',
  expression: 'ROUND(unit_price * quantity, 2)'
});

// Alternative: Namespace import (Style 1)
import { Data } from '@objectstack/spec';

const discountedPrice = Data.Field.formula({
  name: 'discounted_price',
  label: 'Discounted Price',
  expression: 'IF(quantity > 10, price * 0.9, price)'
});
```

## Function Categories

- [Text Functions](#text-functions) - String manipulation and formatting
- [Math Functions](#math-functions) - Numerical calculations
- [Date Functions](#date-functions) - Date and time operations
- [Logical Functions](#logical-functions) - Conditional logic and boolean operations

---

## Text Functions

Functions for manipulating and formatting text strings.

### `UPPER(text)`

Converts text to uppercase.

**Parameters:**
- `text` (string): The text to convert

**Returns:** string

**Examples:**
```javascript
UPPER("hello") // Returns: "HELLO"
UPPER(first_name) // If first_name = "john", returns "JOHN"
```

---

### `LOWER(text)`

Converts text to lowercase.

**Parameters:**
- `text` (string): The text to convert

**Returns:** string

**Examples:**
```javascript
LOWER("HELLO") // Returns: "hello"
LOWER(last_name) // If last_name = "SMITH", returns "smith"
```

---

### `CONCATENATE(text1, text2, ...)`

Joins multiple text strings into one string.

**Parameters:**
- `text1, text2, ...` (string): One or more text values to join

**Returns:** string

**Examples:**
```javascript
CONCATENATE("Hello", " ", "World") // Returns: "Hello World"
CONCATENATE(first_name, " ", last_name) // Returns: "John Smith"
CONCATENATE("Order #", order_number) // Returns: "Order #12345"
```

---

### `TEXT(value)`

Converts a number or other value to text format.

**Parameters:**
- `value` (any): The value to convert to text

**Returns:** string

**Examples:**
```javascript
TEXT(123) // Returns: "123"
TEXT(price) // If price = 99.99, returns "99.99"
CONCATENATE("Total: $", TEXT(amount)) // Returns: "Total: $150"
```

---

### `LEN(text)`

Returns the number of characters in a text string.

**Parameters:**
- `text` (string): The text to measure

**Returns:** number

**Examples:**
```javascript
LEN("Hello") // Returns: 5
LEN(description) // If description = "Product", returns 7
```

---

## Math Functions

Functions for performing mathematical calculations.

### `SUM(number1, number2, ...)`

Adds all numbers together.

**Parameters:**
- `number1, number2, ...` (number): One or more numbers to add

**Returns:** number

**Examples:**
```javascript
SUM(10, 20, 30) // Returns: 60
SUM(subtotal, tax, shipping) // Returns: sum of all three fields
SUM(line_item_1, line_item_2, line_item_3) // Returns: total of line items
```

---

### `AVERAGE(number1, number2, ...)`

Calculates the arithmetic mean of the provided numbers.

**Parameters:**
- `number1, number2, ...` (number): One or more numbers to average

**Returns:** number

**Examples:**
```javascript
AVERAGE(10, 20, 30) // Returns: 20
AVERAGE(score_1, score_2, score_3) // Returns: average score
AVERAGE(jan_sales, feb_sales, mar_sales) // Returns: average monthly sales
```

---

### `ROUND(number, decimals)`

Rounds a number to a specified number of decimal places.

**Parameters:**
- `number` (number): The number to round
- `decimals` (number): Number of decimal places (optional, defaults to 0)

**Returns:** number

**Examples:**
```javascript
ROUND(3.14159, 2) // Returns: 3.14
ROUND(price * 1.08, 2) // Rounds to 2 decimal places for currency
ROUND(42.7) // Returns: 43 (rounds to nearest integer)
```

---

### `CEILING(number)`

Rounds a number up to the nearest integer.

**Parameters:**
- `number` (number): The number to round up

**Returns:** number

**Examples:**
```javascript
CEILING(3.2) // Returns: 4
CEILING(7.8) // Returns: 8
CEILING(-2.3) // Returns: -2
CEILING(quantity / 12) // Rounds up for package calculation
```

---

### `FLOOR(number)`

Rounds a number down to the nearest integer.

**Parameters:**
- `number` (number): The number to round down

**Returns:** number

**Examples:**
```javascript
FLOOR(3.8) // Returns: 3
FLOOR(7.2) // Returns: 7
FLOOR(-2.3) // Returns: -3
FLOOR(total / 100) // Rounds down for bulk discount calculation
```

---

## Date Functions

Functions for working with dates and times.

### `TODAY()`

Returns the current date (without time).

**Parameters:** None

**Returns:** date

**Examples:**
```javascript
TODAY() // Returns: current date (e.g., 2024-01-23)
ADDDAYS(TODAY(), 30) // Returns: date 30 days from today
```

---

### `NOW()`

Returns the current date and time.

**Parameters:** None

**Returns:** datetime

**Examples:**
```javascript
NOW() // Returns: current date and time (e.g., 2024-01-23 14:30:00)
```

---

### `YEAR(date)`

Extracts the year from a date.

**Parameters:**
- `date` (date): The date to extract from

**Returns:** number

**Examples:**
```javascript
YEAR(TODAY()) // Returns: 2024
YEAR(created_date) // If created_date = "2023-06-15", returns 2023
```

---

### `MONTH(date)`

Extracts the month from a date (1-12).

**Parameters:**
- `date` (date): The date to extract from

**Returns:** number

**Examples:**
```javascript
MONTH(TODAY()) // Returns: 1 (for January)
MONTH(order_date) // If order_date = "2024-03-15", returns 3
```

---

### `DAY(date)`

Extracts the day of the month from a date (1-31).

**Parameters:**
- `date` (date): The date to extract from

**Returns:** number

**Examples:**
```javascript
DAY(TODAY()) // Returns: 23
DAY(due_date) // If due_date = "2024-01-15", returns 15
```

---

### `ADDDAYS(date, days)`

Adds a specified number of days to a date.

**Parameters:**
- `date` (date): The starting date
- `days` (number): Number of days to add (can be negative to subtract)

**Returns:** date

**Examples:**
```javascript
ADDDAYS(TODAY(), 7) // Returns: date 7 days from now
ADDDAYS(order_date, 30) // Returns: order date plus 30 days
ADDDAYS(due_date, -5) // Returns: due date minus 5 days
```

---

## Logical Functions

Functions for conditional logic and boolean operations.

### `IF(condition, true_value, false_value)`

Returns one value if a condition is true, another value if false.

**Parameters:**
- `condition` (boolean): The condition to evaluate
- `true_value` (any): Value to return if condition is true
- `false_value` (any): Value to return if condition is false

**Returns:** any (type matches true_value/false_value)

**Examples:**
```javascript
IF(quantity > 10, "Bulk Order", "Standard Order")
IF(status = "active", 1, 0)
IF(total_price > 1000, total_price * 0.9, total_price) // 10% discount if over $1000
IF(ISBLANK(description), "No description", description)
```

---

### `AND(condition1, condition2, ...)`

Returns true if all conditions are true.

**Parameters:**
- `condition1, condition2, ...` (boolean): One or more conditions to evaluate

**Returns:** boolean

**Examples:**
```javascript
AND(quantity > 0, price > 0) // Returns: true if both conditions are true
AND(status = "approved", budget > 1000, manager_approved = true)
IF(AND(age >= 18, country = "US"), "Eligible", "Not Eligible")
```

---

### `OR(condition1, condition2, ...)`

Returns true if any condition is true.

**Parameters:**
- `condition1, condition2, ...` (boolean): One or more conditions to evaluate

**Returns:** boolean

**Examples:**
```javascript
OR(status = "urgent", priority = "high") // Returns: true if either is true
OR(payment_method = "credit", payment_method = "debit")
IF(OR(discount > 0, coupon_code != ""), "Discount Applied", "No Discount")
```

---

### `NOT(condition)`

Returns the opposite boolean value of the condition.

**Parameters:**
- `condition` (boolean): The condition to negate

**Returns:** boolean

**Examples:**
```javascript
NOT(is_active) // Returns: true if is_active is false
NOT(status = "completed") // Returns: true if status is not "completed"
IF(NOT(ISBLANK(notes)), notes, "No notes available")
```

---

### `ISBLANK(field)`

Checks if a field is null or empty.

**Parameters:**
- `field` (any): The field to check

**Returns:** boolean

**Examples:**
```javascript
ISBLANK(description) // Returns: true if description is null or empty
IF(ISBLANK(middle_name), CONCATENATE(first_name, " ", last_name), CONCATENATE(first_name, " ", middle_name, " ", last_name))
NOT(ISBLANK(email)) // Returns: true if email has a value
```

---

## Type Compatibility

| Function Category | Compatible Field Types |
|------------------|------------------------|
| Text Functions | `text`, `textarea`, `email`, `url`, `phone`, `markdown`, `html` |
| Math Functions | `number`, `currency`, `percent` |
| Date Functions | `date`, `datetime` |
| Logical Functions | All field types (returns boolean) |

## Best Practices

1. **Use Appropriate Data Types**: Ensure formula inputs match expected types (e.g., don't use text functions on numbers)
2. **Handle Null Values**: Use `ISBLANK()` to check for empty fields before operations
3. **Round Currency**: Always use `ROUND(value, 2)` for currency calculations
4. **Nested Formulas**: Formulas can be nested, but keep them readable:
   ```javascript
   // Good
   IF(quantity > 10, ROUND(price * 0.9, 2), price)
   
   // Avoid deep nesting - consider multiple formula fields
   IF(AND(status = "active", OR(type = "premium", total > 1000)), ...)
   ```
5. **Performance**: Complex formulas are recalculated when dependent fields change

## Examples by Use Case

### Price Calculation with Discount
```javascript
// Field: discounted_price
IF(quantity >= 100, ROUND(unit_price * quantity * 0.85, 2), ROUND(unit_price * quantity, 2))
```

### Full Name from Parts
```javascript
// Field: full_name
IF(ISBLANK(middle_name), 
   CONCATENATE(first_name, " ", last_name),
   CONCATENATE(first_name, " ", middle_name, " ", last_name)
)
```

### Age Calculation from Birth Date
```javascript
// Field: age
YEAR(TODAY()) - YEAR(birth_date)
```

### Due Date Based on Creation
```javascript
// Field: due_date
ADDDAYS(created_date, 30)
```

### Status Badge Text
```javascript
// Field: status_display
IF(is_active, 
   IF(last_login_days < 7, "Active", "Inactive"),
   "Disabled"
)
```

### Tax Calculation
```javascript
// Field: tax_amount
ROUND(subtotal * 0.08, 2)
```

### Commission Calculation (Tiered)
```javascript
// Field: commission
IF(sales_amount > 10000, 
   ROUND(sales_amount * 0.15, 2),
   IF(sales_amount > 5000,
      ROUND(sales_amount * 0.10, 2),
      ROUND(sales_amount * 0.05, 2)
   )
)
```

## Related Documentation

- [Field Schema Reference](../src/data/field.zod.ts) - Complete field type definitions
- [Object Schema Reference](../src/data/object.zod.ts) - Object and field configuration
- [Query Protocol Guide](../QUERY_PROTOCOL_GUIDE.md) - Querying calculated fields

---

**Note:** Formula field values are calculated at runtime and are read-only. They cannot be directly edited by users and are automatically updated when dependent fields change.
