const express = require("express");
const router = express.Router();
const Event = require("../models/event");

// Utility to convert date + time string into a proper Date object
const combineDateAndTime = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00.000Z`);
};

// Handle single event processing
const processEventData = (eventData) => {
  // Ensure time fields are properly formatted
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // If it's already in HH:MM format, return as is
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // If it's in HH:MM:SS format, remove seconds
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
      return timeString.substring(0, 5);
    }
    
    // If it's a Date object, extract time in HH:MM format
    if (timeString instanceof Date) {
      const hours = timeString.getHours().toString().padStart(2, '0');
      const minutes = timeString.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // If it's a string that looks like a date, try to parse it
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch (e) {
      console.error('Time parsing error:', e);
    }
    
    return timeString;
  };

  return {
    ...eventData,
    // Keep time as string format for frontend compatibility
    startTime: formatTime(eventData.startTime),
    endTime: formatTime(eventData.endTime),
    date: new Date(eventData.date),
  };
};

// 📌 Create a new Event
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Handle multiple events
      const processedEvents = data.map((event) => processEventData(event));
      const newEvents = await Event.insertMany(processedEvents);
      res.status(201).json({ message: "Events created successfully!", events: newEvents });
    } else {
      // Handle single event
      const processedEvent = processEventData(data);
      const newEvent = new Event(processedEvent);
      await newEvent.save();
      res.status(201).json({ message: "Event created successfully!", event: newEvent });
    }
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 📌 Get all Events with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;      // default to page 1
    const limit = parseInt(req.query.limit) || 10;   // default to 10 Events per page
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = { isActive: true };
    
    // Add event type filter if provided
    if (req.query.eventType) {
      query.eventType = req.query.eventType;
    }
    
    // Add class filter if provided
    if (req.query.classId) {
      query.classId = req.query.classId;
    }

    const totalEvents = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limit);
    
    const events = await Event.find(query)
      .sort({ date: 1, startTime: 1 }) // Sort by date and start time
      .skip(skip)
      .limit(limit)
      .populate("classId");
      
    res.status(200).json({
      events,
      totalEvents,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get a single Event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("classId");
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update an Event by ID
router.put("/:id", async (req, res) => {
  try {
    const processedEvent = processEventData(req.body);
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, processedEvent, { new: true });
    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event updated successfully!", event: updatedEvent });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 📌 Delete an Event by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;