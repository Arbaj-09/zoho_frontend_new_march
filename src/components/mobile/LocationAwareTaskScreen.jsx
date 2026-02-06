import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { backendApi } from '../../services/api';

const LocationAwareTaskScreen = ({ taskId, employeeId, onTaskAction, decision }) => {
    const [location, setLocation] = useState(null);
    const [canOperate, setCanOperate] = useState(false);
    const [punchInStatus, setPunchInStatus] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        startLocationTracking();
        return () => {
            stopLocationTracking();
        };
    }, [taskId, employeeId]);

    const startLocationTracking = () => {
        setIsTracking(true);
        
        const watchId = Geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                
                setLocation(newLocation);
                validateTaskOperations(newLocation);
            },
            (error) => {
                console.error('Location tracking error:', error);
                Alert.alert('Location Error', 'Unable to track your location. Please check GPS settings.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
                distanceFilter: 10 // Update every 10 meters
            }
        );
    };

    const stopLocationTracking = () => {
        Geolocation.clearWatch(watchId);
        setIsTracking(false);
    };

    const validateTaskOperations = async (currentLocation) => {
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
            setPunchInStatus(reason);
            
            // Show punch-in notification - NO time calculation
            if (reason === 'VALID' && !canOperate) {
                showPunchInNotification('PUNCHED_IN');
            }

        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setIsValidating(false);
        }
    };

    const showPunchInNotification = (status) => {
        Alert.alert(
            '✅ Punch-in successful',
            `✅ Punch-in successful\n📍 Location verified at customer site`,
            [{ text: 'OK' }]
        );
    };

    // Get user-friendly message based on backend decision
    const getUserMessage = () => {
        // Use ONLY decision.message - NO frontend calculations
        return decision?.message ? (
            <View style={styles.messageContainer}>
                <Text style={styles.infoText}>{decision.message}</Text>
            </View>
        ) : null;
    };

    const getStatusColor = () => {
        if (decision) {
            switch (decision.workStatus) {
                case 'WORKING': return '#10B981'; // green
                case 'NOT_AT_CUSTOMER': return '#EF4444'; // red
                case 'IDLE': return '#F59E0B'; // orange
                default: return '#6B7280'; // gray
            }
        }
        
        switch (punchInStatus) {
            case 'VALID': return '#10B981'; // green
            case 'NOT_PUNCHED_IN': return '#EF4444'; // red
            case 'OUTSIDE_LOCATION': return '#F59E0B'; // orange
            default: return '#6B7280'; // gray
        }
    };

    const getStatusText = () => {
        if (decision) {
            return decision.workStatus?.replace('_', ' ') || '🔄 Validating...';
        }
        
        switch (punchInStatus) {
            case 'VALID': return '✅ Ready to Work';
            case 'NOT_PUNCHED_IN': return '❌ Reach Customer Location';
            case 'OUTSIDE_LOCATION': return '📍 Move Within 200m';
            default: return '🔄 Validating...';
        }
    };

    return (
        <View style={styles.container}>
            {/* Location Status */}
            <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                    <Text style={styles.statusTitle}>Location Status</Text>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
                </View>
                
                <Text style={styles.statusText}>{getStatusText()}</Text>
                
                {location && (
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationText}>
                            📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </Text>
                        <Text style={styles.accuracyText}>
                            Accuracy: ±{location.accuracy?.toFixed(0)}m
                        </Text>
                    </View>
                )}
                
                {isValidating && (
                    <View style={styles.validatingContainer}>
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text style={styles.validatingText}>Validating location...</Text>
                    </View>
                )}
            </View>

            {/* Distance to Customer - Use ONLY decision.distanceToCustomer */}
            {decision?.distanceToCustomer && (
                <View style={styles.distanceCard}>
                    <Text style={styles.distanceTitle}>Distance to Customer</Text>
                    <Text style={[
                        styles.distanceText,
                        { color: decision.withinGeofence ? '#10B981' : '#EF4444' }
                    ]}>
                        {Math.round(decision.distanceToCustomer)}m
                    </Text>
                    {!decision.withinGeofence && (
                        <Text style={styles.distanceWarning}>
                            You need to be within 200m of customer location
                        </Text>
                    )}
                </View>
            )}

            {/* User-Friendly Message from Backend Decision */}
            {getUserMessage()}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        { backgroundColor: decision?.canOperateTask ? '#3B82F6' : '#9CA3AF' }
                    ]}
                    disabled={!decision?.canOperateTask}
                    onPress={() => onTaskAction && onTaskAction({ canOperate: decision?.canOperateTask, location, punchInStatus })}
                >
                    <Text style={styles.actionButtonText}>
                        {decision?.canOperateTask ? 'Continue Task' : 'Location Required'}
                    </Text>
                </TouchableOpacity>
                
                {!isTracking && (
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={startLocationTracking}
                    >
                        <Text style={styles.locationButtonText}>Enable Location</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 16,
    },
    statusCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 12,
    },
    locationInfo: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'monospace',
    },
    accuracyText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    validatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    validatingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6B7280',
    },
    distanceCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    distanceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    distanceText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    distanceWarning: {
        fontSize: 12,
        color: '#F59E0B',
    },
    messageContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        marginBottom: 4,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D97706',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#D97706',
        marginBottom: 4,
    },
    successTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
        marginBottom: 8,
    },
    successText: {
        fontSize: 14,
        color: '#059669',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#2563EB',
    },
    detailsCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    detailsText: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionContainer: {
        marginTop: 'auto',
    },
    actionButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    locationButton: {
        backgroundColor: '#E5E7EB',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    locationButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LocationAwareTaskScreen;
