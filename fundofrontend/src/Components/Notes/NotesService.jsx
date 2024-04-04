import axios from 'axios';

import base_url from '../../Services/helper';

const NoteService = {
  fetchNotes: async (token) => {
    try {
      const response = await axios.get(`${base_url}/notes/user/get`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  searchNotes: async (keyword, token) => {
    try {
      const response = await axios.get(`${base_url}/notes/getnotebytitle/${keyword}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  addNote: async (newNote, token) => {
    try {
      const response = await axios.post(`${base_url}/notes/user/createNote`, newNote, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  updateNote: async (id, updatedNote, token) => {
    try {
      const response = await axios.put(`${base_url}/notes/updatenote/${id}`, updatedNote, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  deleteNote: async (id, token) => {
    try {
      await axios.delete(`${base_url}/notes/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  fetchUsername: async (token) => {
    try {
      const response = await axios.get(`${base_url}/user/email`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching username:', error);
      throw error;
    }
  },

  deleteAllNotes: async (token) => {
    try {
      await axios.delete(`${base_url}/notes/delete`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting all notes:', error);
      throw error;
    }
  },
  pinNote: async (id, token) => {
    try {
      await axios.put(`${base_url}/notes/setPinned/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error pinning note:', error);
      throw error;
    }
  },
  
  unPinNote: async (id, token) => {
    try {
      await axios.put(`${base_url}/notes/setunpinned/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error unpinning note:', error);
      throw error;
    }
  },

  fetchArchivedNotes: async (token) => {
    try {
      const response = await axios.get(`${base_url}/notes/getarchived`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching archived notes:', error);
      throw error;
    }
  },

  fetchTrashedNotes: async (token) => {
    try {
      const response = await axios.get(`${base_url}/notes/gettrashed`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching archived notes:', error);
      throw error;
    }
  },

  setNoteToArchive: async (id, token) => {
    try {
      await axios.put(`${base_url}/notes/setarchive/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return "Note Archived";
    } catch (error) {
      console.error('Error setting note to archive:', error);
      throw error;
    }
  },

  setNoteToUnArchive: async (id, token) => {
    try {
      await axios.put(`${base_url}/notes/setunarchive/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return "Note Unarchived";
    } catch (error) {
      console.error('Error setting note to unarchive:', error);
      throw error;
    }
  },

  setNoteToUnTrash: async (id, token) => {
    try {
      await axios.put(`${base_url}/notes/setuntrash/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return "Note Untrashed";
    } catch (error) {
      console.error('Error setting note to untrash:', error);
      throw error;
    }
  },

  setNoteToTrash: async (id, token) => {
    try {
      await axios.put(`${base_url}/notes/settrash/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return "Note Trashed";
    } catch (error) {
      console.error('Error setting note to trash:', error);
      throw error;
    }
  },

  addNotesToLabel: async (id, labelName, token) => {
    try {
      console.log(id,labelName,token)
      const response = await axios.put(`http://localhost:8080/notes/setlabel/${id}/${labelName}`, labelName,  {  headers: {  Authorization: `Bearer ${token}`}});
       
        console.log(response.data)
      return response.data.message;
    } catch (error) {
      console.error('Error setting label to note:', error);
      throw error; // Rethrow the error to be caught by the caller
    }
  },


  removeNotesfromLabel: async (id, labelName,token) => {
    try {
      axios.put(`${base_url}/notes/removelabel/${id}/${labelName}`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return "Note removed from label.";
    } catch (error) {
      console.error('Error removing label from note:', error);
      throw error;
    }
  },

  getLabelNamesByNoteId: async (id) => {
    try {
      const response = await axios.get(`${base_url}/notes/getlabelname/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching label names by note id:', error);
      throw error;
    }
  }
};
 

export default NoteService;
