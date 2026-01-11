import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import NewSession from './pages/NewSession';
import SessionDetail from './pages/SessionDetail';
import LiveObservation from './pages/LiveObservation';
import SessionReport from './pages/SessionReport';
import Players from './pages/Players';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Sessions": Sessions,
    "NewSession": NewSession,
    "SessionDetail": SessionDetail,
    "LiveObservation": LiveObservation,
    "SessionReport": SessionReport,
    "Players": Players,
    "Settings": Settings,
    "Reports": Reports,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};