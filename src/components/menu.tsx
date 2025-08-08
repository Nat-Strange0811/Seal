import React, { useState } from 'react';
import { Button, Dialog, Classes } from '@blueprintjs/core';

interface MenuProps {
  onAddColumn: () => void;
}

export default function Menu({onAddColumn} : MenuProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
      <Button icon="add" intent="primary" onClick={onAddColumn}>
        New Column
      </Button>

      <Button icon="help" onClick={() => setHelpOpen(true)}>
        Help
      </Button>

      <Dialog
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Help - How to Use Formulas"
      >
        <div className={Classes.DIALOG_BODY}>
          <p>
            Define formulas using column names, e.g. <code>Total Cells = Cell Density * Volume</code>.
          </p>
          <p>
            Use standard operators like +, -, *, /. Use parentheses for grouping.
          </p>
          <p>
            There are also a set number of 'power commands' built in. These are: <code> sum, avg, count, if, lag, lead, min, max, Δt, Δv</code>.
          </p>
        </div>
      </Dialog>
    </div>
  );
}