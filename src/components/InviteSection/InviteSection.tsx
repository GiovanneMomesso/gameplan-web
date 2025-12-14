import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateInvite, groupKeys } from '../../api';
import Card from '../Card/Card';
import Button from '../Button/Button';

import styles from './InviteSection.module.css';

interface InviteSectionProps {
    groupId: number;
}

const InviteSection: React.FC<InviteSectionProps> = ({ groupId }) => {
    const [inviteLink, setInviteLink] = useState('');
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const createInvite = useCreateInvite();

    const handleGenerateLink = async () => {
        setError('');
        setInviteLink('');

        try {
            const response = await createInvite.mutateAsync({
                groupId,
                data: {},
            });

            const link = `${window.location.origin}/join?hash=${response.secretHash}`;
            setInviteLink(link);
            queryClient.invalidateQueries({ queryKey: groupKeys.invites(groupId) });
        } catch (err: any) {
            setError(err?.message || 'Failed to create public link');
        }
    };

    return (
        <div className={styles.container}>
            <Card>
                <h3 className={styles.title}>Invite Members</h3>

                <div className={styles.actions}>
                    <p className={styles.description}>
                        Generate a unique link to invite new members to this group.
                    </p>
                    <Button
                        onClick={handleGenerateLink}
                        isLoading={createInvite.isPending}
                        className={styles.generateButton}
                    >
                        Generate Invite Link
                    </Button>
                    {error && <p className={styles.error}>{error}</p>}
                </div>

                {inviteLink && (
                    <div className={styles.secretHash}>
                        <p className={styles.secretLabel}>Invite Link:</p>
                        <code className={styles.secretCode}>{inviteLink}</code>
                        <p className={styles.secretHint}>Share this link with anyone you want to invite</p>
                    </div>
                )}
            </Card>


        </div>
    );
};

export default InviteSection;
