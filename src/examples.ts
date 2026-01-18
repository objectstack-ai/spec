/**
 * Example Usage of ObjectStack Metamodel
 * 
 * This file demonstrates how to use the metamodel interfaces
 * to define entities and views.
 */

import type { ObjectEntity, ObjectView } from './types/meta';

/**
 * Example: User Entity Definition
 */
export const UserEntity: ObjectEntity = {
  name: 'User',
  label: 'User',
  pluralLabel: 'Users',
  description: 'System user account',
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      required: true,
      readonly: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      unique: true,
      maxLength: 255,
    },
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Viewer' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
    {
      name: 'createdAt',
      label: 'Created At',
      type: 'datetime',
      readonly: true,
    },
  ],
  primaryKey: 'id',
  displayField: 'name',
  icon: 'user',
  auditable: true,
  searchable: true,
  searchableFields: ['name', 'email'],
};

/**
 * Example: All Users List View
 */
export const AllUsersView: ObjectView = {
  name: 'all_users',
  label: 'All Users',
  entityName: 'User',
  type: 'list',
  description: 'View all users in the system',
  columns: [
    {
      field: 'name',
      label: 'Name',
      width: '25%',
      sortable: true,
    },
    {
      field: 'email',
      label: 'Email',
      width: '30%',
      sortable: true,
    },
    {
      field: 'role',
      label: 'Role',
      width: '15%',
      sortable: true,
    },
    {
      field: 'status',
      label: 'Status',
      width: '15%',
      sortable: true,
    },
    {
      field: 'createdAt',
      label: 'Created',
      width: '15%',
      sortable: true,
      format: 'date:MM/DD/YYYY',
    },
  ],
  sort: [
    {
      field: 'name',
      direction: 'asc',
    },
  ],
  pageSize: 25,
  default: true,
};

/**
 * Example: Active Users View (with filter)
 */
export const ActiveUsersView: ObjectView = {
  name: 'active_users',
  label: 'Active Users',
  entityName: 'User',
  type: 'list',
  description: 'View only active users',
  columns: [
    {
      field: 'name',
      width: '30%',
    },
    {
      field: 'email',
      width: '40%',
    },
    {
      field: 'role',
      width: '30%',
    },
  ],
  filters: [
    {
      field: 'status',
      operator: 'equals',
      value: 'active',
    },
  ],
  sort: [
    {
      field: 'name',
      direction: 'asc',
    },
  ],
};

/**
 * Example: User Form View
 */
export const UserFormView: ObjectView = {
  name: 'user_form',
  label: 'User Form',
  entityName: 'User',
  type: 'form',
  description: 'Form for creating and editing users',
  fields: ['name', 'email', 'role', 'status'],
  layout: {
    type: 'sections',
    sections: [
      {
        id: 'basic',
        title: 'Basic Information',
        fields: ['name', 'email'],
      },
      {
        id: 'settings',
        title: 'Settings',
        fields: ['role', 'status'],
      },
    ],
  },
};

/**
 * Example: Product Entity with Lookup
 */
export const ProductEntity: ObjectEntity = {
  name: 'Product',
  label: 'Product',
  pluralLabel: 'Products',
  description: 'Product catalog',
  fields: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      required: true,
      readonly: true,
    },
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      maxLength: 200,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      maxLength: 1000,
    },
    {
      name: 'price',
      label: 'Price',
      type: 'currency',
      required: true,
      min: 0,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'lookup',
      required: true,
      lookupEntity: 'Category',
      lookupDisplayField: 'name',
    },
    {
      name: 'inStock',
      label: 'In Stock',
      type: 'boolean',
      defaultValue: true,
    },
    {
      name: 'image',
      label: 'Product Image',
      type: 'image',
    },
  ],
  primaryKey: 'id',
  displayField: 'name',
  icon: 'package',
  searchable: true,
  searchableFields: ['name', 'description'],
};
