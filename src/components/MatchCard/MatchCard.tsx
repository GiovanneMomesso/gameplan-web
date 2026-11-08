import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MatchSummary, useApplyForMatch, useDeleteMatch, useCancelMatchApplication, useRemoveParticipant, useCreateGuestInvite, useCurrentUser, groupKeys, ParticipantStatus, useApproveParticipant, useRejectParticipant } from '../../api';
import { formatDateTime, getDaysRemaining } from '../../utils/dateFormatter';
import { displayPosition } from '../../utils/positionUtils';
import Card from '../Card/Card';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import EditMatchModal from '../EditMatchModal/EditMatchModal';
import ApplyMatchModal from '../ApplyMatchModal/ApplyMatchModal';
import AddGuestModal from '../AddGuestModal/AddGuestModal';
import CreateMatchModal from '../CreateMatchModal/CreateMatchModal';
import ParticipantStatusBadge from '../ParticipantStatusBadge/ParticipantStatusBadge';
import styles from './MatchCard.module.css';

interface MatchCardProps {
    match: MatchSummary;
    groupId: number;
    groupName: string;
    isAdmin?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, groupId, groupName, isAdmin }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [isRemoveParticipantModalOpen, setIsRemoveParticipantModalOpen] = useState(false);
    const [isRejectParticipantModalOpen, setIsRejectParticipantModalOpen] = useState(false);
    const [participantToRemove, setParticipantToRemove] = useState<{ id: number; name: string } | null>(null);
    const [participantToReject, setParticipantToReject] = useState<{ id: number; name: string } | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const [copiedDetails, setCopiedDetails] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const [copiedAddress, setCopiedAddress] = useState(false);
    const [copiedParticipantId, setCopiedParticipantId] = useState<number | null>(null);
    const [copiedPayment, setCopiedPayment] = useState(false);

    const queryClient = useQueryClient();
    const applyForMatch = useApplyForMatch();
    const cancelApplication = useCancelMatchApplication();
    const deleteMatch = useDeleteMatch();
    const removeParticipant = useRemoveParticipant();
    const createGuestInvite = useCreateGuestInvite();
    const approveParticipant = useApproveParticipant();
    const rejectParticipant = useRejectParticipant();
    const { data: user } = useCurrentUser();

    const isParticipant = user && match.participants.some(p => {
        const pId = p.userId || p.id;
        return pId && String(pId) === String(user.id);
    });

    const handleCopyDetails = async () => {
        try {
            const lines: string[] = [];

            // Header
            const headerParts = [`*${groupName}*`, match.location].filter(Boolean);
            if (headerParts.length > 0) {
                const sportEmoji = match.sportType === 'BASKETBALL' ? '🏀' : '🏐';
                lines.push(`${sportEmoji} ${headerParts.join(' ')}`);
            }

            // Time
            if (match.time) {
                const daysRemaining = getDaysRemaining(match.time);
                const timeStr = `📅 *${formatDateTime(match.time)}*${daysRemaining ? ` ${daysRemaining}` : ''}`;
                lines.push(timeStr);
            }

            // Address
            if (match.address) lines.push(`📍 ${match.address}`);

            lines.push(''); // Spacer

            // Price & Payment
            if (match.pricePerMember != null && match.pricePerMember > 0) {
                lines.push(`💰 Payment: ${match.pricePerMember}`);
                lines.push(''); // Spacer
            }

            // Available Positions
            if (match.availablePositions && Object.keys(match.availablePositions).length > 0) {
                const positionsListText = Object.entries(match.availablePositions)
                    .map(([name, count]) => `[${name} x${count}]`)
                    .join(' ');
                lines.push(`🏐 Positions Needed: ${positionsListText}`);
                lines.push(''); // Spacer
            }

            // Participants
            if (match.participants && match.participants.length > 0) {
                lines.push('👥 *Participants:*');
                const participantsList = match.participants
                    .map((p, index) => `${index + 1}. ${p.name} ${p.position ? `(${p.position})` : ''}`)
                    .join('\n');
                lines.push(participantsList);
                lines.push(''); // Spacer
            }

            // Group Link
            const groupUrl = `${window.location.origin}/groups/${groupId}`;
            lines.push('Event details (Gameplan group members only):');
            lines.push(groupUrl);

            const text = lines.join('\n');

            await navigator.clipboard.writeText(text);
            setIsMenuOpen(false);

            // Optional: Show some visual feedback
            setCopiedDetails(true);
            setTimeout(() => setCopiedDetails(false), 2000);
        } catch (err) {
            console.error('Failed to copy match details:', err);
        }
    };

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const handleCopyPayment = async (paymentInfo: string) => {
        try {
            await navigator.clipboard.writeText(paymentInfo);
            setCopiedPayment(true);
            setTimeout(() => setCopiedPayment(false), 2000);
        } catch (err) {
            console.error('Failed to copy payment info:', err);
        }
    };

    const handleApplyClick = () => {
        if (match.enablePositions) {
            setIsApplyModalOpen(true);
        } else {
            handleJoinMatch();
        }
    };

    const handleJoinMatch = async (position?: string) => {
        try {
            await applyForMatch.mutateAsync({ matchId: match.id, position });
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            setIsApplyModalOpen(false);
        } catch (error) {
            console.error('Failed to apply for match:', error);
        }
    };

    const handleLeave = async () => {
        try {
            await cancelApplication.mutateAsync(match.id);
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
        } catch (error) {
            console.error('Failed to leave match:', error);
        }
    };

    const handleDeleteClick = () => {
        setIsMenuOpen(false);
        setDeleteError('');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setDeleteError('');
        try {
            await deleteMatch.mutateAsync(match.id);
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            console.error('Failed to delete match:', error);
            setDeleteError(error?.message || 'Failed to delete match');
        }
    };

    const handleRemoveParticipantClick = (id: number, name: string) => {
        setParticipantToRemove({ id, name });
        setIsRemoveParticipantModalOpen(true);
    };

    const confirmRemoveParticipant = async () => {
        if (!participantToRemove) return;

        try {
            await removeParticipant.mutateAsync({
                matchId: match.id,
                participantId: participantToRemove.id
            });
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            setIsRemoveParticipantModalOpen(false);
            setParticipantToRemove(null);
        } catch (error) {
            console.error('Failed to remove participant:', error);
        }
    };

    const handleApproveParticipant = async (participantId: number) => {
        try {
            await approveParticipant.mutateAsync({
                matchId: match.id,
                participantId
            });
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
        } catch (error) {
            console.error('Failed to approve participant:', error);
        }
    };

    const handleRejectParticipantClick = (id: number, name: string) => {
        setParticipantToReject({ id, name });
        setIsRejectParticipantModalOpen(true);
    };

    const confirmRejectParticipant = async () => {
        if (!participantToReject) return;

        try {
            await rejectParticipant.mutateAsync({
                matchId: match.id,
                participantId: participantToReject.id
            });
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            setIsRejectParticipantModalOpen(false);
            setParticipantToReject(null);
        } catch (error) {
            console.error('Failed to reject participant:', error);
        }
    };

    const handleInviteGuest = async (participantId: number) => {
        try {
            const response = await createGuestInvite.mutateAsync({
                matchId: match.id,
                participantId
            });

            const link = `${window.location.origin}/join?hash=${response.secretHash}`;
            await navigator.clipboard.writeText(link);

            setCopiedParticipantId(participantId);
            setTimeout(() => setCopiedParticipantId(null), 2000);
        } catch (error) {
            console.error('Failed to create guest invite:', error);
            // Optional: Show error toast/message
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const renderParticipant = (participant: any, index: number) => {
        const pId = participant.participantId || participant.id;
        const uniqueKey = pId
            ? `participant-${pId}`
            : (participant.userId ? `user-${participant.userId}` : `guest-${index}-${participant.name}`);

        const isPending = participant.status === ParticipantStatus.PENDING;
        const isApproved = participant.status === ParticipantStatus.APPROVED;
        const isRefused = participant.status === ParticipantStatus.REFUSED;

        // Determine status-specific CSS class
        const statusClass = isPending ? styles.participantPending
            : isApproved ? styles.participantApproved
                : isRefused ? styles.participantRefused
                    : '';

        return (
            <span key={uniqueKey} className={`${styles.participant} ${statusClass}`}>
                {isAdmin && (!participant.userId || participant.userId === 0) && pId && (
                    <button
                        className={`${styles.iconButton} ${styles.inviteButtonLeft}`}
                        onClick={() => handleInviteGuest(pId)}
                        aria-label="Invite guest"
                        title="Copy invite link"
                        disabled={createGuestInvite.isPending}
                    >
                        {copiedParticipantId === pId ? (
                            <>
                                <span className={styles.copiedLabel}>✓</span>
                                <span className={styles.tooltip}>Invite link copied</span>
                            </>
                        ) : (
                            '🔗'
                        )}
                    </button>
                )}
                <span className={styles.participantName} title={participant.name || `User ${participant.userId || participant.id}`}>
                    {participant.name || `User ${participant.userId || participant.id}`}
                </span>
                {participant.position && (
                    <span className={styles.participantPosition} title={participant.position}>
                        ({participant.position})
                    </span>
                )}
                {participant.status && (
                    <ParticipantStatusBadge status={participant.status} />
                )}
                {isAdmin && pId && isPending && (
                    <div className={styles.participantActions}>
                        <button
                            className={`${styles.iconButton} ${styles.iconButtonApprove}`}
                            onClick={() => handleApproveParticipant(pId)}
                            aria-label="Approve participant"
                            title="Approve participant"
                            disabled={approveParticipant.isPending}
                        >
                            ✓
                        </button>
                        <button
                            className={`${styles.iconButton} ${styles.iconButtonReject}`}
                            onClick={() => handleRejectParticipantClick(pId, participant.name)}
                            aria-label="Reject participant"
                            title="Reject participant"
                            disabled={rejectParticipant.isPending}
                        >
                            ✗
                        </button>
                    </div>
                )}
                {isAdmin && pId && !isPending && (
                    <div className={styles.participantActions}>
                        <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleRemoveParticipantClick(pId, participant.name)}
                            aria-label="Remove participant"
                            title="Remove participant"
                        >
                            ×
                        </button>
                    </div>
                )}
            </span>
        );
    };

    return (
        <>
            <Card className={styles.matchCard}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.location}>
                            {match.sportType === 'BASKETBALL' && <span title="Basketball">🏀 </span>}
                            {match.sportType === 'VOLLEYBALL' && <span title="Volleyball">🏐 </span>}
                            {match.location}
                        </h3>
                        {match.address && (
                            <div className={styles.addressWrapper}>
                                <p className={styles.address}>{match.address}</p>
                                <button
                                    onClick={() => handleCopyAddress(match.address)}
                                    className={`${styles.copyButton} ${copiedAddress ? styles.copyButtonSuccess : ''}`}
                                    aria-label="Copy address"
                                    title="Copy address"
                                >
                                    {copiedAddress ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                        <p className={styles.time}>
                            {formatDateTime(match.time)}
                            {getDaysRemaining(match.time) && (
                                <span className={styles.daysRemaining}> {getDaysRemaining(match.time)}</span>
                            )}
                        </p>
                        {match.requestPrePayment && (
                            <div className={styles.prePaymentBadge}>
                                Pre-payment Required
                            </div>
                        )}
                        {match.requestPrePayment && (match.iban || match.mbwayPhoneNumber) && (
                            <div className={styles.paymentInfo}>
                                <span className={styles.paymentIcon}>
                                    {match.paymentType === 'IBAN' ? '💳' : '📱'}
                                </span>
                                <span className={styles.paymentLabel}>
                                    {match.paymentType === 'IBAN' ? 'IBAN:' : 'MBWay:'}
                                </span>
                                <span className={styles.paymentValue}>
                                    {match.paymentType === 'IBAN' ? match.iban : match.mbwayPhoneNumber}
                                </span>
                                <button
                                    onClick={() => handleCopyPayment(match.paymentType === 'IBAN' ? match.iban! : match.mbwayPhoneNumber!)}
                                    className={`${styles.copyButton} ${copiedPayment ? styles.copyButtonSuccess : ''}`}
                                    aria-label="Copy payment info"
                                    title="Copy payment info"
                                >
                                    {copiedPayment ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.price}>${match.pricePerMember}</div>
                        <div className={styles.menuContainer} ref={menuRef}>
                            <button
                                className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonActive : ''}`}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Match options"
                            >
                                ⋮
                            </button>
                            {isMenuOpen && (
                                <div className={styles.dropdown}>
                                    <button
                                        className={styles.menuItem}
                                        onClick={handleCopyDetails}
                                    >
                                        {copiedDetails ? '✓ Copied Details' : 'Copy Details'}
                                    </button>
                                    <button
                                        className={styles.menuItem}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsCloneModalOpen(true);
                                        }}
                                    >
                                        Clone Match
                                    </button>
                                    <button
                                        className={styles.menuItem}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsEditModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    {isAdmin && match.enablePositions && match.sportType === 'VOLLEYBALL' && (
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                window.location.href = `/groups/${groupId}/matches/${match.id}/teams`;
                                            }}
                                        >
                                            Manage Teams
                                        </button>
                                    )}
                                    <button
                                        className={`${styles.menuItem} ${styles.menuItemDelete}`}
                                        onClick={handleDeleteClick}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {match.availablePositions && Object.keys(match.availablePositions).length > 0 && (
                    <div className={styles.availablePositionsContainer}>
                        <p className={styles.availablePositionsLabel}>Positions Needed:</p>
                        <div className={styles.availablePositionsList}>
                            {Object.entries(match.availablePositions).map(([position, count], index) => (
                                <span key={index} className={styles.positionBadge}>
                                    {position} <span style={{ opacity: 0.8, fontWeight: 'bold', marginLeft: 4 }}>x{count}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.participants}>
                    <div className={styles.participantsHeader}>
                        <p className={styles.participantsLabel}>
                            Participants ({match.participants.length})
                            <span className={styles.participantsSubStats}>
                                • {match.participants.filter(p => p.status === ParticipantStatus.APPROVED).length} Approved
                                • {match.participants.filter(p => p.status === ParticipantStatus.PENDING).length} Pending
                            </span>
                        </p>
                        {isAdmin && (
                            <button
                                className={styles.addGuestButton}
                                onClick={() => setIsAddGuestModalOpen(true)}
                            >
                                + Add Guest
                            </button>
                        )}
                    </div>
                    {match.enablePositions && match.sportType === 'VOLLEYBALL' ? (
                        <div className={styles.positionsGrid}>
                            {(() => {
                                const VOLLEYBALL_POSITIONS = ["Outside hitter", "Opposite", "Setter", "Middle blocker", "Libero"];
                                
                                const grouped = match.participants.reduce((acc, p) => {
                                    const pos = p.position || "Unassigned";
                                    if (!acc[pos]) acc[pos] = [];
                                    acc[pos].push(p);
                                    return acc;
                                }, {} as Record<string, typeof match.participants>);
                                
                                const sortedPositions = [
                                    ...VOLLEYBALL_POSITIONS.filter(pos => grouped[pos] || (match.availablePositions && match.availablePositions[pos])),
                                    ...Object.keys(grouped).filter(pos => !VOLLEYBALL_POSITIONS.includes(pos) && pos !== "Unassigned"),
                                    ...(grouped["Unassigned"] && grouped["Unassigned"].length > 0 ? ["Unassigned"] : [])
                                ].filter((pos, index, self) => self.indexOf(pos) === index);

                                return sortedPositions.map(pos => {
                                    const participants = grouped[pos] || [];
                                    const neededCount = match.availablePositions?.[pos] || 0;
                                    
                                    return (
                                        <div key={pos} className={styles.positionGroup}>
                                            <h4 className={styles.positionGroupName}>
                                                {displayPosition(pos)} {neededCount > 0 && <span className={styles.positionNeededCount}>(Needs {neededCount})</span>}
                                            </h4>
                                            <div className={styles.participantsList}>
                                                {participants.length > 0 ? (
                                                    participants.map((participant, index) => renderParticipant(participant, index))
                                                ) : (
                                                    <span className={styles.emptyPositionText}>No participants</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    ) : (
                        <div className={styles.participantsList}>
                            {match.participants.map((participant, index) => renderParticipant(participant, index))}
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {isParticipant ? (
                        <Button variant="danger" onClick={handleLeave} isLoading={cancelApplication.isPending}>
                            Leave
                        </Button>
                    ) : (
                        <Button onClick={handleApplyClick} isLoading={applyForMatch.isPending}>
                            Apply
                        </Button>
                    )}
                </div>
            </Card>

            <CreateMatchModal
                isOpen={isCloneModalOpen}
                onClose={() => setIsCloneModalOpen(false)}
                groupId={groupId}
                initialValues={{
                    location: match.location,
                    address: match.address,
                    pricePerMember: match.pricePerMember,
                    maxParticipants: 24, // Assuming a default or somehow getting it, match summary doesn't have maxParticipants usually? Let's check model.
                    enablePositions: match.enablePositions,
                    sportType: match.sportType,
                    availablePositions: match.availablePositions,
                }}
            />

            <EditMatchModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                match={match}
                groupId={groupId}
            />

            <ApplyMatchModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onConfirm={handleJoinMatch}
                isLoading={applyForMatch.isPending}
                sportType={match.sportType}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Match"
            >
                <p>Are you sure you want to delete this match? This action cannot be undone.</p>
                {deleteError && <p className={styles.error}>{deleteError}</p>}
                <div className={styles.modalActions}>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} isLoading={deleteMatch.isPending}>
                        Delete
                    </Button>
                </div>
            </Modal>

            <AddGuestModal
                isOpen={isAddGuestModalOpen}
                onClose={() => setIsAddGuestModalOpen(false)}
                matchId={match.id}
                groupId={groupId}
                enablePositions={match.enablePositions}
                sportType={match.sportType}
            />

            <Modal
                isOpen={isRemoveParticipantModalOpen}
                onClose={() => setIsRemoveParticipantModalOpen(false)}
                title="Remove Participant"
            >
                <p>Are you sure you want to remove <strong>{participantToRemove?.name}</strong> from this match?</p>
                <div className={styles.modalActions}>
                    <Button variant="secondary" onClick={() => setIsRemoveParticipantModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmRemoveParticipant} isLoading={removeParticipant.isPending}>
                        Remove
                    </Button>
                </div>
            </Modal>

            <Modal
                isOpen={isRejectParticipantModalOpen}
                onClose={() => setIsRejectParticipantModalOpen(false)}
                title="Reject Participant"
            >
                <p>Are you sure you want to reject <strong>{participantToReject?.name}</strong> from this match?</p>
                <div className={styles.modalActions}>
                    <Button variant="secondary" onClick={() => setIsRejectParticipantModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmRejectParticipant} isLoading={rejectParticipant.isPending}>
                        Reject
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default MatchCard;
