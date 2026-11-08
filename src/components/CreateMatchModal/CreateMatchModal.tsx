import React, { useState, FormEvent, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateMatch, groupKeys, MatchCreateRequest, useSportPositions } from '../../api';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { toISOString } from '../../utils/dateFormatter';
import { displayPosition } from '../../utils/positionUtils';
import styles from './CreateMatchModal.module.css';

interface CreateMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    initialValues?: Partial<MatchCreateRequest>;
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose, groupId, initialValues }) => {
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [price, setPrice] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [enablePositions, setEnablePositions] = useState(false);
    const [requestPrePayment, setRequestPrePayment] = useState(false);
    const [paymentType, setPaymentType] = useState('MBWay');
    const [iban, setIban] = useState('');
    const [mbwayPhoneNumber, setMbwayPhoneNumber] = useState('');
    const [sportType, setSportType] = useState<'VOLLEYBALL' | 'BASKETBALL' | null>(null);
    const [availablePositionsList, setAvailablePositionsList] = useState<{ name: string, count: number }[]>([]);
    const [currentPositionInput, setCurrentPositionInput] = useState('');
    const [currentCountInput, setCurrentCountInput] = useState<number>(1);
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const createMatch = useCreateMatch();

    const { data: positions } = useSportPositions(sportType || '');
    const hasPositions = positions && positions.length > 0;

    const unselectedPositions = positions?.filter(
        pos => !availablePositionsList.some(p => p.name.toLowerCase() === pos.toLowerCase())
    ) || [];

    // Unset currentPositionInput if sportType changes or position is already added
    useEffect(() => {
        if (hasPositions && currentPositionInput && !unselectedPositions.includes(currentPositionInput)) {
            setCurrentPositionInput(unselectedPositions[0] || '');
        } else if (hasPositions && !currentPositionInput) {
            setCurrentPositionInput(unselectedPositions[0] || '');
        }
    }, [sportType, positions, hasPositions, currentPositionInput, availablePositionsList]);

    useEffect(() => {
        if (isOpen && initialValues) {
            setLocation(initialValues.location || '');
            setAddress(initialValues.address || '');
            setPrice(initialValues.pricePerMember?.toString() || '');
            setMaxParticipants(initialValues.maxParticipants?.toString() || '');
            setEnablePositions(initialValues.enablePositions || false);
            setRequestPrePayment(initialValues.requestPrePayment || false);
            setPaymentType(initialValues.paymentType || 'MBWAY');
            setIban(initialValues.iban || '');
            setMbwayPhoneNumber(initialValues.mbwayPhoneNumber || '');
            setSportType(initialValues.sportType || null);

            const initPos = initialValues.availablePositions
                ? Object.entries(initialValues.availablePositions).map(([name, count]) => ({ name, count }))
                : [];
            setAvailablePositionsList(initPos);
            setCurrentPositionInput('');
            setCurrentCountInput(1);
            // We usually don't want to copy the date directly as it's likely a new match in the future
            // But if needed we could. For now keeping date empty for safety/forcing choice.
            setDateTime('');
        } else if (isOpen && !initialValues) {
            // Reset if opening without initial values (fresh create)
            setLocation('');
            setAddress('');
            setDateTime('');
            setPrice('');
            setMaxParticipants('');
            setEnablePositions(false);
            setRequestPrePayment(false);
            setPaymentType('MBWAY');
            setIban('');
            setMbwayPhoneNumber('');
            setSportType(null);
            setAvailablePositionsList([]);
            setCurrentPositionInput('');
            setCurrentCountInput(1);
        }
    }, [isOpen, initialValues]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // If user typed something but didn't click add, auto-add it if valid
        let finalPositions = [...availablePositionsList];
        if (enablePositions) {
            const trimmedPos = currentPositionInput.trim();
            if (trimmedPos && !finalPositions.some(p => p.name.toLowerCase() === trimmedPos.toLowerCase()) && currentCountInput > 0) {
                finalPositions.push({ name: trimmedPos, count: currentCountInput });
            }
        }

        if (!location || !address || !dateTime || !price || !maxParticipants) {
            setError('All fields are required');
            return;
        }

        const priceNum = parseFloat(price);
        const maxNum = parseInt(maxParticipants, 10);

        const availablePositionsObj = enablePositions ? finalPositions.reduce((acc, curr) => {
            acc[curr.name] = curr.count;
            return acc;
        }, {} as Record<string, number>) : {};

        if (isNaN(priceNum) || priceNum < 0) {
            setError('Price must be a valid number');
            return;
        }

        if (isNaN(maxNum) || maxNum <= 0) {
            setError('Max participants must be a valid positive number');
            return;
        }

        // Validate payment fields if pre-payment is requested
        if (requestPrePayment) {
            if (paymentType === 'IBAN' && !iban.trim()) {
                setError('IBAN is required when requesting pre-payment via IBAN');
                return;
            }
            if (paymentType === 'MBWAY' && !mbwayPhoneNumber.trim()) {
                setError('MBWay phone number is required when requesting pre-payment via MBWay');
                return;
            }
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
                sportType,
                availablePositions: availablePositionsObj,
                requestPrePayment,
                ...(requestPrePayment && {
                    paymentType,
                    ...(paymentType === 'IBAN' && { iban: iban.trim() }),
                    ...(paymentType === 'MBWAY' && { mbwayPhoneNumber: mbwayPhoneNumber.trim() }),
                }),
            });

            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            handleClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to create match');
        }
    };

    const handleClose = () => {
        // Resetting state on close is good practice but also handled by useEffect on open
        onClose();
    };

    const handleAddPosition = () => {
        const trimmed = currentPositionInput.trim();
        if (trimmed && !availablePositionsList.some(p => p.name.toLowerCase() === trimmed.toLowerCase()) && currentCountInput > 0) {
            setAvailablePositionsList([...availablePositionsList, { name: trimmed, count: currentCountInput }]);
            setCurrentPositionInput('');
            setCurrentCountInput(1);
        }
    };

    const handleRemovePosition = (indexToRemove: number) => {
        setAvailablePositionsList(availablePositionsList.filter((_, idx) => idx !== indexToRemove));
    };

    const handlePositionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            handleAddPosition();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={initialValues ? "Clone Match" : "Create New Match"}>
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

                <div className={styles.paymentMethodGroup}>
                    <label className={styles.label}>Sport Type</label>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="sportType"
                                checked={sportType === null}
                                onChange={() => setSportType(null)}
                                className={styles.radio}
                            />
                            Unspecified
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="sportType"
                                checked={sportType === 'VOLLEYBALL'}
                                onChange={() => setSportType('VOLLEYBALL')}
                                className={styles.radio}
                            />
                            Volleyball
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="sportType"
                                checked={sportType === 'BASKETBALL'}
                                onChange={() => setSportType('BASKETBALL')}
                                className={styles.radio}
                            />
                            Basketball
                        </label>
                    </div>
                </div>

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

                {enablePositions && (
                    <div className={styles.positionsBuilderGroup}>
                        <div className={styles.positionInputRow}>
                            <div className={styles.positionInputFields}>
                                <div style={{ flex: 1 }}>
                                    {(() => {
                                        return hasPositions ? (
                                            <div className={styles.selectContainer}>
                                                <label className={styles.label}>Positions Needed</label>
                                                <select
                                                    value={currentPositionInput}
                                                    onChange={(e) => setCurrentPositionInput(e.target.value)}
                                                    className={styles.select}
                                                    disabled={unselectedPositions.length === 0}
                                                >
                                                    {unselectedPositions.length === 0 && (
                                                        <option value="">All positions added</option>
                                                    )}
                                                    {unselectedPositions.map(pos => (
                                                        <option key={pos} value={pos}>{displayPosition(pos)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <Input
                                                label="Positions Needed"
                                                type="text"
                                                placeholder="e.g., Setter, Middle Blocker"
                                                value={currentPositionInput}
                                                onChange={(e) => setCurrentPositionInput(e.target.value)}
                                                onKeyDown={handlePositionKeyDown}
                                            />
                                        );
                                    })()}
                                </div>
                                <div className={styles.countInputContainer}>
                                    <label className={styles.countInputLabel}>Count</label>
                                    <div className={styles.countInputWrapper}>
                                        <button
                                            type="button"
                                            className={styles.countButton}
                                            onClick={() => setCurrentCountInput(Math.max(1, currentCountInput - 1))}
                                        >
                                            -
                                        </button>
                                        <span className={styles.countDisplay}>{currentCountInput}</span>
                                        <button
                                            type="button"
                                            className={styles.countButton}
                                            onClick={() => setCurrentCountInput(currentCountInput + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={styles.addPositionButton}
                                    onClick={handleAddPosition}
                                    disabled={!currentPositionInput.trim() || currentCountInput <= 0}
                                    title="Add Position Constraint"
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                        {availablePositionsList.length > 0 && (
                            <div className={styles.positionTagsList}>
                                {availablePositionsList.map((position, idx) => (
                                    <span key={idx} className={styles.positionTag}>
                                        {displayPosition(position.name)} <span style={{ opacity: 0.8, fontWeight: 'bold', marginLeft: 4 }}>x{position.count}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePosition(idx)}
                                            className={styles.removeTagButton}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={requestPrePayment}
                            onChange={(e) => setRequestPrePayment(e.target.checked)}
                        />
                        Request Pre-payment
                    </label>
                    <span className={styles.checkboxHint}>
                        Display a badge on the match card to indicate pre-payment is required
                    </span>
                </div>

                {requestPrePayment && (
                    <>
                        <div className={styles.paymentMethodGroup}>
                            <label className={styles.label}>Payment Method</label>
                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="MBWAY"
                                        checked={paymentType === 'MBWAY'}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        className={styles.radio}
                                    />
                                    MBWay
                                </label>
                                <label className={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="paymentType"
                                        value="IBAN"
                                        checked={paymentType === 'IBAN'}
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        className={styles.radio}
                                    />
                                    IBAN
                                </label>
                            </div>
                        </div>

                        {paymentType === 'MBWAY' && (
                            <Input
                                label="MBWay Phone Number"
                                type="tel"
                                placeholder="e.g., +351 912 345 678"
                                value={mbwayPhoneNumber}
                                onChange={(e) => setMbwayPhoneNumber(e.target.value)}
                                required
                            />
                        )}

                        {paymentType === 'IBAN' && (
                            <Input
                                label="IBAN"
                                type="text"
                                placeholder="e.g., PT50 0002 0123 1234 5678 9015 4"
                                value={iban}
                                onChange={(e) => setIban(e.target.value)}
                                required
                            />
                        )}
                    </>
                )}

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
