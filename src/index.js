import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from "react-router";
import { createBrowserHistory } from "history";
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

const target = document.getElementById('erw-root');
if (target) { ReactDOM.render(<Router history={createBrowserHistory()}><App /></Router>, target); }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
