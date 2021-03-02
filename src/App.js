import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './App.css';
import logo from './logo.svg';
import Table from './Table.js';


export default function App() {
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/table">
            <Table />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
