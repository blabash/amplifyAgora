import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import { i18n } from 'element-react';
import locale from 'element-react/src/locale/lang/en';

// Bring in default Element React theme
import 'element-theme-default';

Amplify.configure(aws_exports);
i18n.use(locale);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
