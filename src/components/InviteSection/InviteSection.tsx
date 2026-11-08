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
    const [copied, setCopied] = useState(false);

    const queryClient = useQueryClient();
    const createInvite = useCreateInvite();

    const handleGenerateLink = async () => {
        setError('');
        setInviteLink('');
        setCopied(false);

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

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
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
                        <div className={styles.linkContainer}>
                            <code className={styles.secretCode}>{inviteLink}</code>
                            <Button
                                onClick={handleCopy}
                                variant="secondary"
                                className={styles.copyButton}
                                disabled={copied}
                                title={copied ? "Copied!" : "Copy to clipboard"}
                            >
                                {copied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                )}
                            </Button>
                        </div>
                        <p className={styles.secretHint}>Share this link with anyone you want to invite</p>
                    </div>
                )}
            </Card>


        </div>
    );
};

export default InviteSection;
