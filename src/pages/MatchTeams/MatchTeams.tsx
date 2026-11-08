import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatch, useSportPositions, useUpdateParticipantTeamPosition, UserSummary } from '../../api';
import { formatDateTime } from '../../utils/dateFormatter';
import Navbar from '../../components/Navbar/Navbar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './MatchTeams.module.css';

const MatchTeams: React.FC = () => {
    const { id, matchId } = useParams<{ id: string; matchId: string }>();
    const groupId = parseInt(id || '0', 10);
    const mId = parseInt(matchId || '0', 10);
    const navigate = useNavigate();

    const { data: match, isLoading: isLoadingMatch, refetch: refetchMatch } = useMatch(mId);
    const { data: positions, isLoading: isLoadingPositions } = useSportPositions(match?.sportType);
    const updatePosition = useUpdateParticipantTeamPosition();

    // Local state for edits
    const [edits, setEdits] = useState<Record<number, { teamName?: string; position?: string }>>({});
    // State to track if a specific participant row is currently creating a new team
    const [isCreatingNewTeam, setIsCreatingNewTeam] = useState<Record<number, boolean>>({});
    const [copiedTeams, setCopiedTeams] = useState(false);

    useEffect(() => {
        if (match && match.participants) {
            const initialEdits: Record<number, { teamName?: string; position?: string }> = {};
            match.participants.forEach(p => {
                const pId = p.participantId || p.id;
                if (pId) {
                    initialEdits[pId] = {
                        teamName: p.teamName || '',
                        position: p.position || ''
                    };
                }
            });
            setEdits(initialEdits);
        }
    }, [match]);

    const participantsToAssign: UserSummary[] = match?.participants || [];

    // Extract unique team names currently in this match or actively typed
    const uniqueTeams = useMemo(() => {
        const teamsSet = new Set<string>();
        participantsToAssign.forEach(p => {
            if (p.teamName) teamsSet.add(p.teamName);
        });
        Object.values(edits).forEach(edit => {
            if (edit.teamName) teamsSet.add(edit.teamName);
        });
        return Array.from(teamsSet).sort();
    }, [participantsToAssign, edits]);

    if (isLoadingMatch || isLoadingPositions) {
        return (
            <>
                <Navbar />
                <div className={styles.loading}><Spinner size="large" /></div>
            </>
        );
    }

    if (!match) {
        return (
            <>
                <Navbar />
                <div className={styles.container}><p className={styles.error}>Match not found.</p></div>
            </>
        );
    }

    const handleEditChange = (participantId: number, field: 'teamName' | 'position', value: string) => {
        setEdits(prev => ({
            ...prev,
            [participantId]: { ...prev[participantId], [field]: value }
        }));
    };

    const handleSave = async (participantId: number, explicitEdit?: { teamName?: string; position?: string }) => {
        const edit = explicitEdit || edits[participantId];
        if (!edit) return;
        
        // If they created a new team, clear the "isCreatingNewTeam" state after saving
        setIsCreatingNewTeam(prev => ({ ...prev, [participantId]: false }));

        try {
            await updatePosition.mutateAsync({
                matchId: mId,
                participantId,
                teamName: edit.teamName || undefined,
                position: edit.position || undefined,
            });
            refetchMatch();
        } catch (error) {
            console.error('Failed to update participant:', error);
            alert('Failed to update participant team/position.');
        }
    };

    // Group participants by teamName for display
    const teams = participantsToAssign.reduce((acc, p) => {
        const pId = p.participantId || p.id;
        const currentEdit = pId ? edits[pId] : null;
        const tName = currentEdit?.teamName || p.teamName || 'Unassigned';
        
        if (!acc[tName]) acc[tName] = [];
        acc[tName].push(p);
        return acc;
    }, {} as Record<string, UserSummary[]>);

    const handleCopyTeams = async () => {
        if (!match) return;
        try {
            const lines: string[] = [];

            const sportEmoji = match.sportType === 'BASKETBALL' ? '🏀' : '🏐';
            lines.push(`${sportEmoji} *${match.location} - Teams*`);
            
            if (match.time) {
                lines.push(`📅 *${formatDateTime(match.time)}*`);
            }
            lines.push('');

            Object.entries(teams).forEach(([teamName, members]) => {
                if (teamName === 'Unassigned') {
                    lines.push(`*Unassigned*`);
                } else {
                    lines.push(`🏆 *${teamName}*`);
                }
                
                members.forEach((m, index) => {
                    lines.push(`${index + 1}. ${m.name} ${m.position ? `(${m.position})` : ''}`);
                });
                lines.push('');
            });

            await navigator.clipboard.writeText(lines.join('\n').trim());
            
            setCopiedTeams(true);
            setTimeout(() => setCopiedTeams(false), 2000);
        } catch (err) {
            console.error('Failed to copy teams details:', err);
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <Button variant="secondary" onClick={() => navigate(`/groups/${groupId}`)}>
                        &larr; Back to Group
                    </Button>
                    <h1 className={styles.title}>Manage Teams - {match.location}</h1>
                </div>

                <div className={styles.content}>
                    <Card>
                        <h2 className={styles.sectionTitle}>Assign Participants</h2>
                        <p className={styles.description}>
                            Assign team names and positions. Changes are saved automatically when you select an option.
                            Select a team from the list or create a new one.
                        </p>

                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Team</th>
                                        <th>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participantsToAssign.map((p) => {
                                        const pId = p.participantId || p.id;
                                        if (!pId) return null;
                                        
                                        const currentEdit = edits[pId] || { teamName: '', position: '' };
                                        const isCreating = isCreatingNewTeam[pId];

                                        // Determine if the currently edited team is a known team
                                        const isKnownTeam = uniqueTeams.includes(currentEdit.teamName || '');
                                        const selectValue = isCreating 
                                            ? 'NEW_TEAM' 
                                            : (isKnownTeam ? (currentEdit.teamName || '') : (currentEdit.teamName ? 'NEW_TEAM' : ''));

                                        return (
                                            <tr key={pId}>
                                                <td>{p.name}</td>
                                                <td>
                                                    <select 
                                                        value={selectValue}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'NEW_TEAM') {
                                                                setIsCreatingNewTeam(prev => ({ ...prev, [pId]: true }));
                                                                handleEditChange(pId, 'teamName', '');
                                                            } else {
                                                                setIsCreatingNewTeam(prev => ({ ...prev, [pId]: false }));
                                                                handleEditChange(pId, 'teamName', e.target.value);
                                                                handleSave(pId, { teamName: e.target.value, position: currentEdit.position });
                                                            }
                                                        }}
                                                        className={styles.select}
                                                    >
                                                        <option value="">-- Unassigned --</option>
                                                        {uniqueTeams.map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                        <option value="NEW_TEAM" style={{ fontWeight: 'bold' }}>+ Create New Team</option>
                                                    </select>

                                                    {(isCreating || (!isKnownTeam && currentEdit.teamName)) && (
                                                        <input 
                                                            type="text" 
                                                            value={currentEdit.teamName || ''} 
                                                            onChange={(e) => handleEditChange(pId, 'teamName', e.target.value)}
                                                            onBlur={(e) => {
                                                                if (e.target.value.trim()) {
                                                                    handleSave(pId, { teamName: e.target.value, position: currentEdit.position });
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                                    handleSave(pId, { teamName: e.currentTarget.value, position: currentEdit.position });
                                                                }
                                                            }}
                                                            placeholder="Type new team name..."
                                                            className={styles.input}
                                                            style={{ marginTop: '0.5rem' }}
                                                            autoFocus
                                                        />
                                                    )}
                                                </td>
                                                <td>
                                                    <select 
                                                        value={currentEdit.position || ''} 
                                                        onChange={(e) => {
                                                            handleEditChange(pId, 'position', e.target.value);
                                                            handleSave(pId, { teamName: currentEdit.teamName, position: e.target.value });
                                                        }}
                                                        className={styles.select}
                                                    >
                                                        <option value="">-- No Position --</option>
                                                        {positions?.map(pos => (
                                                            <option key={pos} value={pos}>{pos}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className={styles.teamsHeaderContainer}>
                        <h2 className={styles.teamsHeader}>Current Teams</h2>
                        <Button className={styles.copyTeamsBtn} onClick={handleCopyTeams}>
                            {copiedTeams ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    Copy Teams
                                </>
                            )}
                        </Button>
                    </div>
                    <div className={styles.teamsGrid}>
                        {Object.entries(teams).map(([teamName, members]) => (
                            <Card key={teamName} className={styles.teamCard}>
                                <h3 className={styles.teamName}>{teamName}</h3>
                                <ul className={styles.teamMembers}>
                                    {members.map((m, index) => (
                                        <li key={m.participantId || m.id} className={styles.teamMember}>
                                            <span className={styles.memberName}>{index + 1}. {m.name}</span>
                                            {m.position && <span className={styles.memberPosition}>{m.position}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MatchTeams;
