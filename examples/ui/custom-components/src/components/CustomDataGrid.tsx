import React, { useState, useMemo } from 'react';
import type { ComponentProps } from './CustomButton';

interface Column {
  field: string;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * Custom Data Grid Component
 * 
 * An advanced data grid with sorting, filtering, and pagination.
 * 
 * @example
 * ```tsx
 * <CustomDataGrid
 *   properties={{
 *     columns: [
 *       { field: 'name', label: 'Name', sortable: true },
 *       { field: 'email', label: 'Email', sortable: true },
 *       { field: 'status', label: 'Status' },
 *     ],
 *     pageSize: 25,
 *     selectable: true
 *   }}
 *   data={[
 *     { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
 *     { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
 *   ]}
 * />
 * ```
 */
export const CustomDataGrid: React.FC<ComponentProps> = ({
  properties,
  data = [],
  onChange,
  onAction,
  theme,
}) => {
  const {
    columns = [],
    pageSize = 25,
    selectable = false,
    sortable = true,
  } = properties;

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (row: any) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(row.id)) {
      newSelected.delete(row.id);
    } else {
      newSelected.add(row.id);
    }
    setSelectedRows(newSelected);
    onChange?.(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onChange?.([]);
    } else {
      const allIds = new Set(paginatedData.map(row => row.id));
      setSelectedRows(allIds);
      onChange?.(Array.from(allIds));
    }
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: theme?.colors?.background || '#FFFFFF',
    border: `1px solid ${theme?.colors?.border || '#E5E7EB'}`,
    borderRadius: theme?.borderRadius?.md || '8px',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: theme?.colors?.surface || '#F8F9FA',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 600,
    borderBottom: `2px solid ${theme?.colors?.border || '#E5E7EB'}`,
    cursor: 'pointer',
    userSelect: 'none',
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: `1px solid ${theme?.colors?.border || '#E5E7EB'}`,
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    padding: '12px',
  };

  return (
    <div>
      <table style={tableStyle}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...headerStyle, width: '50px' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col: Column) => (
              <th
                key={col.field}
                style={{
                  ...headerStyle,
                  width: col.width,
                }}
                onClick={() => col.sortable !== false && handleSort(col.field)}
              >
                {col.label}
                {sortField === col.field && (
                  <span style={{ marginLeft: '4px' }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr
              key={row.id || index}
              style={{
                backgroundColor: selectedRows.has(row.id) 
                  ? theme?.colors?.focus || '#DBEAFE' 
                  : 'transparent',
              }}
            >
              {selectable && (
                <td style={cellStyle}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => handleRowSelect(row)}
                    aria-label={`Select row ${index + 1}`}
                  />
                </td>
              )}
              {columns.map((col: Column) => (
                <td key={col.field} style={cellStyle}>
                  {col.render ? col.render(row[col.field], row) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={paginationStyle}>
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, data.length)} of {data.length} rows
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

CustomDataGrid.displayName = 'CustomDataGrid';
