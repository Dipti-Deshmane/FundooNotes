import React, { useState, useEffect } from "react";
import { Input, Card, CardBody, CardTitle, CardText, Button,DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import Tooltip from "@mui/material/Tooltip";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddAlertOutlinedIcon from '@mui/icons-material/AddAlertOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import NoteService from '../Notes/NotesService';
import Sidebar from '../Header & Sidebar/Sidebar';
import Header from '../Header & Sidebar/Header';
import './../Css/NoteDashboard.css';
import './../Css/ColorCard.css';
import ReminderService from "../Reminder/ReminderService";
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LabelCard from '../Notes/LabelCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ReminderTab = ({ reminder, onDelete }) => {
  return (
    <div className="reminder-tab">
      <span>{reminder}</span>
      <button onClick={onDelete}><CloseOutlinedIcon fontSize="small" /></button>
    </div>
  );
};

const NoteDashboard = (props) => {
  
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', description: '', color: 'white' });
  const token = localStorage.getItem('token');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPinnedNotes, setHasPinnedNotes] = useState(false);
  const [layoutMode, setLayoutMode] = useState('vertical'); // Default layout mode is vertical
  const [selectedColor, setSelectedColor] = useState({}); // State to store colors for individual notes
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [reminderDates, setReminderDates] = useState({});
  const [noteImages, setNoteImages] = useState({});
  const [showCalendar, setShowCalendar] = useState({});
  const [showLabel, setShowLabel] = useState({});
  const [remindedNotes, setRemindedNotes] = useState([]); // State to hold notes with reminders set
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [labels, setLabels] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);


  
  const checkReminder = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes
    Object.entries(reminderDates).forEach(([id, reminderDate]) => {
      const parsedReminderDate = new Date(reminderDate);
      const reminderTime = parsedReminderDate.getHours() * 60 + parsedReminderDate.getMinutes(); // Convert reminder time to minutes
      if (currentTime >= reminderTime) {
        const reminderKey = `reminderTriggered-${id}`;
        if (!localStorage.getItem(reminderKey)) {
          const updatedReminderDates = { ...reminderDates };
          delete updatedReminderDates[id];
          setReminderDates(updatedReminderDates);
          localStorage.setItem(reminderKey, 'true');
          console.log("try to toast");
          toast.info(`Reminder for note with ID ${id} has been triggered!`, {
            position: 'top-center',
            autoClose: 5000 
          });
          handleDeleteReminder(id);
        }
      } else {
        localStorage.removeItem(`reminderTriggered-${id}`);
      }
    });
  };
  
  useEffect(() => {
    checkReminder();
    const interval = setInterval(() => {
      console.log("checking reminder");
      checkReminder();
    }, 60000); 
    return () => clearInterval(interval);
  }, [reminderDates]);

  const handleToggleCalendar = (noteId) => {
    setShowCalendar({ ...showCalendar, [noteId]: !showCalendar[noteId] });
  };
  useEffect(() => {
    const storedReminderDates = JSON.parse(localStorage.getItem('reminderDates')) || {};
    const parsedReminderDates = Object.fromEntries(
      Object.entries(storedReminderDates).map(([id, date]) => [id, new Date(date).toLocaleString()])
    );
    setReminderDates(parsedReminderDates);
  }, []);

  

  useEffect(() => {
    // Load selectedColor from local storage
    const storedColors = localStorage.getItem('noteColors');
    if (storedColors) {
      setSelectedColor(JSON.parse(storedColors));
    }

    
    const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
    setNoteImages(localStorageImages);
  }, []);

  


  useEffect(() => {
    // Filter notes with reminders
    const reminded = notes.filter(note => reminderDates[note.id]);
    setRemindedNotes(reminded);
  }, [notes, reminderDates]);

  const toggleLayoutMode = () => {
    setLayoutMode(prevMode => (prevMode === 'vertical' ? 'horizontal' : 'vertical'));
  };



  const handleToggleLabel = (noteId) => {
    setShowLabel((prevShowLabel) => ({
      ...prevShowLabel,
      [noteId]: !prevShowLabel[noteId],
    }));
  };


  const handleRemoveLabel = async (id, labelName) => {
    try {
      // Remove label from selectedLabels state
      const updatedLabels = selectedLabels.filter((label) => label !== labelName);
      setSelectedLabels(updatedLabels);
  
      // Update the note without the removed label
      const updatedNote = { ...notes.find((note) => note.id === selectedNoteId) };
      updatedNote.labels = updatedLabels;
      updateNote(selectedNoteId, updatedNote);
  
      // Call API to remove label from the note
      await NoteService.removeNotesfromLabel(id, labelName, token);
      console.log('Label removed successfully:', labelName);
  
      // Fetch notes again to update the UI
      fetchNotes();
    } catch (error) {
      console.error('Error removing label:', error);
    }
  };
  
  useEffect(() => {
    fetchNotes();
  }, [token]);


  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isAddNoteOpen, newNote]);
  

  const fetchNotes = async () => {
    try {
      const data = await NoteService.fetchNotes(token);

      setNotes(data.filter(n => !n.archive).filter(n => !n.trash));

    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (newNote.title.trim() !== '' || newNote.description.trim() !== '') {
      try {
        await NoteService.addNote({ ...newNote, color: selectedColor[newNote.id] || 'white' }, token);
        fetchNotes();
        setNewNote({ title: '', description: '' });
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      await NoteService.updateNote(id, updatedNote, token);
      setNotes(notes.map(note => (note.id === id ? updatedNote : note)));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };


  const handleArchive = async (id) => {
    try {
      await NoteService.setNoteToArchive(id, token);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleTrash = async (id) => {
    try {
      await NoteService.setNoteToTrash(id, token);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error trashing note:', error);
    }
  };

  const toggleAddNote = () => {
    setIsAddNoteOpen(!isAddNoteOpen);
  };

  const handleNoteTitleChange = (e) => {
    setNewNote({ ...newNote, title: e.target.value });
  };

  const handleNoteDescriptionChange = (e) => {
    setNewNote({ ...newNote, description: e.target.value });
  };

  const handleDocumentClick = (event) => {
    const addNoteElement = document.querySelector('.add-note');
    if (!addNoteElement.contains(event.target) && isAddNoteOpen) {
      if (newNote.title.trim() !== '' || newNote.description.trim() !== '') {
        addNote();
        setNewNote({ title: '', description: '' });
      }
      setIsAddNoteOpen(false);
    }
  };
  const handleColorChange = (id, color) => {
    setSelectedColor(prevSelectedColor => ({
      ...prevSelectedColor,
      [id]: color
    }));
    localStorage.setItem('noteColors', JSON.stringify({
      ...selectedColor,
      [id]: color
    }));
    if (props.note) {
      props.updateColor(color, id);
    }
  };

  const handleColorIconClick = (noteId) => {
    setSelectedNoteId(noteId === selectedNoteId ? null : noteId);
  }

  const handlePin = async id => {
    try {
      await NoteService.pinNote(id, token);
      fetchNotes();
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleUnpin = async id => {
    try {
      await NoteService.unPinNote(id, token);
      fetchNotes();
    } catch (error) {
      console.error('Error unpinning note:', error);
    }
  };


  const handleDeleteReminder = async (id) => {
    try {
      await ReminderService.deleteReminder(id, token);
      // Remove the reminder date for the specified note ID
      const updatedReminderDates = { ...reminderDates };
      delete updatedReminderDates[id];
      setReminderDates(updatedReminderDates);
      localStorage.setItem('reminderDates', JSON.stringify(updatedReminderDates));
      console.log('Reminder deleted successfully for note with ID:', id);
  
      // Remove the reminder from the notes state
      const updatedNotes = [...notes];
      const noteIndex = updatedNotes.findIndex(note => note.id === id);
      if (noteIndex !== -1) {
        // Remove the reminder property from the note
        updatedNotes[noteIndex] = {
          ...updatedNotes[noteIndex],
          reminder: null // Assuming reminder is the property holding the reminder data
        };
        setNotes(updatedNotes);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleSetReminder = async (id) => {
    try {
      const selectedDate = document.getElementById(`dateOfReminder-${id}`).value;
      const selectedTime = document.getElementById(`remindertime-${id}`).value;
      if (selectedDate && selectedTime) {
        const selectedDateTime = `${selectedDate}T${selectedTime}`;
        await ReminderService.setReminder(id, { reminder: selectedDateTime }, token);
        const newReminderDates = { ...reminderDates, [id]: new Date(selectedDateTime) };
            setReminderDates(newReminderDates);
            localStorage.setItem('reminderDates',JSON.stringify(newReminderDates));
        console.log('Reminder set successfully for note with ID:', id);
        handleToggleCalendar(id);
      }
    } catch (error) { 
      console.error('Error setting reminder:', error);
    }
  };
 

  const handleImageUpload = (event, id) => {
    try {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const imageUrl = reader.result;
        setNoteImages(prevImages => ({
          ...prevImages,
          [id]: imageUrl
        }));
        const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
        localStorageImages[id] = imageUrl;
        localStorage.setItem('noteImages', JSON.stringify(localStorageImages));
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  const handleDelete = (id) => {
    const updatedNoteImages = { ...noteImages };
    delete updatedNoteImages[id];
    setNoteImages(updatedNoteImages); // Update component state
    localStorage.setItem('noteImages', JSON.stringify(updatedNoteImages)); // Update local storage
  };



  const handleSearch = async (query) => {
    setSearchQuery(query); // Update search query state
    try {
      if (query.trim() === '') {
        fetchNotes(); // Fetch all notes again when search query is empty
      } else {
        const searchResults = await NoteService.searchNotes(query, token); // Call searchNotes function
        setNotes(searchResults); // Update notes state with search results
      }
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };


  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);


  return (
    <div className="note-dashboard">
    <div className="App">
      <Header handleSearch={handleSearch} layoutMode={layoutMode} toggleLayoutMode={toggleLayoutMode} />
      <div className="main">
        <Sidebar />
        <div className="notes-container">
          <div className="add-note">
            {isAddNoteOpen ? (
              <>
                <div>
                  <Input type="text" placeholder="Title" value={newNote.title} onChange={handleNoteTitleChange} autoFocus />
                </div>
                <div>
                  <textarea style={{ marginTop: 20 }} placeholder="Take a note..." value={newNote.description} onChange={handleNoteDescriptionChange} />
                </div>
              </>
            ) : (
              <div className="take-note" onClick={toggleAddNote}>
                Take a note...
              </div>
            )}
          </div>
          {/* Pinned notes */}
          <div className="pinned-notes-container">
            {pinnedNotes.length > 0 && (
              <div className="pinned-header">
                <h2>PINNED</h2>
              </div>
            )}<div className='header-card'>
              {pinnedNotes.map(note => (
                 <div key={note.id} className="note-card" style={{ marginLeft: layoutMode === 'vertical' ? '0' : '250px', width: layoutMode === 'vertical' ? '230px' : '49%', marginRight: layoutMode === 'horizontal' ? '20px' : '25px' }}>
                  <div style={{ position: 'relative' }}>
                    {noteImages[note.id] && (
                      <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
                        <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Button
                          className="delete-button"
                          style={{ border: 'none', position: 'absolute', bottom: '5px', right: '5px' }}
                          outline
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                          title="Permanently Delete"
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Card className="card" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                    <CardBody className="note-card-body" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                      <CardTitle contentEditable onBlur={(e) => updateNote(note.id, { ...note, title: e.target.innerText })}>
                        {note.title}
                        <FontAwesomeIcon title="unpin note" icon={faThumbtack} size="sm" className="pin-icon" onClick={() => handleUnpin(note.id)} />
                      </CardTitle>
                      <CardText contentEditable suppressContentEditableWarning className="card-text" onBlur={(e) => {
                      if (!reminderDates[note.id]) {
                          updateNote(note.id, { ...note, description: e.target.innerText });
                      }}}>
                        
                        {note.description}
                        </CardText>
                        <div className='label-container'>
                        {Object.keys(note.labelModelList).length > 0 && (
                          <div className='label'>
                            {Object.keys(note.labelModelList).map((labelId) => (<> <span key={labelId}>{note.labelModelList[labelId].labelName}</span>
                          
                          <button style={{padding:5}} className='label-button' onClick={() => handleRemoveLabel(note.id,note.labelModelList[labelId].labelName)}><CloseOutlinedIcon fontSize="smaller" /></button>
                            </>
                            
                            ))}</div>
                        )}
                      </div>
                      {/* Render reminder tab if reminder is set */}
                      {reminderDates[note.id] && <ReminderTab reminder={reminderDates[note.id].toLocaleString()} onDelete={() => handleDeleteReminder(note.id)} />}
                     
                      <div className="button-container">
                        <Button  style={{marginLeft:0}}outline size="sm" onClick={() => handleTrash(note.id)} title="Trash">
                          <DeleteOutlinedIcon fontSize="small" />
                        </Button>
                        <Button outline size="sm" onClick={() => handleArchive(note.id)} title="Archive">
                          <ArchiveOutlinedIcon fontSize="small" />
                        </Button>
                        <div className="reminder-container">
                          <Button color="info" outline size="sm" title="Remind me" onClick={() => handleToggleCalendar(note.id)}>
                            <AddAlertOutlinedIcon color="primary" fontSize="small" />
                          </Button>
                          {showCalendar[note.id] && (
                          <div className="ReminderCard">
                          <h className="reminder-title">Pick date & time</h>
                            <div className="reminder-inputs">
                              <div className="reminder-input-group">
                                <label htmlFor="dateOfReminder">Select Date</label>
                                <input type="date" id={`dateOfReminder-${note.id}`} name={`dateOfReminder-${note.id}`} className="reminder-input" />
                              </div>
                            <div className="reminder-input-group">
                              <label htmlFor="remindertime">Select Time</label>
                              <input type="time" id={`remindertime-${note.id}`} name={`remindertime-${note.id}`} className="reminder-input" />
                            </div>
                          <button style={{borderRadius:50,marginLeft:180,width:50,padding:7}} onClick={() => handleSetReminder(note.id)}>Save</button>
                            </div>
                          </div> )}
                        </div>

                        <Button>
                          <label htmlFor={`image-upload-${note.id}`} className="image-upload-button">
                            <ImageOutlinedIcon fontSize="small" />
                            <input id={`image-upload-${note.id}`} type="file" onChange={(e) => handleImageUpload(e, note.id)} style={{ display: 'none' }} />
                          </label>
                        </Button>

                        <Button size="sm" title="Background Options" onClick={() => handleColorIconClick(note.id)}>
                          <PaletteOutlinedIcon fontSize="small" />
                        </Button>
                        <Button style={{ padding: 5 }}>
                          <Tooltip title="Add Label">
                            <LocalOfferOutlinedIcon fontSize="small" onClick={() => handleToggleLabel(note.id)} />
                          </Tooltip>
                        </Button>
                        {showLabel[note.id] && (<LabelCard onUpdate={fetchNotes} noteId={note.id} />
                        )}
                                
                      </div>
                    </CardBody>
                  </Card>
                  <div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none' }}>
                    <Card className="ColorCard">
                      <CardBody className="ColorCardContainer">
                        <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(note.id, 'white')}></div>
                        <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(note.id, '#EFB495')}></div>
                        <div className="color-option" style={{ backgroundColor: '#E2BEBE' }} onClick={() => handleColorChange(note.id, '#E2BEBE')}></div>
                        <div className="color-option" style={{ backgroundColor: '#B5C0D0' }} onClick={() => handleColorChange(note.id, '#B5C0D0')}></div>
                        <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(note.id, '#EADFB4')}></div>
                        <div className="color-option" style={{ backgroundColor: '#92C7CF' }} onClick={() => handleColorChange(note.id, '#92C7CF')}></div>
                        <div className="color-option" style={{ backgroundColor: '#EC7700' }} onClick={() => handleColorChange(note.id, '#EC7700')}></div>
                        <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(note.id, '#9CAFAA')}></div>
                        <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(note.id, '#D37676')}></div>
                        <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(note.id, '#A5DD9B')}></div>
                        <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(note.id, '#F5DD61')}></div>
                        <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(note.id, '#FC819E')}></div>
                        <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(note.id, '#7469B6')}></div>
                        <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(note.id, '#FFE6E6')}></div>

                      </CardBody>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div> <div className="unpinned-notes-container">
            {/* Unpinned notes */}
            {unpinnedNotes.length > 0 && (
              <div className="unpinned-header">
                <h2>NOTES</h2>
              </div>
            )}
            <div className='header-card'>
              {unpinnedNotes.map(note => (
              <div key={note.id} className="note-card"  style={{ marginLeft: layoutMode === 'vertical' ? '0' : '250px',  width: layoutMode === 'vertical' ? '230px' : '49%', marginRight: layoutMode === 'horizontal' ? '12px' : '25px' }}>
                  <div style={{ position: 'relative' }}>
                    {noteImages[note.id] && (
                      <div style={{ position: 'relative', width: '100%', height: '140px', overflow: 'hidden' }}>
                        <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <Button
                          className="delete-button"
                          style={{ border: 'none', position: 'absolute', bottom: '5px', right: '5px' }}
                          outline
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                          title="Permanently Delete"
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Card className="card" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                    <CardBody className="card-body" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                      <CardTitle className="card-title" contentEditable onBlur={(e) => updateNote(note.id, { ...note, title: e.target.innerText })}>
                        {note.title}
                        <Tooltip title="Pin Note" placement="bottom" PopperProps={{ style: { left: 100 } }}>
                          <PushPinOutlinedIcon fontSize="medium" className="pin-icon" title="pin note" onClick={() => handlePin(note.id)} />
                        </Tooltip>
                      </CardTitle>
                      <CardText contentEditable suppressContentEditableWarning className="card-text" onBlur={(e) => {
                        if (!reminderDates[note.id]) {
                            updateNote(note.id, { ...note, description: e.target.innerText });
                        }
                    }}>
                        {note.description}
                        </CardText>
                        <div className='label-container'>
                            {Object.keys(note.labelModelList).length > 0 && (
                              <div className='label'>
                                {Object.keys(note.labelModelList).map((labelId) => (<> <span key={labelId}>{note.labelModelList[labelId].labelName}</span>
                              
                              <button style={{padding:5}} className='label-button' onClick={() => handleRemoveLabel(note.id,note.labelModelList[labelId].labelName)}><CloseOutlinedIcon fontSize="smaller" /></button>
                                </>
                                
                                ))}</div>
                            )}
                          </div>
                        {/* Render reminder tab if reminder is set */}
                        {reminderDates[note.id] && <ReminderTab reminder={reminderDates[note.id].toLocaleString()} onDelete={() => handleDeleteReminder(note.id)} />}
                  
                      <div className="button-container">
                        <Button style={{marginLeft:0}}outline size="sm" onClick={() => handleTrash(note.id)} title="Trash">
                          <DeleteOutlinedIcon fontSize="small" />
                        </Button>
                        <Button color="primary" outline size="sm" onClick={() => handleArchive(note.id)} title="Archive">
                          <ArchiveOutlinedIcon fontSize="small" />
                        </Button>

                        <div className="reminder-container">
                          <Button color="info" outline size="sm" title="Remind me" onClick={() => handleToggleCalendar(note.id)}>
                            <AddAlertOutlinedIcon color="primary" fontSize="small" />
                          </Button>
                          {showCalendar[note.id] && (
                          <div className="ReminderCard">
                          <h className="reminder-title">Pick date & time</h>
                            <div className="reminder-inputs">
                              <div className="reminder-input-group">
                                <label htmlFor="dateOfReminder">Select Date</label>
                                <input type="date" id={`dateOfReminder-${note.id}`} name={`dateOfReminder-${note.id}`} className="reminder-input" />
                              </div>
                            <div className="reminder-input-group">
                              <label htmlFor="remindertime">Select Time</label>
                              <input type="time" id={`remindertime-${note.id}`} name={`remindertime-${note.id}`} className="reminder-input" />
                            </div>
                          <button style={{borderRadius:50,marginLeft:180,width:50,padding:7}} onClick={() => handleSetReminder(note.id)}>Save</button>
                            </div>
                          </div> )}
                        </div>



                         <Button>
                          <label htmlFor={`image-upload-${note.id}`} className="image-upload-button">
                            <ImageOutlinedIcon fontSize="small" />
                            <input id={`image-upload-${note.id}`} type="file" onChange={(e) => handleImageUpload(e, note.id)} style={{ display: 'none' }} />
                          </label>
                        </Button>

                        <Button size="sm" title="Background Options" onClick={() => handleColorIconClick(note.id)}>
                          <PaletteOutlinedIcon fontSize="small" />
                        </Button>
                        <Button style={{ padding: 5 }}>
                          <Tooltip title="Add Label">
                            <LocalOfferOutlinedIcon fontSize="small" onClick={() => handleToggleLabel(note.id)} />
                          </Tooltip>
                        </Button>
                        {showLabel[note.id] && (<LabelCard onUpdate={fetchNotes} noteId={note.id} />
                        )}
                 

                      </div>
                    </CardBody>
                  </Card>

                  <div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none' }}>
                    <Card className="ColorCard">
                      <CardBody className="ColorCardContainer">
                        <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(note.id, 'white')}></div>
                        <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(note.id, '#EFB495')}></div>
                        <div className="color-option" style={{ backgroundColor: '#E2BEBE' }} onClick={() => handleColorChange(note.id, '#E2BEBE')}></div>
                        <div className="color-option" style={{ backgroundColor: '#B5C0D0' }} onClick={() => handleColorChange(note.id, '#B5C0D0')}></div>
                        <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(note.id, '#EADFB4')}></div>
                        <div className="color-option" style={{ backgroundColor: '#92C7CF' }} onClick={() => handleColorChange(note.id, '#92C7CF')}></div>
                        <div className="color-option" style={{ backgroundColor: '#EC7700' }} onClick={() => handleColorChange(note.id, '#EC7700')}></div>
                        <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(note.id, '#9CAFAA')}></div>
                        <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(note.id, '#D37676')}></div>
                        <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(note.id, '#A5DD9B')}></div>
                        <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(note.id, '#F5DD61')}></div>
                        <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(note.id, '#FC819E')}></div>
                        <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(note.id, '#7469B6')}></div>
                        <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(note.id, '#FFE6E6')}></div>

                      </CardBody>
                    </Card>
                  </div>


                </div>
              ))}</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );

};

export default NoteDashboard;
