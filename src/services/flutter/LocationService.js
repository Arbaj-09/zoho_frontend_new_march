/**
 * Flutter-Ready Location Service for Sales Executive App
 * Handles GPS tracking, distance calculation, and auto punch-in detection
 */

class FlutterLocationService {
    constructor() {
        this.watchId = null;
        this.currentLocation = null;
        this.isTracking = false;
        this.punchInCallback = null;
        this.locationUpdateCallback = null;
        this.customerLocation = null;
    }

    /**
     * 🔹 Start GPS tracking when task opens
     */
    async startTracking(options = {}) {
        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation not supported');
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
                    this.handleLocationUpdate(position);
                },
                (error) => {
                    this.handleLocationError(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000,
                    distanceFilter: 10 // Update every 10 meters
                }
            );

            this.isTracking = true;
            console.log('📍 GPS tracking started');
            return this.currentLocation;
            
        } catch (error) {
            console.error('❌ Failed to start GPS tracking:', error);
            throw error;
        }
    }

    /**
     * 🔹 Handle location updates and check for auto punch-in
     */
    handleLocationUpdate(position) {
        const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
        };

        this.currentLocation = newLocation;

        // Notify location update
        if (this.locationUpdateCallback) {
            this.locationUpdateCallback(newLocation);
        }

        // 🔹 Check if within 200m of customer location
        if (this.customerLocation) {
            const distance = this.calculateDistance(
                newLocation.latitude, newLocation.longitude,
                this.customerLocation.latitude, this.customerLocation.longitude
            );

            if (distance <= 200) {
                this.handleAutoPunchIn(distance);
            }
        }
    }

    /**
     * 🔹 Auto punch-in when within 200m
     */
    async handleAutoPunchIn(distance) {
        if (this.punchInCallback) {
            const isLate = new Date().getHours() >= 10; // After 10 AM = late
            
            this.punchInCallback({
                punchedIn: true,
                distance: distance,
                isLate: isLate,
                location: this.currentLocation,
                timestamp: new Date().toISOString()
            });

            // Show toast notification
            this.showToast(
                isLate ? 'Late marked automatically' : 'Punch-in successful (Auto)',
                isLate ? 'warning' : 'success'
            );

            console.log(`✅ Auto punch-in: ${isLate ? 'LATE' : 'ON TIME'} (${Math.round(distance)}m)`);
        }
    }

    /**
     * Set customer location for distance checking
     */
    setCustomerLocation(latitude, longitude, address) {
        this.customerLocation = {
            latitude,
            longitude,
            address
        };
        console.log('📍 Customer location set:', { latitude, longitude, address });
    }

    /**
     * Calculate distance using Haversine formula
     */
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

    /**
     * Check if within task radius (200m)
     */
    isWithinTaskRadius(lat1, lon1, lat2, lon2) {
        return this.calculateDistance(lat1, lon1, lat2, lon2) <= 200;
    }

    /**
     * Get current position
     */
    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            });
        });
    }

    /**
     * Stop location tracking
     */
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        console.log('📍 GPS tracking stopped');
    }

    /**
     * Show toast notification (Flutter-style)
     */
    showToast(message, type = 'info') {
        // In Flutter, this would call Flutter's toast method
        // For web, we'll use a simple alert or custom toast
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        
        // Web fallback
        if (typeof window !== 'undefined' && window.alert) {
            alert(message);
        }
    }

    /**
     * 🔹 15-Minute Stay Popup Handler
     * Triggered from backend idle notification
     */
    showIdlePopup(idleData) {
        const message = `Are you still working here?\n\nLocation: ${idleData.address}\nIdle time: ${idleData.duration}`;
        
        if (confirm(message)) {
            // YES → continue working
            this.showToast('Continuing work session', 'info');
            return true;
        } else {
            // NO → navigate / stop task
            this.showToast('Task stopped', 'warning');
            return false;
        }
    }

    /**
     * 🔹 Task Completion - Camera Handler
     */
    async captureLivePhoto() {
        try {
            // In Flutter, this would open camera
            // For web, we'll use file input as fallback
            return new Promise((resolve, reject) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'environment'; // Prefer camera
                
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // In real app, upload to server and get URL
                        const photoUrl = URL.createObjectURL(file);
                        resolve({
                            url: photoUrl,
                            timestamp: new Date().toISOString(),
                            location: this.currentLocation
                        });
                    } else {
                        reject(new Error('No photo captured'));
                    }
                };
                
                input.oncancel = () => {
                    reject(new Error('Camera cancelled'));
                };
                
                input.click();
            });
        } catch (error) {
            console.error('❌ Failed to capture photo:', error);
            throw error;
        }
    }

    /**
     * 🔹 Complete Task with Photo
     */
    async completeTask(taskId, completionNotes = '') {
        try {
            // Validate location first
            if (!this.customerLocation || !this.currentLocation) {
                throw new Error('Location data missing');
            }

            const distance = this.calculateDistance(
                this.currentLocation.latitude, this.currentLocation.longitude,
                this.customerLocation.latitude, this.customerLocation.longitude
            );

            if (distance > 200) {
                throw new Error(`Too far from customer location (${Math.round(distance)}m)`);
            }

            // Capture live photo
            const photo = await this.captureLivePhoto();

            // Complete task
            const completionData = {
                taskId,
                photoUrl: photo.url,
                workLat: this.currentLocation.latitude,
                workLng: this.currentLocation.longitude,
                completionNotes,
                timestamp: new Date().toISOString()
            };

            console.log('✅ Task completed:', completionData);
            this.showToast('Task completed successfully', 'success');

            return completionData;

        } catch (error) {
            console.error('❌ Failed to complete task:', error);
            this.showToast(error.message, 'error');
            throw error;
        }
    }

    /**
     * Format distance for display
     */
    formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${Math.round(meters)} m`;
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isTracking: this.isTracking,
            currentLocation: this.currentLocation,
            customerLocation: this.customerLocation,
            distance: this.customerLocation && this.currentLocation ? 
                this.calculateDistance(
                    this.currentLocation.latitude, this.currentLocation.longitude,
                    this.customerLocation.latitude, this.customerLocation.longitude
                ) : null
        };
    }

    // Utility methods
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    handleLocationError(error) {
        let message = 'Location error';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location unavailable';
                break;
            case error.TIMEOUT:
                message = 'Location request timeout';
                break;
        }
        console.error('❌', message, error);
        this.showToast(message, 'error');
    }

    // Callback setters
    onPunchIn(callback) {
        this.punchInCallback = callback;
    }

    onLocationUpdate(callback) {
        this.locationUpdateCallback = callback;
    }
}

// Export singleton instance
export default new FlutterLocationService();
