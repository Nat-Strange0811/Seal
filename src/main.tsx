import React from 'react';
import ReactDOM from 'react-dom/client';
import BioreactorTable from './Table';
import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/table/lib/css/table.css';
import './index.css';
import Menu from './components/menu';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BioreactorTable />
  </React.StrictMode>
);
