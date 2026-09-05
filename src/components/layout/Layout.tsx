import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const isWorkspace =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/messages');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isWorkspace && <Footer />}
    </div>
  );
};

export default Layout;