import React from 'react';
import type {PreviewMode} from '../types';

interface Props {
    text: string;
    mode: PreviewMode;
}

const getShortText = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 30) return text;
    return words.slice(0, 30).join(' ') + '... [показати більше]';
};

const Preview: React.FC<Props> = ({ text, mode }) => {
    return (
        <div>
            <h2>Попередній перегляд ({mode === 'short' ? 'Скорочений' : 'Повний'}):</h2>
            <div
                style={{
                    padding: '1rem',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '10px',
                    whiteSpace: 'pre-wrap',
                    marginTop: '0.5rem',
                }}
            >
                {mode === 'short' ? getShortText(text) : text}
            </div>
        </div>
    );
};

export default Preview;
