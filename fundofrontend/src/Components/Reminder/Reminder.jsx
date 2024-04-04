import React, { useEffect, useState } from 'react';
import NoteService from '../Notes/NotesService';
import ReminderService from './ReminderService';
import { Input, Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import AddAlertOutlinedIcon from '@mui/icons-material/AddAlertOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from '@mui/material/Tooltip';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './../Css/NoteDashboard.css';
import { useLocation } from "react-router-dom";
import Header from "../Header & Sidebar/Header";
import Sidebar from "../Header & Sidebar/Sidebar";
const Reminder = (props) => {

  
  const [reminders, setReminders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', description: '',color: 'white' });
  const [reminderDates, setReminderDates] = useState({}); // State to store reminder dates for each note
  const token = localStorage.getItem('token');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [hasPinnedNotes, setHasPinnedNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('vertical'); // Default layout mode is vertical
  const [selectedColor, setSelectedColor] = useState({});   // State to store colors for individual notes
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [noteImages, setNoteImages] = useState({}); 
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState({});
  const [showLabel, setShowLabel] = useState({});  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

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
    // Load selectedColor from local storage
    const storedColors = localStorage.getItem('noteColors');
    if (storedColors) {
      setSelectedColor(JSON.parse(storedColors));
    }
  }, []);

  
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
  
    const handleSetReminder = async (id, reminder) => {
      try {
        const selectedDate = document.getElementById(`dateOfReminder-${id}`).value;
        const selectedTime = document.getElementById(`remindertime-${id}`).value;
        if (selectedDate && selectedTime) {
          const selectedDateTime = `${selectedDate} ${selectedTime}`;
          const newReminderDates = { ...reminderDates, [id]: new Date(selectedDateTime) };
          setReminderDates(newReminderDates);
          localStorage.setItem('reminderDates',JSON.stringify(newReminderDates));
          await ReminderService.setReminder(id, { reminder: selectedDateTime }, token);
          console.log('Reminder set successfully for note with ID:', id);
          handleToggleCalendar(id);
        }
      } catch (error) { 
        console.error('Error setting reminder:', error);
      }
    };
  
    const handleDeleteReminder = async (id) => {
    try {
      await ReminderService.deleteReminder(id, token);
      
      console.log('Reminder deleted successfully for note with ID:', id);
  
   
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  // Method to fetch reminder notes by ID
  const fetchReminderNotes = async (reminderId) => {
    try {
      const reminder = await ReminderService.getReminderById(reminderId, token);
      console.log('Reminder notes:', reminder.notesModel);
    } catch (error) {
      console.error('Error fetching reminder notes:', error);
    }
  };

  // Method to fetch all reminders
  const fetchAllReminders = async () => {
    try {
      const reminders = await ReminderService.getAllReminders(token);
      setReminders(reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  // Fetch all reminders on component mount
  useEffect(() => {
    fetchAllReminders();
  }, []);

  
  const handleToggleLabel = (noteId) => {
    setShowLabel((prevShowLabel) => ({
      ...prevShowLabel,
      [noteId]: !prevShowLabel[noteId],
    }));
  };

  const toggleLayoutMode = () => {
    setLayoutMode(prevMode => (prevMode === 'vertical' ? 'horizontal' : 'vertical'));
  };

  const toggleLabelDropdown = () => {
    setIsLabelDropdownOpen(!isLabelDropdownOpen);
  };

  const handleRemoveLabel = async (id,labelName) => {
    try {
      const updatedLabels = selectedLabels.filter((label) => label !== labelName);
      setSelectedLabels(updatedLabels);
      // Update the note without the removed label
      const updatedNote = { ...notes.find((note) => note.id === selectedNoteId) };
      updatedNote.labels = updatedLabels; 
      // Persist updated labels to local storage
      fetchReminderNotes();
      localStorage.setItem('selectedLabels', JSON.stringify(updatedLabels));
      await NoteService.removeNotesfromLabel(id, labelName,token);
      console.log(id,labelName);
    } catch (error) {
      console.error("Error removing label:", error);
    }
  };
  

  useEffect(() => {
    // Load selected labels from local storage
    const storedLabels = JSON.parse(localStorage.getItem('selectedLabels')) || [];
    setSelectedLabels(storedLabels);
  }, []);
  
  
  useEffect(() => {
    fetchNotes();
  }, [token]);

  useEffect(() => {
    const storedColors = localStorage.getItem('noteColors');
    if (storedColors) {
      setSelectedColor(JSON.parse(storedColors));
    }

    const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
    setNoteImages(localStorageImages);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isAddNoteOpen, newNote]);

  const fetchNotes = async () => {
    try {
      const data = await NoteService.fetchNotes(token);
      setNotes(data.filter(note => !note.archive).filter(note => !note.trash));
      setHasPinnedNotes(data.some(note => note.pinned));
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    // Check if title or description is not empty
    if (newNote.title.trim() !== '' || newNote.description.trim() !== '') {
      try {
        const newNoteObject = {
          title: newNote.title,
          description: newNote.description,
          color: 'white' // Set default color to white
        };
        await NoteService.addNote(newNoteObject, token);
        fetchReminderNotes();
        setNewNote({ title: '', description: '' });
  
        // Reset image state for new note
        setNoteImages(prevNoteImages => {
          const updatedNoteImages = { ...prevNoteImages };
          delete updatedNoteImages[notes.length + 1]; // Assuming the new note ID is the next available number
          return updatedNoteImages;
        });
  
        // Clear image data associated with new note from local storage
        const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
        delete localStorageImages[notes.length + 1]; // Assuming the new note ID is the next available number
        localStorage.setItem('noteImages', JSON.stringify(localStorageImages));
  
        // Log the updated state and local storage to verify the reset
        console.log("Note Images State:", noteImages);
        console.log("Local Storage (noteImages):", localStorageImages);
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
    const addNoteElement =document.querySelector('.add-note');

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

  const handlePin = async id => {
    try {
      await NoteService.pinNote(id, token);
      fetchReminderNotes(); 
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleUnpin = async id => {
    try {
      await NoteService.unPinNote(id, token);
      fetchReminderNotes(); 
    } catch (error) {
      console.error('Error unpinning note:', error);
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
          [id]: imageUrl // Store the image URL with the note ID as the key
        }));
        // Store the note images in local storage
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
  
  // Function to handle deleting note images
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






  const location = useLocation();

    return (
      <div className="App">
      <Header />
     <div className="main">
     <Sidebar />

     <div className="notes-container">
      <div className="add-note">
            {isAddNoteOpen ? (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="Title"
                    value={newNote.title}
                    onChange={handleNoteTitleChange}
                    autoFocus
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Take a note..."
                    value={newNote.description}
                    onChange={handleNoteDescriptionChange}
                  />
                </div>
              </>
            ) : (
              <div className="take-note" onClick={toggleAddNote}>
                Take a note...
              </div>
            )}
          </div><div className='header-card'>
        {reminders.map((reminder) => (
        <div key={reminder.reminderId} className="note-card" style={{ marginLeft: layoutMode === 'vertical' ? '0' : '272px', width: layoutMode === 'vertical' ? '230px' : '51.4%', marginRight: layoutMode === 'horizontal' ? '20px' : '20px' }}>
        <Card className="card" style={{ backgroundColor: selectedColor[reminder.reminderId] || 'white' }}>
    <CardBody className="note-card-body" style={{ backgroundColor: selectedColor[reminder.reminderId] || 'white' }}>
    <CardTitle contentEditable suppressContentEditableWarning className="card-title" onBlur={(e,note) => updateNote(note.id, { ...note, title: e.target.innerText })}>{reminder.notesModel.title}
     <Tooltip title="Unpin note"><FontAwesomeIcon icon={faThumbtack} style={{padding:8}} size="1x" className="pin-icon" onClick={(note) => handleUnpin(note.id)} /></Tooltip> 
    </CardTitle>
    <CardText contentEditable suppressContentEditableWarning className="card-text"> {reminder.notesModel.description}</CardText>
    <div className="reminder-tab"><span>
    {reminder.reminder ? new Date(reminder.reminder).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(",", "") : ''}</span><button onClick={handleDeleteReminder}><CloseOutlinedIcon fontSize="small" /></button></div>
  <div className="button-container">
  <Button style={{padding:5}} onClick={(note) => handleTrash(note.id)}>
    <Tooltip title="Trash"> <DeleteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={(note) => handleArchive(note.id)}>
    <Tooltip title="Archive">  <ArchiveOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}}   >
    <Tooltip title="Remind me"> <AddAlertOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    {showCalendar[reminder.reminderId] && (
      <div className="ReminderCard">
      <h className="reminder-title">Pick date & time</h>
        <div className="reminder-inputs">
          <div className="reminder-input-group">
            <label htmlFor="dateOfReminder">Select Date</label>
            <input type="date" id={`dateOfReminder-${reminder.reminderId}`} name={`dateOfReminder-${reminder.reminderId}`} className="reminder-input" />
          </div>
        <div className="reminder-input-group">
          <label htmlFor="remindertime">Select Time</label>
          <input type="time" id={`remindertime-${reminder.reminderId}`} name={`remindertime-${reminder.reminderId}`} className="reminder-input" />
        </div>
      <button style={{borderRadius:50,marginLeft:180,width:50,padding:7}} onClick={() => handleSetReminder(reminder.reminderId)}>Save</button>
        </div>
      </div> )}
    <Button style={{padding:5}}><label htmlFor={`image-upload-${reminder.reminderId}`}>
    <Tooltip title="Add Image"> <ImageOutlinedIcon fontSize="small" style={{cursor:'pointer'}} /></Tooltip> 
      <input id={`image-upload-${reminder.reminderId}`} type="file" onChange={(e,note) => handleImageUpload(e, note.id)} style={{ display: 'none' }} /></label>
    </Button>
    <Button style={{padding:5}} onClick={(note) => handleColorIconClick(note.id)}>
    <Tooltip title="Background Options"> <PaletteOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
    <Button style={{padding:5}} onClick={(note) => handleToggleLabel(note.id)}>
    <Tooltip title="Add Label"><LocalOfferOutlinedIcon fontSize="small" /> </Tooltip>
    </Button>
  </div>
  </CardBody>
</Card>
<div className="color-options" style={{ display: selectedNoteId === reminder.reminderId ? 'block' : 'none' }}>
  <Card className="ColorCard">
    <CardBody className="ColorCardContainer">
      <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(reminder.id, 'white')}></div>
      <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(reminder.id, '#EFB495')}></div>
       <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(reminder.id, '#EADFB4')}></div>
      <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(reminder.id, '#9CAFAA')}></div>
      <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(reminder.id, '#D37676')}></div>
      <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(reminder.id, '#A5DD9B')}></div>
      <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(reminder.id, '#F5DD61')}></div>
      <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(reminder.id, '#FC819E')}></div>
      <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(reminder.id, '#7469B6')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(reminder.id, '#FFE6E6')}></div>
      <div className="color-option" style={{ backgroundColor: '#ADD8E6' }} onClick={() => handleColorChange(reminder.id, '#ADD8E6')}></div>
      <div className="color-option" style={{ backgroundColor: '#F0E68C' }} onClick={() => handleColorChange(reminder.id, '#F0E68C')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFDAB9' }} onClick={() => handleColorChange(reminder.id, '#FFDAB9')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFA07A' }} onClick={() => handleColorChange(reminder.id, '#FFA07A')}></div>
      <div className="color-option" style={{ backgroundColor: '#D9B9EB' }} onClick={() => handleColorChange(reminder.id, '#D9B9EB')}></div>
      <div className="color-option" style={{ backgroundColor: '#B9EBD9' }} onClick={() => handleColorChange(reminder.id, '#B9EBD9')}></div>
      <div className="color-option" style={{ backgroundColor: '#D9EBB9' }} onClick={() => handleColorChange(reminder.id, '#D9EBB9')}></div>
      <div className="color-option" style={{ backgroundColor: '#C8E6C9' }} onClick={() => handleColorChange(reminder.id, '#C8E6C9')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFD3E0' }} onClick={() => handleColorChange(reminder.id, '#FFD3E0')}></div>
      <div className="color-option" style={{ backgroundColor: '#C9CCF0' }} onClick={() => handleColorChange(reminder.id, '#C9CCF0')}></div>
    </CardBody>
  </Card>
  </div>   
        
         </div>
        ))}</div>
        </div>
  
     </div>

</div>
  );
};

export default Reminder;