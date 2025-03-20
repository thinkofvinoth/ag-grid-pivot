import React, { useCallback, useRef, useState, forwardRef, useEffect, useImperativeHandle } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ChevronDown, ChevronRight, Filter, Settings, ArrowUpDown, Trash2, ArrowUp, ArrowDown, FilterX, ChevronsUpDown, Cog } from 'lucide-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';

// Constants
const SAMPLE_DATA = [
  { country: 'United States', year: 2020, sport: 'Basketball', gold: 30, silver: 25, bronze: 20 },
  { country: 'United States', year: 2021, sport: 'Basketball', gold: 28, silver: 22, bronze: 18 },
  { country: 'China', year: 2020, sport: 'Table Tennis', gold: 35, silver: 20, bronze: 15 },
  { country: 'China', year: 2021, sport: 'Table Tennis', gold: 32, silver: 24, bronze: 19 },
  { country: 'Germany', year: 2020, sport: 'Football', gold: 15, silver: 18, bronze: 22 },
  { country: 'Germany', year: 2021, sport: 'Football', gold: 18, silver: 20, bronze: 25 },
  { country: 'Japan', year: 2020, sport: 'Baseball', gold: 20, silver: 15, bronze: 12 },
  { country: 'Japan', year: 2021, sport: 'Baseball', gold: 22, silver: 18, bronze: 15 },
  { country: 'Brazil', year: 2020, sport: 'Football', gold: 25, silver: 22, bronze: 18 },
  { country: 'Brazil', year: 2021, sport: 'Football', gold: 28, silver: 24, bronze: 20 }
];

const COLUMN_DEFS = [
  { 
    field: 'country',
    enablePivot: true,
    enableRowGroup: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      buttons: ['apply', 'clear'],
      closeOnApply: true
    }
  },
  { 
    field: 'year',
    enablePivot: true,
    enableRowGroup: true,
    filter: 'agNumberColumnFilter',
    filterParams: {
      buttons: ['apply', 'clear'],
      closeOnApply: true
    }
  },
  { 
    field: 'sport',
    enablePivot: true,
    enableRowGroup: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      buttons: ['apply', 'clear'],
      closeOnApply: true
    }
  },
  { 
    field: 'gold',
    enableValue: true,
    aggFunc: 'sum',
    filter: 'agNumberColumnFilter',
    filterParams: {
      buttons: ['apply', 'clear'],
      closeOnApply: true
    }
  },
  { 
    field: 'silver',
    enableValue: true,
    aggFunc: 'sum',
    filter: 'agNumberColumnFilter',
    filterParams: {
      buttons: ['apply', 'clear'],
      closeOnApply: true
    }
  },
  { 
    field: 'bronze',
    enableValue: true,
    aggFunc: 'sum',
    filter: 'agNumberColumnFilter',
    filterParams: {
      buttons: ['apply', 'clear'],
      closeOnApply: true
    }
  }
];

const DEFAULT_COL_DEF = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1,
  minWidth: 100,
  enablePivot: true,
  enableRowGroup: true
};

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
    width: '35%',
    padding: '16px',
    borderRight: '1px solid #e5e7eb',
    overflowY: 'auto',
  },
  rightSection: {
    width: '65%',
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
    userSelect: 'none',
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
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
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
    minHeight: '100px',
    backgroundColor: '#ffffff',
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
    userSelect: 'none',
  },
  itemText: {
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#f9fafb',
  },
  select: {
    fontSize: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '4px 8px',
    width: '100%',
    marginBottom: '8px',
    backgroundColor: '#ffffff',
  },
  dropdown: {
    position: 'relative',
    minWidth: '120px',
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '4px 8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'space-between',
  },
  dropdownContent: {
    position: 'absolute',
    zIndex: 50,
    marginTop: '4px',
    width: '240px',
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
    transition: 'background-color 0.2s',
  },
  dropdownItemActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  filterSection: {
    borderTop: '1px solid #f3f4f6',
    padding: '12px',
  },
  filterInput: {
    width: '100%',
    fontSize: '0.875rem',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '6px 12px',
    marginTop: '8px',
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '2px dashed #3b82f6',
    borderRadius: '4px',
    pointerEvents: 'none',
  },
  advancedSettings: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  advancedButton: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  advancedButtonText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  advancedContent: {
    marginTop: '12px',
    padding: '8px 0',
    borderTop: '1px solid #e5e7eb',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  }
};

