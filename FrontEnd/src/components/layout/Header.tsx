import React from 'react';
import { Link as RouterLink} from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem, CircularProgress} from '@mui/material';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Icon for upcoming maintenances
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ backgroundColor: '#18181B' }}>
        <IconButton
          edge="start"
          color="inherit" // Will inherit color from AppBar (typically text.primary)
          aria-label="logo"
          component={RouterLink}
          to="/home"
          sx={{ mr: 1 }}
        >
          <TrackChangesIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
          KeepTrack
        </Typography>

        {isLoading ? (
          <CircularProgress color="inherit" size={24} /> // Inherits AppBar's text color
        ) : isAuthenticated && user ? (
          <>
            <Button className="MuiButton-divider" color='inherit' component={RouterLink} to="/home">
              Home
            </Button>
            <Button 
              className="MuiButton-divider" 
              color='inherit' 
              component={RouterLink} 
              to="/upcoming-maintenances"
              startIcon={<EventNoteIcon />}
            >
              Upcoming
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit" // Icon color
            >
              <Avatar sx={{ 
                  bgcolor: 'secondary.main', // Uses theme.palette.secondary.main
                  color: 'secondary.contrastText', // Uses theme.palette.secondary.contrastText
                  width: 32, 
                  height: 32, 
                  fontSize: '0.875rem' 
                }}>
                {getInitials(user.name)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{ mt: '45px' }}
              PaperProps={{
                sx: {
                  bgcolor: 'background.paper', // Ensure menu paper uses dark theme
                },
              }}
            >
              <MenuItem disabled sx={{opacity: 0.7}}>
                <Typography variant="subtitle2" color="text.primary">{user.name}</Typography>
              </MenuItem>
              <MenuItem disabled sx={{opacity: 0.7, mt: -1 /* reduce space */}}>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </MenuItem>
              {/* <MenuItem onClick={handleProfile}>Profile</MenuItem> */}
              <MenuItem onClick={handleLogout} sx={{color: 'primary.main'}}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button className="MuiButton-divider" color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button className="MuiButton-divider" color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;