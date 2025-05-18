
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../shared-theme/AppTheme';
import AppNavbar from './components/AppNavbar';
import SideMenu from './components/SideMenu';
import Header from './components/Header';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Stack } from '@mui/material';
import MainGrid from './components/MainGrid';
import OrderDetail from './pages/OrderDetail';
import Products from './pages/Products';
import Orders from './pages/Orders';
import NewCustomOrder from './pages/NewCustomOrder';
import UserOrders from './pages/UserOrders';
import MetalPrices from './pages/MetalPrices';
import Users from './pages/Users';
import Login from './pages/Login';
import UserDetails from './pages/UserDetails';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
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
