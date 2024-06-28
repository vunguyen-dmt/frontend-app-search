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
  Route, Routes,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import messages from './i18n';
import './index.scss';
import Search from './pages/search/search';
import NotFoundPage from './pages/not-found/notFound';
import CourseAbout from './pages/course-about/courseAbout';

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <Helmet>
        <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
      </Helmet>
      <Header />
      <Routes>
        <Route exact path="/" element={<Search />} />
        <Route exact path="/:id" element={<CourseAbout />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer showLanguageSelector />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages,
});
