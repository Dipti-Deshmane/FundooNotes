import axios from "axios";
import base_url from "../../Services/helper";


const LabelService = {
    // Method to create a new label
    createLabel: async (labelName, token) => {
        try {
            const response = await axios.post(`${base_url}/label/createlabel/${labelName}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating label:', error);
            throw error;
        }
    },

    // Method to get all labels
    getAllLabels: async (token) => {
        try {
            const response = await axios.get(`${base_url}/label/getlabelnotes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching labels:', error);
            throw error;
        }
    },

    // Method to delete a label by ID
    deleteLabelById: async (labelId, token) => {
        try {
            const response = await axios.delete(`${base_url}/label/deletelabelbyid/${labelId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting label:', error);
            throw error;
        }
    },

    // Method to edit a label by ID
    editLabelById: async (labelId, labelName, token) => {
        try {
            const response = await axios.put(`${base_url}/label/editlabelbyid/${labelId}/${labelName}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error editing label:', error);
            throw error;
        }
    },

    getAllLabelsByUserId: async (userId, token) => {
        try {
            const response = await axios.get(`${base_url}/label/getlabelsbyuser/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching labels by user ID:', error);
            throw error;
        }
    },

    // Method to get all notes for a particular label ID
    getAllLabelNotesByLabelId: async (labelId, token) => {
        try {
            const response = await axios.get(`${base_url}/label/getalllabelnotesbylabelid/${labelId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notes for label ID:', error);
            throw error;
        }
    },

    // Method to get the current label by label ID
    getCurrentLabel: async (labelId, token) => {
        try {
            const response = await axios.get(`${base_url}/label/getcurrentlabel/${labelId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching current label:', error);
            throw error;
        }
    }
};

export default LabelService;