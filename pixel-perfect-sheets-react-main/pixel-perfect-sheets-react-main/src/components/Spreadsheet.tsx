
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, Filter, MoreHorizontal, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CellData {
  id: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'email';
}

interface ColumnConfig {
  id: string;
  title: string;
  width: number;
  type: 'text' | 'number' | 'date' | 'email';
  sortable: boolean;
}

interface SpreadsheetProps {
  className?: string;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({ className }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterValue, setFilterValue] = useState('');
  const [activeTab, setActiveTab] = useState('Sheet1');
  
  const inputRef = useRef<HTMLInputElement>(null);

  const columns: ColumnConfig[] = [
    { id: 'col-a', title: 'Name', width: 200, type: 'text', sortable: true },
    { id: 'col-b', title: 'Email', width: 250, type: 'email', sortable: true },
    { id: 'col-c', title: 'Department', width: 150, type: 'text', sortable: true },
    { id: 'col-d', title: 'Role', width: 150, type: 'text', sortable: true },
    { id: 'col-e', title: 'Start Date', width: 120, type: 'date', sortable: true },
    { id: 'col-f', title: 'Salary', width: 120, type: 'number', sortable: true },
    { id: 'col-g', title: 'Status', width: 100, type: 'text', sortable: true },
    { id: 'col-h', title: 'Notes', width: 200, type: 'text', sortable: false },
  ];

