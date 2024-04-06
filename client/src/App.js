import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import { Login } from './pages/Login/Login';
// import { PrivateRoute } from './components/PrivateRoute';
import "./styles/sb-admin-2.min.css";
import { routes } from './routes/index';

function App() {
  return (
    <div className="App" id="wrapper">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />

          {routes.map((route) => {
            const PageName = route.page;
            
            return (
              <Route
                key={route.path}
                path={route.path}
                element={ <PageName /> }
              />
            );
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
