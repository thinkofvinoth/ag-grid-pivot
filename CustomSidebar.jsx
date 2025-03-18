import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Filter, Settings, ArrowUpDown, Trash2, ArrowUp, ArrowDown, FilterX, ChevronsUpDown } from 'lucide-react';

const AGGREGATION_OPTIONS = [
  { value: 'sum', label: 'SUM' },
  { value: 'avg', label: 'AVG' },
  { value: 'count', label: 'COUNT' },
  { value: 'min', label: 'MIN' },
  { value: 'max', label: 'MAX' },
  { value: 'unique', label: 'UNIQUE' }
];

const FILTER_TYPES = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEqual', label: 'Not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Not contains' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'inRange', label: 'In range' }
];

const styles = {
  container: {
    display: 'flex',
    height: '100%',
  },
  leftSection: {
    width: '50%',
    padding: '16px',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto',
  },
  rightSection: {
    width: '50%',
    padding: '16px',
    overflowY: 'auto',
    backgroundColor: '#f9fafb',
  },
  sectionHeader: {
    marginBottom: '16px',
  },
  headerText: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    width: '16px',
    height: '16px',
  },
  draggableItem: {
    padding: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    cursor: 'move',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  pivotSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    marginBottom: '8px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f9fafb',
    },
  },
  titleText: {
    fontWeight: 500,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dropZone: {
    padding: '8px',
    borderTop: '1px solid #f3f4f6',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #f3f4f6',
  },
  itemText: {
    fontSize: '0.875rem',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  button: {
    padding: '4px',
    borderRadius: '4px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  removeButton: {
    color: '#ef4444',
  },
  sortButton: {
    color: '#6b7280',
  },
  sortButtonActive: {
    color: '#3b82f6',
  },
  emptyState: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    textAlign: 'center',
    padding: '8px',
    border: '1px dashed #e5e7eb',
    borderRadius: '4px',
  },
  select: {
    fontSize: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '2px 4px',
  },
  dropdown: {
    position: 'relative',
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '2px 8px',
    backgroundColor: '#ffffff',
  },
  dropdownContent: {
    position: 'absolute',
    zIndex: 50,
    marginTop: '4px',
    width: '192px',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 16px',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
  },
  dropdownItemActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  filterSection: {
    borderTop: '1px solid #f3f4f6',
    padding: '8px',
  },
  filterInput: {
    width: '100%',
    fontSize: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '4px 8px',
    marginBottom: '8px',
  },
};

