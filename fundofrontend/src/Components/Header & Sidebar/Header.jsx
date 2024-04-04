import React, { useState, useEffect } from "react";
import FundooLogo from '../Images/FundooLogo.png';
import './../Css/NoteDashboard.css';
import { Link } from 'react-router-dom';
import NoteService from "../Notes/NotesService";
import { ViewStreamOutlined as ViewStreamOutlinedIcon } from '@mui/icons-material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { GridView as GridViewIcon } from '@mui/icons-material';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Button } from "reactstrap";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const Header = ({ layoutMode, toggleLayoutMode, handleSearch }) => {
  const [showUserCard, setShowUserCard] = useState(false);
  const [username, setUsername] = useState('');
  const [searchText, setSearchText] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const token = localStorage.getItem('token');

  const toggleUserCard = () => {
    setShowUserCard(!showUserCard);
  };

  const firstInitial = username ? username.charAt(0).toUpperCase() : '';


  const removeProfilePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem('profilePicture'); // Remove profile picture from localStorage
  };

  useEffect(() => {
    fetchUsername();
    loadProfilePicture(); // Load profile picture from localStorage when component mounts
  }, [token]);

  const fetchUsername = async () => {
    try {
      const response = await NoteService.fetchUsername(token);
      setUsername(response);
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload(); // Reload the page when the refresh icon is clicked
  };

  const onSearch = (e) => {
    const searchTextValue = e.target.value
    setSearchText(searchTextValue);
    handleSearch(searchTextValue); // Call the handleSearch function passed from Note component
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
        localStorage.setItem('profilePicture', reader.result); // Store profile picture in localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  const loadProfilePicture = () => {
    const storedProfilePicture = localStorage.getItem('profilePicture');
    if (storedProfilePicture) {
      setProfilePicture(storedProfilePicture);
    }
  };

  return (
    <header className="header" style={{ backgroundColor: 'white' }}>
      <div className="logo-container">
        <img src={FundooLogo} alt="Fundoo Logo" className="logo" />
        <h1 className="logo-text">Fundoo Notes</h1>
      </div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={onSearch}
          className="search-input"
        />
        <RefreshOutlinedIcon className="refresh" fontSize="medium" style={{ cursor: 'pointer', color: '#555', marginLeft: 160, marginTop: 30 }} onClick={handleRefresh} />
        <div className="layout-toggle" onClick={toggleLayoutMode}>
          {layoutMode === 'vertical' ? (
            <ViewStreamOutlinedIcon fontSize="medium" />
          ) : (
            <GridViewIcon fontSize="medium" />
          )}   
        </div>
        <SettingsOutlinedIcon  className="setting" style={{ cursor: 'pointer', color: '#555', marginTop: 32 }} fontSize="medium" />
      </div>

        <div className="user-circle" onClick={toggleUserCard}>
        {profilePicture ? (
          <>
            <img src={profilePicture} alt="Profile" className="profile-picture" />
  
            <Button className="trash-icon" outline size="sm" onClick={removeProfilePicture}>
            <HighlightOffIcon fontSize="small" />
             </Button>
  
          </>
        ) : (
          firstInitial
        )}
      </div>


      {showUserCard && (
        <div className="user-card">
          <div className="user-info">
            <p>{username}</p>
          </div>
          <div className="profile-button-container">
            <input  className="pic" type="file" accept="image/*" id="profile-picture-input" onChange={handleImageUpload} style={{ display: 'none' }} />
            <label htmlFor="profile-picture-input" className="profile-picture-label">
              Add Profile Picture
            </label>
          </div>
          <div className="sign-out">
            <Link className="logout-button" to="/">
              Logout
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
