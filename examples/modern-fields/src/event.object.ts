import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Event Object - Demonstrates Cross-Field Validation
 * 
 * This example shows cross-field validation capabilities:
 * - Date range validation (end_date > start_date)
 * - Capacity validation (attendees <= max_capacity)
 * - Price validation (discount < total_price)
 */
export const Event = ObjectSchema.create({
  name: 'event',
  label: 'Event',
  icon: 'calendar',
  nameField: 'title',
  enable: {
    apiEnabled: true,
    trackHistory: true,
  },
  fields: {
    title: Field.text({ 
      required: true,
      label: 'Event Title',
      maxLength: 200,
    }),
    
    description: Field.richtext({
      label: 'Description',
      description: 'Event description with formatting',
    }),
    
    // Date fields for cross-field validation
    start_date: Field.datetime({
      label: 'Start Date',
      required: true,
    }),
    
    end_date: Field.datetime({
      label: 'End Date',
      required: true,
    }),
    
    // Capacity fields for validation
    max_capacity: Field.number({
      label: 'Maximum Capacity',
      required: true,
      min: 1,
    }),
    
    current_attendees: Field.number({
      label: 'Current Attendees',
      defaultValue: 0,
      min: 0,
    }),
    
    // Pricing fields
    ticket_price: Field.currency({
      label: 'Ticket Price',
      required: true,
      min: 0,
      precision: 10,
      scale: 2,
    }),
    
    discount_amount: Field.currency({
      label: 'Discount Amount',
      min: 0,
      precision: 10,
      scale: 2,
    }),
    
    // Location
    venue_address: Field.address({
      label: 'Venue Address',
      required: true,
      addressFormat: 'us',
    }),
    
    venue_location: Field.geolocation({
      label: 'Venue GPS Location',
      displayMap: true,
      allowGeocoding: true,
    }),
    
    status: Field.select({
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft', color: '#AAAAAA', default: true },
        { label: 'Published', value: 'published', color: '#00AA00' },
        { label: 'Cancelled', value: 'cancelled', color: '#AA0000' },
        { label: 'Completed', value: 'completed', color: '#0000AA' },
      ],
    }),
  },
  
  // Cross-field validation rules
  validation: [
    // 1. End date must be after start date
    {
      type: 'cross_field',
      name: 'end_after_start',
      condition: 'end_date > start_date',
      fields: ['start_date', 'end_date'],
      message: 'End date must be after start date',
      severity: 'error',
      active: true,
    },
    
    // 2. Current attendees cannot exceed max capacity
    {
      type: 'cross_field',
      name: 'attendees_within_capacity',
      condition: 'current_attendees <= max_capacity',
      fields: ['current_attendees', 'max_capacity'],
      message: 'Current attendees cannot exceed maximum capacity',
      severity: 'error',
      active: true,
    },
    
    // 3. Discount cannot exceed ticket price
    {
      type: 'cross_field',
      name: 'discount_within_price',
      condition: 'discount_amount <= ticket_price',
      fields: ['discount_amount', 'ticket_price'],
      message: 'Discount amount cannot exceed ticket price',
      severity: 'error',
      active: true,
    },
    
    // 4. Warn when approaching capacity
    {
      type: 'cross_field',
      name: 'approaching_capacity',
      condition: '(current_attendees / max_capacity) < 0.9',
      fields: ['current_attendees', 'max_capacity'],
      message: 'Event is approaching maximum capacity (90% full)',
      severity: 'warning',
      active: true,
    },
    
    // 5. Event must be at least 1 hour long
    {
      type: 'cross_field',
      name: 'minimum_duration',
      condition: '(end_date - start_date) >= 3600', // 3600 seconds = 1 hour
      fields: ['start_date', 'end_date'],
      message: 'Event must be at least 1 hour in duration',
      severity: 'error',
      active: true,
    },
    
    // 6. Conditional validation: Published events require venue location
    {
      type: 'conditional',
      name: 'published_requires_location',
      when: 'status = "published"',
      message: 'Published events must have venue location',
      then: {
        type: 'script',
        name: 'venue_location_required',
        condition: 'venue_location = null OR venue_location = ""',
        message: 'Venue location is required for published events',
        severity: 'error',
        active: true,
      },
      active: true,
    },
  ],
});

/**
 * Example Usage:
 * 
 * // Valid event
 * const validEvent = {
 *   title: 'Tech Conference 2024',
 *   start_date: '2024-06-01T09:00:00Z',
 *   end_date: '2024-06-01T17:00:00Z',  // ✓ After start_date
 *   max_capacity: 500,
 *   current_attendees: 250,             // ✓ Less than max_capacity
 *   ticket_price: 100.00,
 *   discount_amount: 20.00,             // ✓ Less than ticket_price
 *   status: 'published',
 * };
 * 
 * // Invalid event - validation errors
 * const invalidEvent = {
 *   title: 'Invalid Event',
 *   start_date: '2024-06-01T09:00:00Z',
 *   end_date: '2024-06-01T08:00:00Z',   // ✗ Before start_date
 *   max_capacity: 100,
 *   current_attendees: 150,              // ✗ Exceeds max_capacity
 *   ticket_price: 50.00,
 *   discount_amount: 75.00,              // ✗ Exceeds ticket_price
 * };
 */
