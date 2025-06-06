import React, { useState, useRef } from 'react';

interface Props {
    onChange: (text: string) => void;
}

const Formatter: React.FC<Props> = ({ onChange }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const updateText = (newText: string) => {
        setText(newText);
        onChange(newText);
    };

    const applyFormat = (prefix: string, suffix = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = text.slice(start, end);
        const formatted = prefix + selected + suffix;

        const newText = text.slice(0, start) + formatted + text.slice(end);
        updateText(newText);

        setTimeout(() => {
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
            textarea.focus();
        }, 0);
    };

    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const newText = text.slice(0, start) + emoji + text.slice(start);
        updateText(newText);

        setTimeout(() => {
            textarea.setSelectionRange(start + emoji.length, start + emoji.length);
            textarea.focus();
        }, 0);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        alert('Текст скопійовано!');
    };

    return (
        <div>
            <h2>Введіть або вставте свій текст:</h2>
            <div>
                <button onClick={() => applyFormat('**', '**')}>Жирний</button>
                <button onClick={() => applyFormat('_', '_')}>Курсив</button>
                <button onClick={() => applyFormat('• ', '')}>Маркер</button>
                <button onClick={() => insertEmoji('💼')}>💼</button>
                <button onClick={() => insertEmoji('✅')}>✅</button>
                <button onClick={() => insertEmoji('🔥')}>🔥</button>
            </div>
            <textarea
                ref={textareaRef}
                rows={10}
                value={text}
                onChange={(e) => updateText(e.target.value)}
                placeholder="Ваш пост для LinkedIn тут..."
                style={{ width: '100%', marginBottom: '1rem' }}
            />
            <button onClick={copyToClipboard}>Скопіювати</button>
        </div>
    );
};

export default Formatter;
