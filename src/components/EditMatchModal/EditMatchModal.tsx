import React, { useState, FormEvent, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MatchSummary, useUpdateMatch, groupKeys } from '../../api';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { toISOString } from '../../utils/dateFormatter';
import styles from './EditMatchModal.module.css';

interface EditMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: MatchSummary;
    groupId: number;
}

const EditMatchModal: React.FC<EditMatchModalProps> = ({ isOpen, onClose, match, groupId }) => {
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [price, setPrice] = useState('');
    const [enablePositions, setEnablePositions] = useState(false);
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const updateMatch = useUpdateMatch();

    // Pre-fill form with match data
    useEffect(() => {
        if (isOpen && match) {
            setLocation(match.location);
            setAddress(match.address || '');
            setPrice(match.pricePerMember.toString());
            setEnablePositions(!!match.enablePositions);

            // Convert ISO string to datetime-local format
            const date = new Date(match.time);
            const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            setDateTime(localDateTime);
        }
    }, [isOpen, match]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const priceNum = parseFloat(price);

        if (isNaN(priceNum) || priceNum < 0) {
            setError('Price must be a valid number');
            return;
        }

        try {
            const time = new Date(dateTime);
            await updateMatch.mutateAsync({
                matchId: match.id,
                data: {
                    location: location.trim(),
                    address: address.trim(),
                    pricePerMember: priceNum,
                    time: toISOString(time),
                    enablePositions,
                },
            });

            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to update match');
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Match">
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Location"
                    type="text"
                    placeholder="e.g., Central Park Field 3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />

                <Input
                    label="Address"
                    type="text"
                    placeholder="e.g., 123 Main St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    required
                />

                <Input
                    label="Price per Member ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 15.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={enablePositions}
                            onChange={(e) => setEnablePositions(e.target.checked)}
                        />
                        Enable Position Choice
                    </label>
                    <span className={styles.checkboxHint}>
                        Allow players to select their preferred position when joining
                    </span>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={updateMatch.isPending}>
                        Update Match
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditMatchModal;
