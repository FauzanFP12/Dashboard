import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import Modal from "react-modal";

import "./Chat.css";

const Chat = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  

  // File configuration
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit

  useEffect(() => {
    fetchTickets(); // Fetch tickets when the component mounts
  }, []);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleScroll = () => {
  if (chatAreaRef.current) {
    const scrollHeight = chatAreaRef.current.scrollHeight;
    const scrollTop = chatAreaRef.current.scrollTop;
    const clientHeight = chatAreaRef.current.clientHeight;
    
    console.log("scrollHeight:", scrollHeight);
    console.log("scrollTop:", scrollTop);
    console.log("clientHeight:", clientHeight);
    
    // Only show the button if the user has scrolled up from the bottom
    if (scrollHeight - scrollTop > clientHeight) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false); // Hide when at the bottom
    }
  }
};

  

  useEffect(() => {
    const chat = chatAreaRef.current;
    chat?.addEventListener("scroll", handleScroll);

    // Cleanup on component unmount
    return () => {
      chat?.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    console.log("Scroll button visibility:", showScrollButton);
  }, [showScrollButton]);
  


  useEffect(() => {
    if (selectedTicket) {
      fetchChatMessages(selectedTicket._id); // Fetch chat messages when a ticket is selected

      const intervalId = setInterval(() => {
        fetchChatMessages(selectedTicket._id); // Poll for new messages every second
        fetchTickets(selectedTicket._id);
      }, 1000);

      return () => clearInterval(intervalId); // Clear interval on cleanup
    }
  }, [selectedTicket]);

  // Fungsi untuk membuka modal dengan gambar
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  // Fungsi untuk menutup modal
  const closeImageModal = () => {
    setModalImage(null);
    setIsModalOpen(false);
  };

  // Fetch tickets from the server
  // Fetch tickets from the server
  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`
      );
      const ticketsData = await Promise.all(
        response.data
          .filter((ticket) => ticket.status === "Open") // Filter open tickets only
          .map(async (ticket) => {
            const chatResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${ticket._id}/chat?limit=1&sort=desc`
            );
            const lastMessage =
              chatResponse.data?.[0]?.message || "No messages yet";
            return { ...ticket, lastMessage };
          })
      );
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Fetch chat messages for a specific ticket
  const fetchChatMessages = async (ticketId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${ticketId}/chat`,
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        }
      );
      setChatMessages((prevChats) => ({
        ...prevChats,
        [ticketId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  // Handle emoji picker selection
  const onEmojiClick = (emojiData) => {
    // Append the emoji to the current message
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    
    // Optionally, hide the emoji picker after selection
    setShowEmojiPicker(false);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(
      (file) =>
        !ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      alert(`Some files are invalid or exceed the size limit of 5MB.`);
      return;
    }

    setSelectedFile(files); // Simpan file dalam bentuk array
  };

  // Handle new ticket creation
  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      alert("Please enter both a subject and a description.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`,
        {
          subject,
          description,
          status: "New",
        }
      );

      if (response.status === 201) {
        const newTicket = response.data;
        setTickets([...tickets, newTicket]);
        setSelectedTicket(newTicket);
        setSubject("");
        setDescription("");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  // Select a ticket to view
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    fetchChatMessages(ticket._id);
  };

  // Send a chat message with optional file attachment
  const sendChatMessage = async () => {
    if (!newMessage.trim() && (!selectedFile || selectedFile.length === 0))
      return;

    const user = JSON.parse(sessionStorage.getItem("user"));
    const fullName = user?.fullName;

    if (!fullName) {
      alert("Full name not set. Please log in first.");
      return;
    }

    try {
      const uploadedFiles = [];

      if (selectedFile && selectedFile.length > 0) {
        for (const file of selectedFile) {
          const formData = new FormData();
          formData.append("file", file); // Tambahkan file ke FormData
          formData.append("ticketId", selectedTicket._id); // Tambahkan ticketId
          formData.append("fullName", fullName); // Tambahkan fullName
      
          const fileResponse = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data",
                "full-name": fullName, 
              },
            }
          );

          uploadedFiles.push(fileResponse.data.fileUrl);
        }
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${selectedTicket._id}/chat`,
        {
          sender: fullName,
          message: newMessage,
          fileUrls: uploadedFiles, // Kirim semua URL file
        }
      );

      if (response.status === 200) {
        fetchChatMessages(selectedTicket._id);
        setNewMessage("");
        setSelectedFile([]); // Reset file setelah terkirim
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset nilai input file di UI
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Di dalam renderMessages, tambahkan handler untuk membuka modal
  const renderMessages = (messages) => {
    const currentUser = JSON.parse(sessionStorage.getItem("user"))?.fullName; // Get logged-in user

    return messages.map((msg, index) => {
      const file = msg.fileUrl || null;
      const isCurrentUser = msg.sender === currentUser; // Check if the sender is the current user

      return (
        <div
          key={index}
          className={`message ${isCurrentUser ? "from-user" : "from-support"}`} // Add class based on sender
          style={{
            alignSelf: isCurrentUser ? "flex-end" : "flex-start", // Position to the right for the current user
            backgroundColor: isCurrentUser ? "#d1f0d1" : "#d0f0fd", // Different color for user and support
          }}
        >
          <strong>{msg.sender}</strong> {msg.message}
          <div className="message-meta">
            {file && (
              <div className="file-attachment">
                {file.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img
                    src={file}
                    alt="attachment"
                    className="file-image"
                    onClick={() => openImageModal(file)} // Open image modal on click
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <a href={file} target="_blank" rel="noopener noreferrer">
                    <button className="file-download-btn">
                      View Attachment
                    </button>
                  </a>
                )}
              </div>
            )}
            <span className="timestamp">{formatDate(msg.createdAt)}</span>
          </div>
          

        </div>
        
      );
    });
  };
  // Format date strings
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  };
  // Close a ticket
  const closeTicket = async () => {
    if (selectedTicket) {
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${selectedTicket._id}`,
          { status: "Closed" }
        );

        if (response.status === 200) {
          setTickets((prevTickets) =>
            prevTickets.filter((ticket) => ticket._id !== selectedTicket._id)
          );
          setSelectedTicket(null);
          alert("Ticket has been closed.");
        }
      } catch (error) {
        console.error("Error closing the ticket:", error);
      }
    }
  };
  const user = JSON.parse(sessionStorage.getItem("user"));
  const fullName = user?.fullName;
  const role = sessionStorage.getItem("role");
  


  return (
    <div className="chat-container">
<div className="ticket-list">
      <h3>Open Tickets</h3>
      {tickets
        .filter((ticket) => {
          // Jika admin, tampilkan semua tiket
          if (role === "admin") return true;

          // Jika bukan admin, hanya tampilkan tiket yang dibuat oleh pengguna login
          return ticket.createdBy?.fullName === fullName;
        })
        .map((ticket) => (
          <div
            key={ticket._id}
            className={`ticket-item ${
              selectedTicket?._id === ticket._id ? "selected" : ""
            }`}
            onClick={() => handleTicketClick(ticket)}
          >
            <div className="ticket-createdBy">{ticket.createdBy?.fullName}</div>
            <div className="ticket-title">{ticket.subject}</div>
          </div>
        ))}
    </div>



      <div className="chat-area">
        <h3>Ticket Chat</h3>
        {selectedTicket ? (
  <>
    <div className="chat-messages">
      {chatMessages[selectedTicket._id]?.length > 0 ? (
        renderMessages(chatMessages[selectedTicket._id])
      ) : (
        <p>No chat messages yet.</p>
      )}
          {/* Scroll to bottom button */}
     
          

    </div>
    
    {showScrollButton && (
  <button
    className="scroll-to-bottom-btn"
    onClick={scrollToBottom}
    style={{
     
      bottom: "20px",
      right: "20px",
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "10px 20px",
      borderRadius: "50%",
      cursor: "pointer",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
      border: "2px solid red", // Add a border for debugging visibility
    }}
  >
    ↓
  </button>
)}


    <div  >
      
      <button
  onClick={() => setShowEmojiPicker((prevState) => !prevState)}
  className="emoji-btn"
>
  😊
</button>


      {showEmojiPicker && <EmojiPicker onEmojiClick={onEmojiClick}searchDisabled={true} />}
      
      <div className="input-container">
        <input
          type="text"
          className="custom-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
        />
        
       
        
        <button onClick={sendChatMessage} className="send-btn">Send</button>
      </div>
      <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          className="file-input"
        />
    </div>
  </>
) : (
  <p>Select a ticket to view the chat.</p>
)}

      </div>

      <div className="ticket-details">
        {selectedTicket ? (
          <>
            <h3>Details</h3>
            <p>
              <strong>Created By:</strong> {selectedTicket.createdBy?.fullName}
            </p>{" "}
            <p>
              <strong>IP-DA:</strong> {selectedTicket.subject}
            </p>
            <p>
              <strong>Status:</strong> {selectedTicket.status}
            </p>
            <p>
              <strong>Subject:</strong> {selectedTicket.description}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {formatDate(selectedTicket.createdAt)}
            </p>
           
            {/* Added Created By */}
            {role === 'admin' && (
  <button className="close-chat-btn" onClick={closeTicket}>
    Close Chat
  </button>
)}

          </>
        ) : (
          <div className="create-ticket-form">
            {/* Form for creating tickets */}
          </div>
        )}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeImageModal}
          contentLabel="Image Modal"
          className="image-modal"
          overlayClassName="modal-overlay"
        >
          <button onClick={closeImageModal} className="close-modal-btn">
            X
          </button>
          <img src={modalImage} alt="Enlarged View" className="modal-image" />
        </Modal>
      )}
    </div>
  );
};

export default Chat;
