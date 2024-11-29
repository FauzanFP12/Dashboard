import Insiden from '../models/Insiden.js';


// GET all incidents
export const getInsidens = async (req, res) => {
  try {
    const insidens = await Insiden.find({});
    res.json(insidens);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching incidents' });
  }
};


// POST a new incident
export const createInsiden = async (req, res) => {
  console.log('Incoming POST request:', req.body); // Debugging line

  const { idInsiden, deskripsi, status, tanggalStart, tanggalSubmit, tanggalElapse, sbu, backbone, superbackbone, distribusi, access, pilihan,priority } = req.body;

  // Validate tanggalStart to ensure it is not in the future
  const now = new Date();
  
  if (new Date(tanggalSubmit) > now) {
    return res.status(400).json({ message: 'Tanggal Start cannot be in the future' });
  }

  

  // Initialize elapsed time
  let elapsedTime = 0;
  
  // If the status is "Closed", calculate the elapsed time between tanggalStart and now
  if (status === 'Closed') {
    const elapsedMilliseconds = now - new Date(tanggalSubmit);
    elapsedTime = elapsedMilliseconds > 0 ? elapsedMilliseconds : 0;  // Ensure elapsed time is non-negative
  }

  const newInsiden = new Insiden({
    idInsiden,
    deskripsi,
    status,
    tanggalStart,
    tanggalSubmit,
    sbu,
    backbone,
    superbackbone,
    distribusi,
    access,
    pilihan,
    tanggalElapse,
    priority,
    elapsedTime,  // Save calculated elapsed time
  });

  try {
    const savedInsiden = await newInsiden.save();
    res.status(201).json(savedInsiden); // Send back the created incident
  } catch (err) {
    res.status(500).json({ message: 'Error creating incident', error: err.message });
  }
  
};



// UPDATE an incident
export const updateInsiden = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedInsiden = await Insiden.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedInsiden);
  } catch (err) {
    res.status(500).json({ message: 'Error updating incident' });
  }
};

// CLOSE an incident and stop elapsed time
export const closeInsiden = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the incident by ID
        const insiden = await Insiden.findById(id);

        // If incident not found, return a 404 error
        if (!insiden) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        const currentTime = new Date();
        
        // Tentukan apakah insiden pernah di-reopen. Jika pernah, hitung dari tanggalReopen,
        // jika tidak, hitung dari tanggalSubmit.
        const startTime = insiden.tanggalReopen ? new Date(insiden.tanggalReopen) : new Date(insiden.tanggalSubmit);

        // Hitung waktu yang berjalan sejak startTime (tanggalReopen atau tanggalSubmit)
        const elapsedMilliseconds = currentTime - startTime;

        // Tambahkan waktu berjalan dengan waktu sebelumnya yang sudah diakumulasi
        insiden.elapsedTime = (insiden.elapsedTime || 0) + elapsedMilliseconds;

        // Set status to "Closed" and save close time
        insiden.status = 'Closed';
        insiden.closeTime = currentTime;  // Catat waktu insiden ditutup

        // Simpan insiden yang telah diperbarui
        await insiden.save();

        res.json(insiden);
    } catch (err) {
        res.status(500).json({ message: 'Error closing incident', error: err.message });
    }
};

export const saveChatMessage = async (req, res) => {
    const { incidentId } = req.params;  // Get the incident ID from the request parameters
    const { message } = req.body;  // Get the message content from the request body

    try {
        // Create a new chat message
        const newMessage = new Chat({
            incidentId: incidentId,  // Link this message to the incident
            sender: 'User',  // For simplicity, this is hardcoded. You may replace it with the logged-in user's info
            message: message
        });

        // Save the message to the database
        await newMessage.save();

        res.status(200).json(newMessage);  // Respond with the saved message
    } catch (error) {
        console.error("Error saving chat message:", error);
        res.status(500).json({ message: 'Error saving chat message', error: error.message });
    }
};




// REOPEN an incident and continue tracking elapsed time
export const reopenInsiden = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the incident by ID
        const insiden = await Insiden.findById(id);

        // If incident not found, return a 404 error
        if (!insiden) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // Pastikan insiden sebelumnya berstatus "Closed"
        if (insiden.status !== 'Closed') {
            return res.status(400).json({ message: 'Incident is not closed, cannot reopen' });
        }

        // Reopen the incident and update status
        insiden.status = 'ReOpen';
        
        // Set 'tanggalReopen' ke waktu sekarang, tetapi jangan ubah 'tanggalSubmit'
        insiden.tanggalReopen = new Date();

        // Simpan insiden yang telah diperbarui
        await insiden.save();

        res.json(insiden);
    } catch (err) {
        res.status(500).json({ message: 'Error reopening incident', error: err.message });
    }
};

export const moveToQueue = async (req, res) => {
  const { id } = req.params;  // Get the idInsiden from the URL params
  console.log('Received idInsiden:', id);  // Log to verify the received idInsiden

  try {
    // Use findOne to locate the document by idInsiden instead of the default _id field
    const incident = await Insiden.findOne({ idInsiden: id });
    
    if (!incident) {
      console.log('Incident not found with idInsiden:', id);  // Log when incident is not found
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Update the status to "In Queue" and save
    incident.status = 'In Queue';
    await incident.save();
    
    res.status(200).json(incident);  // Respond with the updated incident
  } catch (error) {
    console.error('Error moving incident to queue:', error);  // Log error for debugging
    res.status(500).json({ message: 'Error moving incident to queue', error: error.message });
  }
};





export const getChatMessages = async (req, res) => {
    const { incidentId } = req.params;  // Get the incident ID from the request parameters
    try {
        // Find all chat messages related to this incident
        const messages = await Chat.find({ incidentId: incidentId });

        if (!messages) {
            return res.status(404).json({ message: 'No chat messages found for this incident' });
        }

        res.status(200).json(messages);  // Respond with the chat messages
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
    }
};













// DELETE an incident
export const deleteInsiden = async (req, res) => {
  const { id } = req.params;

  try {
    await Insiden.findByIdAndDelete(id);
    res.json({ message: 'Incident deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting incident' });
  }
};