export const CustomSidebar = forwardRef((props, ref) => {
  const [columns, setColumns] = useState([]);
  const [pivotSections, setPivotSections] = useState([
    { id: 'filter', title: 'Filter & Sorting', items: [], isExpanded: true, isFiltered: false },
    { id: 'columns', title: 'Columns', items: [], isExpanded: true, isFiltered: false },
    { id: 'rows', title: 'Rows', items: [], isExpanded: true, isFiltered: false },
    { id: 'values', title: 'Values', items: [], isExpanded: true, isFiltered: false }
  ]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (props.api && props.columnApi) {
      const allColumns = props.columnApi.getColumns();
      setColumns(allColumns || []);
    }
  }, [props.api, props.columnApi]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (props.api && props.columnApi) {
        const allColumns = props.columnApi.getColumns();
        setColumns(allColumns || []);
      }
    }
  }));

  const handleDragStart = (e, column) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: column.getId(),
      field: column.getColDef().field
    }));
  };

  const handleDrop = (e, sectionId) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    setPivotSections(prev => prev.map(section => ({
      ...section,
      items: section.id === sectionId 
        ? [...section.items, { 
            ...data, 
            sortDirection: null, 
            filterActive: false, 
            aggregation: sectionId === 'values' ? 'sum' : null,
            filterType: 'equals',
            filterValue: ''
          }]
        : section.items.filter(item => item.id !== data.id)
    })));

    if (props.columnApi) {
      const column = props.columnApi.getColumn(data.id);
      if (column) {
        switch (sectionId) {
          case 'filter':
            props.columnApi.setColumnFilter(data.id, true);
            break;
          case 'rows':
            props.columnApi.setRowGroupColumns([data.id]);
            break;
          case 'values':
            props.columnApi.setValueColumns([data.id]);
            break;
          case 'columns':
            props.columnApi.setPivotColumns([data.id]);
            break;
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const toggleSort = (sectionId, itemId) => {
    setPivotSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              const newDirection = !item.sortDirection ? 'asc' : 
                                 item.sortDirection === 'asc' ? 'desc' : null;
              if (props.api) {
                props.api.applyColumnState({
                  state: [{ colId: item.id, sort: newDirection }],
                  defaultState: { sort: null }
                });
              }
              return { ...item, sortDirection: newDirection };
            }
            return item;
          })
        };
      }
      return section;
    }));
  };

  const toggleSectionExpand = (sectionId) => {
    setPivotSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const setAggregation = (sectionId, itemId, aggregation) => {
    setPivotSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              if (props.columnApi) {
                const column = props.columnApi.getColumn(itemId);
                if (column) {
                  column.setAggFunc(aggregation);
                  props.api?.refreshClientSideRowModel('aggregate');
                }
              }
              return { ...item, aggregation };
            }
            return item;
          })
        };
      }
      return section;
    }));
    setOpenDropdown(null);
  };

  const setFilter = (sectionId, itemId, filterType, filterValue) => {
    setPivotSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id === itemId) {
              if (props.api) {
                const filterInstance = props.api.getFilterInstance(itemId);
                if (filterInstance) {
                  filterInstance.setModel({
                    type: filterType,
                    filter: filterValue,
                  });
                  props.api.onFilterChanged();
                }
              }
              return { ...item, filterType, filterValue, filterActive: true };
            }
            return item;
          })
        };
      }
      return section;
    }));
  };

  const removeFromSection = (sectionId, itemId) => {
    setPivotSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));

    if (props.columnApi) {
      const column = props.columnApi.getColumn(itemId);
      if (column) {
        switch (sectionId) {
          case 'filter':
            props.columnApi.setColumnFilter(itemId, false);
            break;
          case 'rows':
            props.columnApi.setRowGroupColumns([]);
            break;
          case 'values':
            props.columnApi.setValueColumns([]);
            break;
          case 'columns':
            props.columnApi.setPivotColumns([]);
            break;
        }
      }
    }
  };

  const clearAllFilters = (sectionId) => {
    setPivotSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => ({ ...item, filterActive: false, filterValue: '' }))
        };
      }
      return section;
    }));

    if (props.api) {
      props.api.setFilterModel(null);
    }
  };

  const renderItemControls = (section, item) => {
    if (section.id === 'values') {
      return (
        <div style={styles.controls} ref={dropdownRef}>
          <div style={styles.dropdown}>
            <button
              onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
              style={styles.dropdownButton}
            >
              {item.aggregation?.toUpperCase() || 'SUM'}
              <ChevronsUpDown style={{ width: '12px', height: '12px' }} />
            </button>
            {openDropdown === item.id && (
              <div style={styles.dropdownContent}>
                <div style={{ padding: '4px 0' }}>
                  {AGGREGATION_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      style={{
                        ...styles.dropdownItem,
                        ...(item.aggregation === option.value ? styles.dropdownItemActive : {})
                      }}
                      onClick={() => {
                        setAggregation(section.id, item.id, option.value);
                        setOpenDropdown(null);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div style={styles.filterSection}>
                  <select
                    value={item.filterType || 'equals'}
                    onChange={(e) => setFilter(section.id, item.id, e.target.value, item.filterValue || '')}
                    style={styles.filterInput}
                  >
                    {FILTER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={item.filterValue || ''}
                    onChange={(e) => setFilter(section.id, item.id, item.filterType || 'equals', e.target.value)}
                    placeholder="Filter value..."
                    style={styles.filterInput}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => removeFromSection(section.id, item.id)}
            style={{ ...styles.button, ...styles.removeButton }}
            title="Remove item"
          >
            <Trash2 style={styles.icon} />
          </button>
        </div>
      );
    }

    return (
      <div style={styles.controls}>
        {section.id === 'filter' && (
          <button
            onClick={() => toggleSort(section.id, item.id)}
            style={{
              ...styles.button,
              ...(item.sortDirection ? styles.sortButtonActive : styles.sortButton)
            }}
            title="Toggle sort direction"
          >
            {item.sortDirection === 'asc' ? (
              <ArrowUp style={styles.icon} />
            ) : item.sortDirection === 'desc' ? (
              <ArrowDown style={styles.icon} />
            ) : (
              <ArrowUpDown style={styles.icon} />
            )}
          </button>
        )}
        <button
          onClick={() => removeFromSection(section.id, item.id)}
          style={{ ...styles.button, ...styles.removeButton }}
          title="Remove item"
        >
          <Trash2 style={styles.icon} />
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Left Section - Available Columns */}
      <div style={styles.leftSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.headerText}>
            <Filter style={styles.icon} />
            Fields
          </h3>
        </div>
        <div>
          {columns.map(column => (
            <div
              key={column.getId()}
              draggable
              onDragStart={(e) => handleDragStart(e, column)}
              style={styles.draggableItem}
              title="Drag to add to a section"
            >
              <span>{column.getColDef().field}</span>
              <ArrowUpDown style={{ ...styles.icon, color: '#9ca3af' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Pivot Settings */}
      <div style={styles.rightSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.headerText}>
            <Settings style={styles.icon} />
            Pivot Settings
          </h3>
        </div>
        <div>
          {pivotSections.map(section => (
            <div key={section.id} style={styles.pivotSection}>
              <div 
                style={styles.sectionTitle}
                onClick={() => toggleSectionExpand(section.id)}
              >
                <h4 style={styles.titleText}>
                  {section.isExpanded ? (
                    <ChevronDown style={styles.icon} />
                  ) : (
                    <ChevronRight style={styles.icon} />
                  )}
                  {section.title} ({section.items.length})
                </h4>
                {section.items.length > 0 && section.id === 'filter' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters(section.id);
                    }}
                    style={styles.button}
                    title="Clear all filters"
                  >
                    <FilterX style={styles.icon} />
                  </button>
                )}
              </div>
              {section.isExpanded && (
                <div
                  style={styles.dropZone}
                  onDrop={(e) => handleDrop(e, section.id)}
                  onDragOver={handleDragOver}
                >
                  <div style={styles.itemList}>
                    {section.items.map((item) => (
                      <div key={item.id} style={styles.item}>
                        <span style={styles.itemText}>{item.field}</span>
                        {renderItemControls(section, item)}
                      </div>
                    ))}
                    {section.items.length === 0 && (
                      <div style={styles.emptyState}>
                        Drag fields here
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CustomSidebar.displayName = 'CustomSidebar';
