import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Layout from './Base/Layout.jsx';
import {ChakraProvider} from '@chakra-ui/react'

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
    <Layout />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
