import React, { useState, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateMatch, groupKeys } from '../../api';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { toISOString } from '../../utils/dateFormatter';
import styles from './CreateMatchModal.module.css';

interface CreateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, groupId }) => {
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [price, setPrice] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [enablePositions, setEnablePositions] = useState(false);
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const createMatch = useCreateMatch();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!location || !address || !dateTime || !price || !maxParticipants) {
            setError('All fields are required');
            return;
        }

        const priceNum = parseFloat(price);
        const maxNum = parseInt(maxParticipants, 10);

        if (isNaN(priceNum) || priceNum < 0) {
            setError('Price must be a valid number');
            return;
        }

        if (isNaN(maxNum) || maxNum <= 0) {
            setError('Max participants must be a valid positive number');
            return;
        }

        try {
            const time = new Date(dateTime);
            await createMatch.mutateAsync({
                location: location.trim(),
                address: address.trim(),
                pricePerMember: priceNum,
                maxParticipants: maxNum,
                time: toISOString(time),
                groupId,
                enablePositions,
            });

            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) }); // Fixed: using correct query key factory
            handleClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to create match');
        }
    };

    const handleClose = () => {
        setLocation('');
        setAddress('');
        setDateTime('');
        setPrice('');
        setMaxParticipants('');
        setEnablePositions(false);
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Match">
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
                    required
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

                <Input
                    label="Max Participants"
                    type="number"
                    min="2"
                    placeholder="e.g., 10"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
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
                    <Button type="submit" isLoading={createMatch.isPending}>
                        Create Match
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateMatchModal;
