import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import ReactDOM from 'react-dom';

import Header from '@edx/frontend-component-header';
import Footer from '@edx/frontend-component-footer';
import {
  BrowserRouter, Route, Switch,
} from 'react-router-dom';
import messages from './i18n';

import './index.scss';
import Search from './pages/search/search';
import NotFoundPage from './pages/not-found/notFound';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <BrowserRouter>
      <AppProvider>
        <Header />
        <Switch>
          <Route exact path="/" component={Search} />
          <Route exact path="/search" component={Search} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
        <Footer />
      </AppProvider>
    </BrowserRouter>,

    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages,
});
