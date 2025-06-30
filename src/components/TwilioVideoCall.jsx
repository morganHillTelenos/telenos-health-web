// src/components/TwilioVideoCall.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import twilioVideoService from "../services/twilioVideo";

const TwilioVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [error, setError] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // Generate room name from appointment ID
  const roomName = `appointment-${appointmentId}`;
  const identity = `user-${Date.now()}`;

  useEffect(() => {
    joinRoom();
    return () => {
      leaveRoom();
    };
  }, []);

  const joinRoom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const room = await twilioVideoService.joinRoom(identity, roomName);
      setRoom(room);

      // Handle room events
      room.on("participantConnected", handleParticipantConnected);
      room.on("participantDisconnected", handleParticipantDisconnected);
      room.on("disconnected", handleRoomDisconnected);

      // Display local video
      if (twilioVideoService.localVideoTrack) {
        twilioVideoService.localVideoTrack.attach(localVideoRef.current);
      }

      // Handle existing participants
      room.participants.forEach(handleParticipantConnected);

      setIsConnecting(false);
    } catch (error) {
      console.error("Failed to join room:", error);
      setError(error.message);
      setIsConnecting(false);
    }
  };

  const leaveRoom = async () => {
    await twilioVideoService.leaveRoom();
    navigate("/dashboard");
  };

  const handleParticipantConnected = (participant) => {
    console.log(`Participant connected: ${participant.identity}`);

    const addTrack = (track) => {
      if (track.kind === "video") {
        track.attach(remoteVideoRef.current);
      }
    };

    participant.tracks.forEach((publication) => {
      if (publication.isSubscribed) {
        addTrack(publication.track);
      }
    });

    participant.on("trackSubscribed", addTrack);
  };

  const handleParticipantDisconnected = (participant) => {
    console.log(`Participant disconnected: ${participant.identity}`);
  };

  const handleRoomDisconnected = (room, error) => {
    if (error) {
      console.error("Room disconnected with error:", error);
      setError(error.message);
    }
    navigate("/dashboard");
  };

  const toggleAudio = () => {
    const muted = twilioVideoService.toggleAudio();
    setIsAudioMuted(muted);
  };

  const toggleVideo = () => {
    const muted = twilioVideoService.toggleVideo();
    setIsVideoMuted(muted);
  };

  if (isConnecting) {
    return (
      <div className="video-call-container">
        <div className="connecting-screen">
          <div className="loading-spinner"></div>
          <h2>Connecting to video call...</h2>
          <p>Please wait while we connect you to the appointment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-call-container">
        <div className="error-screen">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      <div className="video-call-header">
        <h1>Video Consultation</h1>
        <span className="appointment-id">Appointment: {appointmentId}</span>
      </div>

      <div className="video-grid">
        <div className="video-container local">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-label">You</div>
        </div>

        <div className="video-container remote">
          <video ref={remoteVideoRef} autoPlay playsInline />
          <div className="video-label">Patient/Doctor</div>
        </div>
      </div>

      <div className="video-controls">
        <button
          onClick={toggleAudio}
          className={`control-btn ${isAudioMuted ? "muted" : ""}`}
        >
          {isAudioMuted ? "🔇" : "🎤"}
        </button>

        <button
          onClick={toggleVideo}
          className={`control-btn ${isVideoMuted ? "muted" : ""}`}
        >
          {isVideoMuted ? "📹" : "📷"}
        </button>

        <button onClick={leaveRoom} className="end-call-btn">
          End Call
        </button>
      </div>
    </div>
  );
};

export default TwilioVideoCall;
