import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Dash from './Dash/dash';
import {ChakraProvider} from '@chakra-ui/react'

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
    <Dash />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