  const [data, setData] = useState<Record<string, CellData>>(() => {
    const initialData: Record<string, CellData> = {};
    
    // Sample data
    const sampleRows = [
      ['John Doe', 'john.doe@company.com', 'Engineering', 'Senior Developer', '2023-01-15', '85000', 'Active', 'Team lead'],
      ['Jane Smith', 'jane.smith@company.com', 'Design', 'UX Designer', '2023-02-01', '75000', 'Active', 'Creative team'],
      ['Mike Johnson', 'mike.johnson@company.com', 'Marketing', 'Marketing Manager', '2023-01-20', '70000', 'Active', 'Campaign lead'],
      ['Sarah Wilson', 'sarah.wilson@company.com', 'HR', 'HR Specialist', '2023-03-01', '60000', 'Active', 'Recruitment'],
      ['David Brown', 'david.brown@company.com', 'Engineering', 'Frontend Developer', '2023-02-15', '80000', 'Active', 'React specialist'],
      ['Lisa Davis', 'lisa.davis@company.com', 'Design', 'Product Designer', '2023-01-10', '78000', 'Active', 'Mobile focus'],
      ['Tom Anderson', 'tom.anderson@company.com', 'Sales', 'Sales Representative', '2023-02-20', '65000', 'Active', 'Enterprise sales'],
      ['Emma Taylor', 'emma.taylor@company.com', 'Engineering', 'DevOps Engineer', '2023-01-25', '90000', 'Active', 'Infrastructure'],
    ];

    sampleRows.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        const cellId = `${rowIndex}-${colIndex}`;
        initialData[cellId] = {
          id: cellId,
          value: cellValue,
          type: columns[colIndex]?.type || 'text'
        };
      });
    });

    return initialData;
  });

  const handleCellClick = useCallback((cellId: string) => {
    console.log('Cell clicked:', cellId);
    setSelectedCell(cellId);
    setEditingCell(null);
  }, []);

  const handleCellDoubleClick = useCallback((cellId: string) => {
    console.log('Cell double-clicked for editing:', cellId);
    setEditingCell(cellId);
    setSelectedCell(cellId);
  }, []);

  const handleCellChange = useCallback((cellId: string, value: string) => {
    console.log('Cell value changed:', cellId, value);
    setData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        value: value
      }
    }));
  }, []);

  const handleSort = useCallback((columnId: string) => {
    console.log('Sorting column:', columnId);
    const newDirection = sortConfig?.column === columnId && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ column: columnId, direction: newDirection });
  }, [sortConfig]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, cellId: string) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }, []);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const renderCell = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`;
    const cellData = data[cellId];
    const isSelected = selectedCell === cellId;
    const isEditing = editingCell === cellId;

    return (
      <div
        key={cellId}
        className={cn(
          "relative border-r border-b border-gray-200 bg-white hover:bg-gray-50 cursor-cell",
          isSelected && "ring-2 ring-blue-500 ring-inset bg-blue-50",
          "transition-colors duration-150"
        )}
        style={{ width: columns[colIndex]?.width || 100, minHeight: 36 }}
        onClick={() => handleCellClick(cellId)}
        onDoubleClick={() => handleCellDoubleClick(cellId)}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={cellData?.value || ''}
            onChange={(e) => handleCellChange(cellId, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, cellId)}
            onBlur={() => setEditingCell(null)}
            className="w-full h-full px-2 py-1 border-none outline-none bg-transparent text-sm"
          />
        ) : (
          <div className="px-2 py-1 text-sm text-gray-900 truncate h-full flex items-center">
            {cellData?.value || ''}
          </div>
        )}
      </div>
    );
  };

  const renderHeader = (column: ColumnConfig, index: number) => {
    const isSorted = sortConfig?.column === column.id;
    const sortDirection = sortConfig?.direction;

    return (
      <div
        key={column.id}
        className="relative bg-gray-50 border-r border-b border-gray-200 hover:bg-gray-100 cursor-pointer group"
        style={{ width: column.width, minHeight: 40 }}
        onClick={() => column.sortable && handleSort(column.id)}
      >
        <div className="px-2 py-2 flex items-center justify-between h-full">
          <span className="text-sm font-medium text-gray-700 truncate">
            {column.title}
          </span>
          {column.sortable && (
            <div className="flex items-center ml-1">
              {isSorted ? (
                sortDirection === 'asc' ? (
                  <ArrowUp className="w-3 h-3 text-gray-500" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-gray-500" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = ['Sheet1', 'Sheet2', 'Sheet3'];

  return (
    <div className={cn("flex flex-col h-screen bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Employee Database</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => console.log('Add row clicked')}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Row
            </button>
            <button
              onClick={() => console.log('Filter clicked')}
              className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                console.log('Search value:', e.target.value);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => console.log('More options clicked')}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => console.log('Bold clicked')}
            className="px-2 py-1 text-sm font-medium border border-gray-300 rounded hover:bg-white transition-colors"
          >
            B
          </button>
          <button
            onClick={() => console.log('Italic clicked')}
            className="px-2 py-1 text-sm italic border border-gray-300 rounded hover:bg-white transition-colors"
          >
            I
          </button>
          <button
            onClick={() => console.log('Underline clicked')}
            className="px-2 py-1 text-sm underline border border-gray-300 rounded hover:bg-white transition-colors"
          >
            U
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <select
            onChange={(e) => console.log('Font size changed:', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-white transition-colors"
          >
            <option value="10">10</option>
            <option value="12" selected>12</option>
            <option value="14">14</option>
            <option value="16">16</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          {/* Column Headers */}
          <div className="flex border-l border-gray-200">
            <div className="w-12 bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center min-h-[40px]">
              <span className="text-xs font-medium text-gray-500">#</span>
            </div>
            {columns.map((column, index) => renderHeader(column, index))}
          </div>

          {/* Data Rows */}
          <div className="border-l border-gray-200">
            {Array.from({ length: 20 }, (_, rowIndex) => (
              <div key={rowIndex} className="flex">
                <div className="w-12 bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center min-h-[36px]">
                  <span className="text-xs font-medium text-gray-500">{rowIndex + 1}</span>
                </div>
                {columns.map((_, colIndex) => renderCell(rowIndex, colIndex))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                console.log('Tab changed:', tab);
              }}
              className={cn(
                "px-3 py-1 text-sm rounded-t-md transition-colors",
                activeTab === tab
                  ? "bg-blue-100 text-blue-700 border-t border-l border-r border-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={() => console.log('Add sheet clicked')}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {Object.keys(data).length} cells • Sheet1
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
