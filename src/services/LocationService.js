class LocationService {
    constructor() {
        this.watchId = null;
        this.currentLocation = null;
        this.locationCallback = null;
        this.isTracking = false;
    }

    // Start location tracking
    async startTracking(callback) {
        try {
            this.locationCallback = callback;
            
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            // Get current position first
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };

            // Start watching position
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    
                    if (this.locationCallback) {
                        this.locationCallback(this.currentLocation);
                    }
                },
                (error) => {
                    console.error('Location tracking error:', error);
                    this.handleError(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000 // 30 seconds
                }
            );

            this.isTracking = true;
            return this.currentLocation;
            
        } catch (error) {
            console.error('Failed to start location tracking:', error);
            throw error;
        }
    }

    // Stop location tracking
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        this.locationCallback = null;
    }

    // Get current position
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000
                }
            );
        });
    }

    // Calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Format distance for display
    formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${Math.round(meters)} m`;
    }

    // Check if within radius
    isWithinRadius(currentLat, currentLng, targetLat, targetLng, radiusMeters = 200) {
        const distance = this.calculateDistance(currentLat, currentLng, targetLat, targetLng);
        return distance <= radiusMeters;
    }

    // Handle location errors
    handleError(error) {
        let message = 'Unknown location error';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location permission denied. Please enable location access.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out.';
                break;
        }

        if (this.locationCallback) {
            this.locationCallback({
                error: true,
                message: message,
                code: error.code
            });
        }
    }

    // Get current location
    getCurrentLocation() {
        return this.currentLocation;
    }

    // Check if tracking is active
    isActive() {
        return this.isTracking;
    }
}

export default new LocationService();