const SIDEBAR_CONFIG = {
  toolPanels: [
    {
      id: 'columns',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
      toolPanel: 'agColumnsToolPanel',
    },
    {
      id: 'filters',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
      toolPanel: 'agFiltersToolPanel',
    },
    {
      id: 'customPanel',
      labelDefault: 'Custom Panel',
      labelKey: 'customPanel',
      iconKey: 'menu',
      toolPanel: 'CustomSidebar'
    }
  ],
  defaultToolPanel: 'customPanel',
  position: 'right'
};

// CustomSidebar Component
const CustomSidebar = forwardRef((props, ref) => {
  const [columns, setColumns] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pivotSections, setPivotSections] = useState([
    { id: 'values', title: 'Values', items: [], isExpanded: true, isFiltered: false },
    { id: 'filter', title: 'Filter & Sorting', items: [], isExpanded: true, isFiltered: false },
    { id: 'columns', title: 'Columns', items: [], isExpanded: true, isFiltered: false },
    { id: 'rows', title: 'Rows', items: [], isExpanded: true, isFiltered: false }
  ]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [totalsSettings, setTotalsSettings] = useState({
    showRowTotals: true,
    showColumnTotals: true
  });

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
    if (props.api) {
      const allColumns = props.api.getColumns();
      setColumns(allColumns || []);
    }
  }, [props.api]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (props.api) {
        const allColumns = props.api.getColumns();
        setColumns(allColumns || []);
      }
    }
  }));

  const updateGridSettings = () => {
    if (props.api && props.context?.onPivotSettingsChanged) {
      const rowGroupColumns = pivotSections.find(s => s.id === 'rows')?.items.map(item => item.id) || [];
      const pivotColumns = pivotSections.find(s => s.id === 'columns')?.items.map(item => item.id) || [];
      const valueColumns = pivotSections.find(s => s.id === 'values')?.items.map(item => item.id) || [];

      props.context.onPivotSettingsChanged({
        rowGroupColumns,
        pivotColumns,
        valueColumns
      });
    }
  };

  const handleDragStart = (e, column) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: column.getId(),
      field: column.getColDef().field
    }));
  };

  const handleDrop = (e, sectionId) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    setPivotSections(prev => {
      const newSections = prev.map(section => ({
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
      }));

      setTimeout(() => updateGridSettings(), 0);
      return newSections;
    });
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

  const handleTotalsChange = (setting) => {
    const newSettings = {
      ...totalsSettings,
      [setting]: !totalsSettings[setting]
    };
    setTotalsSettings(newSettings);
    if (props.context?.onTotalsSettingsChanged) {
      props.context.onTotalsSettingsChanged(newSettings);
    }
  };

  const setAggregation = (sectionId, itemId, aggregation) => {
    setPivotSections(prev => {
      const newSections = prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.id === itemId) {
                if (props.api) {
                  const column = props.api.getColumn(itemId);
                  if (column) {
                    column.setAggFunc(aggregation);
                    props.api.refreshClientSideRowModel('aggregate');
                  }
                }
                return { ...item, aggregation };
              }
              return item;
            })
          };
        }
        return section;
      });

      setTimeout(() => updateGridSettings(), 0);
      return newSections;
    });
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
    setPivotSections(prev => {
      const newSections = prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          };
        }
        return section;
      });

      setTimeout(() => updateGridSettings(), 0);
      return newSections;
    });
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
                      onClick={() => setAggregation(section.id, item.id, option.value)}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={styles.headerText}>
              <Settings style={styles.icon} />
              Pivot Settings
            </h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                ...styles.button,
                color: showAdvanced ? '#3b82f6' : '#6b7280',
                padding: '4px',
              }}
              title="Advanced Settings"
            >
              <Cog style={styles.icon} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div style={styles.advancedSettings}>
            <div style={styles.advancedContent}>
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel} title="Show total calculations for each row">
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={totalsSettings.showRowTotals}
                    onChange={() => handleTotalsChange('showRowTotals')}
                  />
                  Show Row Totals
                </label>
                <label style={styles.checkboxLabel} title="Show total calculations for each column">
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={totalsSettings.showColumnTotals}
                    onChange={() => handleTotalsChange('showColumnTotals')}
                  />
                  Show Column Totals
                </label>
              </div>
            </div>
          </div>
        )}

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

