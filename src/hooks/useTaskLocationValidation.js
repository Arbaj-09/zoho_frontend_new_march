import { useState, useEffect, useCallback } from 'react';
import LocationService from '../services/LocationService';
import { backendApi } from '../services/api';

const useTaskLocationValidation = (taskId, employeeId) => {
    const [location, setLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [canOperate, setCanOperate] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [punchInStatus, setPunchInStatus] = useState(null);

    // Location update handler
    const handleLocationUpdate = useCallback((locationData) => {
        if (locationData.error) {
            console.error('Location error:', locationData.message);
            return;
        }

        setLocation(locationData);
        validateTaskOperations(locationData);
    }, [taskId, employeeId]);

    // Validate task operations
    const validateTaskOperations = useCallback(async (currentLocation) => {
        if (!taskId || !employeeId || !currentLocation) {
            return;
        }

        setIsValidating(true);
        
        try {
            const response = await backendApi.get(`/api/tasks/${taskId}/can-operate`, {
                params: {
                    employeeId,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude
                }
            });

            const { canOperate: canDo, reason, message } = response.data;
            
            setCanOperate(canDo);
            setValidationMessage(message);
            
            // Update punch-in status based on reason
            if (reason === 'NOT_PUNCHED_IN') {
                setPunchInStatus('NOT_PUNCHED_IN');
            } else if (reason === 'VALID') {
                setPunchInStatus('PUNCHED_IN');
            } else if (reason === 'OUTSIDE_LOCATION') {
                setPunchInStatus('OUTSIDE_LOCATION');
            }

        } catch (error) {
            console.error('Validation failed:', error);
            setValidationMessage('Unable to validate location');
            setCanOperate(false);
        } finally {
            setIsValidating(false);
        }
    }, [taskId, employeeId]);

    // Get distance to customer
    const getDistanceToCustomer = useCallback(async () => {
        if (!taskId || !location) {
            return;
        }

        try {
            const response = await backendApi.get(`/api/tasks/${taskId}/distance`, {
                params: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            });

            setDistance(response.data.distance);
            return response.data.distance;

        } catch (error) {
            console.error('Failed to get distance:', error);
            return null;
        }
    }, [taskId, location]);

    // Start location tracking
    const startTracking = useCallback(() => {
        LocationService.startTracking(handleLocationUpdate);
    }, [handleLocationUpdate]);

    // Stop location tracking
    const stopTracking = useCallback(() => {
        LocationService.stopTracking();
    }, []);

    // Manual validation
    const validateNow = useCallback(() => {
        if (location) {
            validateTaskOperations(location);
        }
    }, [location, validateTaskOperations]);

    // Auto-start tracking when component mounts
    useEffect(() => {
        if (taskId && employeeId) {
            startTracking();
        }

        return () => {
            stopTracking();
        };
    }, [taskId, employeeId, startTracking, stopTracking]);

    // Calculate local distance if customer coordinates are available
    const calculateLocalDistance = useCallback((customerLat, customerLng) => {
        if (!location || !customerLat || !customerLng) {
            return null;
        }

        const distance = LocationService.calculateDistance(
            location.latitude,
            location.longitude,
            customerLat,
            customerLng
        );

        return {
            distance,
            withinRadius: LocationService.isWithinRadius(
                location.latitude,
                location.longitude,
                customerLat,
                customerLng,
                200
            ),
            formatted: LocationService.formatDistance(distance)
        };
    }, [location]);

    return {
        location,
        distance,
        canOperate,
        isValidating,
        validationMessage,
        punchInStatus,
        startTracking,
        stopTracking,
        validateNow,
        getDistanceToCustomer,
        calculateLocalDistance,
        isTracking: LocationService.isActive()
    };
};

export default useTaskLocationValidation;
