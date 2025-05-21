import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Stack from '@mui/material/Stack';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';

import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from local storage
    navigate('/login'); // Redirect to the login page after logout
  }

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'flex-end',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
        {/* <Search /> */}
        {/* <CustomDatePicker /> */}
        {/* <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton> */}
        <ColorModeIconDropdown />
        <Button variant="outlined" onClick={handleLogout} startIcon={<LogoutRoundedIcon />}>
          Logout
        </Button>
    </Stack>
  );
}
