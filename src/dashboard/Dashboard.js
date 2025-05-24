
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import { backendUrl } from './constants/url';
import Home from './pages/Home';
import Login from './pages/Login';
import MetalPrices from './pages/MetalPrices';
import NewCustomOrder from './pages/NewCustomOrder';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import Products from './pages/Products';
import UserDetails from './pages/UserDetails';
import Users from './pages/Users';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import HomeContent from './pages/HomeContent';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const navigate = useNavigate();

  React.useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if ((token === null || token === undefined || token === '') && !isLoginPage) {
          navigate('/login');
          return
        }
        if (token !== null && token !== undefined && token !== '') {
          const response = await axios.post(`${backendUrl}/user/verify-token`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.result !== 'SUCCESS' && !isLoginPage) {
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      } catch (err) {
        console.log(err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    verifyToken();
  }, [isLoginPage]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      {isLoginPage
        ? <Login />
        :
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                mx: 3,
                pb: 5,
                mt: { xs: 8, md: 2 },
              }}
            >
              <Header />
              {/* Main content */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/all-products" element={<Products />} />
                <Route path="/all-orders" element={<Orders />} />
                <Route path="/all-users" element={<Users />} />
                <Route path="/order/create-custom" element={<NewCustomOrder />} />
                <Route path="/order/:orderId" element={<OrderDetail />} />
                <Route path="/metal-prices" element={<MetalPrices />} />
                <Route path="/user/:userId" element={<UserDetails />} />
                <Route path="/home-content" element={<HomeContent />} />
              </Routes>
            </Stack>
          </Box>

          {/* <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <MainGrid />
          </Stack>
        </Box> */}
        </Box>
      }
    </AppTheme>
  );
}
