import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium' }) => {
    return (
        <div className={`${styles.spinner} ${styles[size]}`}>
            <div className={styles.circle}></div>
        </div>
    );
};

export default Spinner;
