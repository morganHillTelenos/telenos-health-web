// src/hooks/useTwilioVideo.js - Real Twilio Video Integration
import { useState, useEffect, useCallback, useRef } from 'react';
import Video from 'twilio-video';
import { twilioTokenService } from '../services/twilioTokenService';
import { twilioConfig } from '../config/twilioConfig';

export const useTwilioVideo = () => {
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState(new Map());
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [localTracks, setLocalTracks] = useState([]);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    const roomRef = useRef(null);

    // Add a participant to the map
    const addParticipant = useCallback((participant) => {
        setParticipants(prevParticipants => {
            const newParticipants = new Map(prevParticipants);
            newParticipants.set(participant.sid, participant);
            return newParticipants;
        });
    }, []);

    // Remove a participant from the map
    const removeParticipant = useCallback((participant) => {
        setParticipants(prevParticipants => {
            const newParticipants = new Map(prevParticipants);
            newParticipants.delete(participant.sid);
            return newParticipants;
        });
    }, []);

    // Handle participant connection
    const handleParticipantConnected = useCallback((participant) => {
        console.log(`Participant ${participant.identity} connected`);
        addParticipant(participant);

        // Subscribe to existing tracks
        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                handleTrackSubscribed(publication.track);
            }
        });

        // Subscribe to track events
        participant.on('trackSubscribed', handleTrackSubscribed);
        participant.on('trackUnsubscribed', handleTrackUnsubscribed);
    }, [addParticipant]);

    // Handle participant disconnection
    const handleParticipantDisconnected = useCallback((participant) => {
        console.log(`Participant ${participant.identity} disconnected`);
        removeParticipant(participant);
    }, [removeParticipant]);

    // Handle track subscription
    const handleTrackSubscribed = useCallback((track) => {
        console.log(`Track ${track.kind} subscribed`);

        if (track.kind === 'video') {
            const videoElement = track.attach();
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';

            // You can append this to a specific container in your UI
            // For now, we'll store the element reference
            track.videoElement = videoElement;
        } else if (track.kind === 'audio') {
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
        }
    }, []);

    // Handle track unsubscription
    const handleTrackUnsubscribed = useCallback((track) => {
        console.log(`Track ${track.kind} unsubscribed`);
        track.detach().forEach(element => element.remove());
    }, []);

    // Connect to a room
    const connectToRoom = useCallback(async (identity, roomName) => {
        try {
            setIsConnecting(true);
            setError(null);

            // Generate access token
            const tokenData = await twilioTokenService.generateAccessToken(identity, roomName);

            // For demo mode with real Twilio interface
            if (tokenData.isDemoToken) {
                console.log('Using demo mode with Twilio-like interface');
                // Create a mock room object that mimics Twilio's API
                const mockRoom = {
                    name: roomName,
                    sid: `RM${Date.now()}`,
                    localParticipant: {
                        identity,
                        sid: `PA${Date.now()}`,
                        tracks: new Map()
                    },
                    participants: new Map(),
                    disconnect: () => {
                        setIsConnected(false);
                        setRoom(null);
                        setParticipants(new Map());
                    }
                };

                setRoom(mockRoom);
                setIsConnected(true);
                roomRef.current = mockRoom;

                // Simulate a remote participant joining after 3 seconds
                setTimeout(() => {
                    const mockParticipant = {
                        sid: `PA${Date.now() + 1}`,
                        identity: 'Dr. Smith',
                        tracks: new Map()
                    };
                    addParticipant(mockParticipant);
                }, 3000);

                return mockRoom;
            }

            // Real Twilio connection (when you have valid tokens)
            const connectOptions = {
                name: roomName,
                audio: twilioConfig.audio,
                video: twilioConfig.video,
                maxAudioBitrate: 16000,
                maxVideoBitrate: 2400000,
                preferredVideoCodecs: ['VP8'],
                logLevel: 'info'
            };

            const twilioRoom = await Video.connect(tokenData.accessToken, connectOptions);

            setRoom(twilioRoom);
            setIsConnected(true);
            roomRef.current = twilioRoom;

            // Handle existing participants
            twilioRoom.participants.forEach(handleParticipantConnected);

            // Handle participant events
            twilioRoom.on('participantConnected', handleParticipantConnected);
            twilioRoom.on('participantDisconnected', handleParticipantDisconnected);

            // Handle room events
            twilioRoom.on('disconnected', () => {
                setIsConnected(false);
                setRoom(null);
                setParticipants(new Map());
                roomRef.current = null;
            });

            console.log(`Connected to room: ${twilioRoom.name}`);
            return twilioRoom;

        } catch (err) {
            console.error('Error connecting to room:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsConnecting(false);
        }
    }, [handleParticipantConnected, handleParticipantDisconnected, addParticipant]);

    // Disconnect from room
    const disconnectFromRoom = useCallback(() => {
        if (roomRef.current) {
            roomRef.current.disconnect();
        }

        // Clean up local tracks
        localTracks.forEach(track => {
            track.stop();
            track.detach().forEach(element => element.remove());
        });

        setLocalTracks([]);
        setRoom(null);
        setParticipants(new Map());
        setIsConnected(false);
        setError(null);
        roomRef.current = null;
    }, [localTracks]);

    // Toggle audio mute
    const toggleAudio = useCallback(() => {
        if (room && room.localParticipant) {
            room.localParticipant.audioTracks.forEach(publication => {
                if (isAudioMuted) {
                    publication.track.enable();
                } else {
                    publication.track.disable();
                }
            });
            setIsAudioMuted(!isAudioMuted);
        }
    }, [room, isAudioMuted]);

    // Toggle video mute
    const toggleVideo = useCallback(() => {
        if (room && room.localParticipant) {
            room.localParticipant.videoTracks.forEach(publication => {
                if (isVideoMuted) {
                    publication.track.enable();
                } else {
                    publication.track.disable();
                }
            });
            setIsVideoMuted(!isVideoMuted);
        }
    }, [room, isVideoMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectFromRoom();
        };
    }, [disconnectFromRoom]);

    return {
        room,
        participants: Array.from(participants.values()),
        participantCount: participants.size,
        isConnecting,
        isConnected,
        error,
        localTracks,
        isAudioMuted,
        isVideoMuted,
        connectToRoom,
        disconnectFromRoom,
        toggleAudio,
        toggleVideo,
        generateRoomName: twilioTokenService.generateRoomName,
        generateIdentity: twilioTokenService.generateIdentity
    };
};