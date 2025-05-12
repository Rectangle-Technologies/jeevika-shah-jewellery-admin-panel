import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import DiamondIcon from '@mui/icons-material/Diamond';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useLocation, useNavigate } from 'react-router-dom';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, path: '/' },
  { text: 'Products', icon: <DiamondIcon />, path: '/products' },
  { text: 'All Orders', icon: <InventoryIcon />, path: '/all-orders' },
  { text: 'User Orders', icon: <InventoryIcon />, path: '/user-orders' },
  { text: 'Inquiries', icon: <AssignmentRoundedIcon />, path: '/inquiries' },
  { text: 'Users', icon: <PeopleRoundedIcon />, path: '/users' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block', mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack >
  );
}
