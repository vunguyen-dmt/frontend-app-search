import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
  getConfig,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import ReactDOM from 'react-dom';

import Header from '@edx/frontend-component-header';
import Footer from '@edx/frontend-component-footer';
import {
  BrowserRouter, Route, Switch,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './i18n';
import './index.scss';
import Search from './pages/search/search';
import NotFoundPage from './pages/not-found/notFound';
import CourseAbout from './pages/course-about/courseAbout';
import { handleLanguageChange } from './handleLanguageChange';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <BrowserRouter>
      <AppProvider>
        <Helmet>
          <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
        </Helmet>
        <Header />
        <Switch>
          <Route exact path="/" component={Search} />
          <Route exact path="/:id" component={CourseAbout} />
          <Route path="*" component={NotFoundPage} />
        </Switch>
        <Footer
          supportedLanguages={[
            { label: 'English', value: 'en' },
            { label: 'Tiếng Việt', value: 'vi' },
          ]}
          onLanguageSelected={handleLanguageChange}
        />
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
