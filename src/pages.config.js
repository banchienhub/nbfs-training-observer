import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import NewSession from './pages/NewSession';
import SessionDetail from './pages/SessionDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Sessions": Sessions,
    "NewSession": NewSession,
    "SessionDetail": SessionDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};