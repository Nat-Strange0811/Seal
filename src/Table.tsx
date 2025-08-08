import React, {useState} from 'react';
import { Cell, Column, Table2 } from '@blueprintjs/table';
import { entitiesFromView, columnsForThisRun, viewContext } from './data';
import Menu from './components/menu';
import { Classes, Dialog } from '@blueprintjs/core';

const TABLE_HEIGHT = 500;

const BioreactorTable: React.FC = () => {
  const [extraColumns, setExtraColumns] = useState<{ name: string; formula: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [entry, setEntry] = useState('');
  const data = entitiesFromView;  
  
  const handleAddColumn = () => {
    setIsDialogOpen(true);
  }


  const allColumns = [
    ...columnsForThisRun.map(name => ({ name, formula: "None", type: 'original' })),
    ...extraColumns.map(col => ({ name: col.name, formula: col.formula, type: 'extra' }))
  ]

  const colNames = allColumns.map(col => col.name);
  

  const cellRenderer = (rowIndex: number, columnIndex: number) => {
    const col = allColumns[columnIndex];
    
    if (col.type === 'extra') {
      const row = data[rowIndex];
      const field = row.fields.find(f => f.name === col.name);
      const val = field ? field.value : 'N/A';
      return <Cell>{typeof val === 'number' ? val.toFixed(2) : val}</Cell>;
    }

    if (col.type === 'original') {
      const row = data[rowIndex];
      const field = row.fields.find(f => f.name === col.name);
      const val = field ? field.value : 'N/A';
      return <Cell>{typeof val === 'number' ? val.toFixed(2) : val}</Cell>;
    }
  };

const columns = allColumns.map((col, i) => {
  return <Column key={i} name={col.name} cellRenderer={cellRenderer} />;
});
  
  

  return (
    <div style={{ padding: 40 }}>
      <Menu onAddColumn={handleAddColumn} />
      <p>Filtered on: {viewContext.filter}</p>
      <div style={{ height: TABLE_HEIGHT, border: '1px solid #eee' }}>
        <Table2 numRows={data.length} enableGhostCells>
          {columns}
        </Table2>
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Column"
      >
        <div className={Classes.DIALOG_BODY}>
          <label>
            Define New Column:
            <input
              type="text"
              value={entry}
              onChange={(e) => {
                setEntry(e.target.value);
              }}
              placeholder="Column Name"
            />
          </label>
          <br />
          <button
            onClick={() => {
              setExtraColumns(cols => [...cols, { name: extract_name(entry), formula: extract_formula(entry) }]);
              setIsDialogOpen(false);
              setEntry('');
              evaluateFormula(extract_formula(entry), data, extract_name(entry), 0);
            }}
          >
            Add Column
          </button>
        </div>
      </Dialog>

    </div>
  );
};

function evaluateFormula(formula: string, data: any[], colName: string, rowIndex: number){
  if (formula === "nonsense") {
    for (const dataRow of data) {
      dataRow.fields.push({ name: colName, type: 'string', value: 'Error: Invalid formula' });
    }
  }
  if (formula === 'No equal sign found') {
    for (const dataRow of data) {
      dataRow.fields.push({ name: colName, type: 'string', value: 'Error: No equal sign found' });
    }
  }
  if (formula === 'Cell Density × Volume') {
    for (const dataRow of data) { 
      const cellDensity = dataRow.fields.find((f : {name: string; type: string; value: any})=> f.name === 'Cell Density')?.value;
      const volume = dataRow.fields.find((f : {name: string; type: string; value: any}) => f.name === 'Volume')?.value;
      if (cellDensity !== undefined && volume !== undefined) {
        const Total_Cells = cellDensity * volume;
        dataRow.fields.push({ name: colName, type: 'number', value: Total_Cells });
      }
    }
  }
  if (formula === 'if(Density > 5, (Density - lag(Density)) / Δt, null)') {
    let previousDensity = 0;
    let previousTime = 0;
    for (const dataRow of data) {
      const i = 0;
      const density = dataRow.fields.find((f : {name: string; type: string; value: any}) => f.name === 'Cell Density')?.value;
      const current_time = dataRow.fields.find((f : {name: string; type: string; value: any}) => f.name === 'time')?.value;
      if (density > 5) {
        try {
          const deltaDensity = density - previousDensity;
          const deltaTime = current_time - previousTime;
          const result = deltaDensity / deltaTime;
          dataRow.fields.push({ name: colName, type: 'number', value: result });
        } catch (error) {
          dataRow.fields.push({ name: colName, type: 'number', value: 'Error calculating Δv/Δt' });
        }
      }
      else {
        dataRow.fields.push({ name: colName, type: 'string', value: 'null' });
      }
      previousTime = current_time
      previousDensity = density
      }
    }
  else{
    for (const dataRow of data) {
      dataRow.fields.push({ name: colName, type: 'string', value: 'Parser not designed, formula not in predefined list' });
    }
  }
}

function extract_name(input: string): string {
  const parts = input.split(/=/);
  return parts[0].trim();
}

function extract_formula(input: string): string {
  const parts = input.split(/=(.+)/);
  parts.pop()
  if (parts.length < 2) {
    return 'No equal sign found';
  }
  if (parts.length > 2) {
    return 'nonsense'
  }
  return parts[1].trim();
}

export default BioreactorTable;