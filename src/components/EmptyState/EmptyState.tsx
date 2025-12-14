import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
    message: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => {
    return (
        <div className={styles.emptyState}>
            <p className={styles.message}>{message}</p>
            {action && <div className={styles.action}>{action}</div>}
        </div>
    );
};

export default EmptyState;
