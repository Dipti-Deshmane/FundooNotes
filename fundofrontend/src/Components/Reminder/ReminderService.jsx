import base_url from "../../Services/helper";
import axios from "axios";

const ReminderService = {
    // Method to set a reminder for a note
    setReminder: async (id, reminder, token) => {
      try {
        const response = await axios.post(`${base_url}/reminders/set/${id}`, reminder, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error setting reminder:', error);
        throw error;
      }
    },
  
    // Method to update an existing reminder
    updateReminder: async (reminderId, reminder, token) => {
      try {
        const response = await axios.put(`${base_url}/reminders/update/${reminderId}`, reminder, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error updating reminder:', error);
        throw error;
      }
    },
  
    // Method to delete a reminder by its ID
    deleteReminder: async (reminderId, token) => {
      try {
        await axios.delete(`${base_url}/reminders/delete/${reminderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error deleting reminder:', error);
        throw error;
      }
    },
  
    // Method to fetch all reminders
    getAllReminders: async (token) => {
      try {
        const response = await axios.get(`${base_url}/reminders/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching reminders:', error);
        throw error;
      }
    },
  
    // Method to fetch a reminder by its ID
    getReminderById: async (reminderId, token) => {
      try {
        const response = await axios.get(`${base_url}/reminders/${reminderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching reminder:', error);
        throw error;
      }
    }
  };
  
  export default ReminderService;