// Main App Component
function App() {
  const gridRef = useRef<AgGridReact>(null);
  const [pivotMode, setPivotMode] = useState(true);
  const [rowGroupColumns, setRowGroupColumns] = useState([]);
  const [pivotColumns, setPivotColumns] = useState([]);
  const [valueColumns, setValueColumns] = useState([]);
  const [showRowTotals, setShowRowTotals] = useState(true);
  const [showColumnTotals, setShowColumnTotals] = useState(true);

  const onGridReady = useCallback(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.setSideBarVisible(true);
    }
  }, []);

  const onPivotSettingsChanged = useCallback((settings) => {
    setRowGroupColumns(settings.rowGroupColumns);
    setPivotColumns(settings.pivotColumns);
    setValueColumns(settings.valueColumns);

    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption('pivotMode', true);
      gridRef.current.api.setRowGroupColumns(settings.rowGroupColumns);
      gridRef.current.api.setPivotColumns(settings.pivotColumns);
      gridRef.current.api.setValueColumns(settings.valueColumns);
    }
  }, []);

  const onTotalsSettingsChanged = useCallback((settings) => {
    setShowRowTotals(settings.showRowTotals);
    setShowColumnTotals(settings.showColumnTotals);
    
    if (gridRef.current?.api) {
      gridRef.current.api.refreshClientSideRowModel('group');
    }
  }, []);

  return (
    <div className="h-screen w-full bg-gray-100 p-4">
      <div className="ag-theme-alpine h-[600px] w-full bg-white rounded-lg shadow-lg">
        <AgGridReact
          ref={gridRef}
          rowData={SAMPLE_DATA}
          columnDefs={COLUMN_DEFS}
          defaultColDef={DEFAULT_COL_DEF}
          sideBar={{
            ...SIDEBAR_CONFIG,
            toolPanels: SIDEBAR_CONFIG.toolPanels.map(panel => ({
              ...panel,
              toolPanel: panel.id === 'customPanel' ? CustomSidebar : panel.toolPanel
            }))
          }}
          onGridReady={onGridReady}
          pivotMode={pivotMode}
          rowGroupPanelShow="always"
          pivotPanelShow="always"
          suppressAggFuncInHeader={true}
          groupDefaultExpanded={1}
          enableRangeSelection={true}
          enableRangeHandle={true}
          groupTotalRow={showRowTotals}
          grandTotalRow={showRowTotals}
          pivotColumnGroupTotals={showColumnTotals ? 'before' : false}
          pivotRowTotals={showRowTotals ? 'before' : false}
          suppressPivotMode={false}
          suppressColumnVirtualisation={true}
          reactiveCustomComponents={true}
          context={{
            onPivotSettingsChanged,
            onTotalsSettingsChanged,
            currentSettings: {
              rowGroupColumns,
              pivotColumns,
              valueColumns,
              showRowTotals,
              showColumnTotals
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
