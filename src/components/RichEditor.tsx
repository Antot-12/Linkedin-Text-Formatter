import React, { useRef, useEffect, useState } from 'react';
import avatar from '../assets/unnamed.png';

interface Props {
    onChange: (html: string) => void;
}

const fontGroups = [
    {
        title: 'System Fonts',
        fonts: [
            { label: 'Default', style: { fontFamily: 'inherit' } },
            { label: 'Sans Serif', style: { fontFamily: 'Arial, sans-serif' } },
            { label: 'Serif Italic', style: { fontFamily: 'Georgia, serif', fontStyle: 'italic' } },
            { label: 'Monospace', style: { fontFamily: 'Courier New, monospace' } }
        ]
    },
    {
        title: 'Modern Fonts',
        fonts: [
            { label: 'Futuristic', style: { fontFamily: '"Orbitron", sans-serif' } },
            { label: 'Tech Mono', style: { fontFamily: '"Share Tech Mono", monospace' } },
            { label: 'Elegant Serif', style: { fontFamily: '"Playfair Display", serif' } }
        ]
    },
    {
        title: 'Casual & Decorative',
        fonts: [
            { label: 'Comic', style: { fontFamily: '"Comic Sans MS", cursive, sans-serif' } },
            { label: 'Cursive', style: { fontFamily: '"Brush Script MT", cursive' } },
            { label: 'Trebuchet', style: { fontFamily: '"Trebuchet MS", sans-serif' } }
        ]
    }
];

const RichEditor: React.FC<Props> = ({ onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showExtras, setShowExtras] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [htmlSnapshot, setHtmlSnapshot] = useState('');

    useEffect(() => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
            setHtmlSnapshot(html);
        }
    }, [onChange]);

    const executeCommand = (command: string, value?: string) => {
        try {
            document.execCommand(command, false, value);
        } catch (error) {
            console.error('Command execution failed:', error);
        }

        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
            setHtmlSnapshot(html);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            const text = editorRef.current.innerText.trim();
            const html = editorRef.current.innerHTML;
            setIsEmpty(text.length === 0);
            onChange(html);
            setHtmlSnapshot(html);
        }
    };

    const handleClear = () => {
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
            setIsEmpty(true);
            onChange('');
            setHtmlSnapshot('');
        }
    };

    const emojis = ['🔥', '✅', '🚀', '💼', '📣', '🎯', '✨', '👍', '👏', '💡'];

    const handleEmojiClick = (emoji: string) => {
        executeCommand('insertText', emoji);
        setShowEmoji(false);
    };

    const handleLinkClick = () => {
        const url = prompt('Enter the URL:');
        if (url) {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                executeCommand('createLink', url);
            } else {
                const linkText = prompt('Enter the link text:', url);
                if (linkText) {
                    executeCommand(
                        'insertHTML',
                        `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
                    );
                }
            }
        }
    };

    const handleCopyFromPreview = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const text = el.innerText;
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    alert('✅ Copied styled text!');
                })
                .catch(() => {
                    alert('❌ Copy failed');
                });
        }
    };

    return (
        <div className="left-panel">
            <h2 style={{ marginBottom: '2rem' }}>Write your post</h2>

            <div className="editor-wrapper">
                <div className="editor-header">
                    <img src={avatar} alt="avatar" className="editor-avatar" />
                    <div>
                        <div className="editor-name">Jane Doe</div>
                        <div className="editor-meta">Frontend Developer</div>
                    </div>
                </div>

                <div className="toolbar">
                    <button className="icon-btn" onClick={() => executeCommand('bold')} title="Bold">B</button>
                    <button className="icon-btn" onClick={() => executeCommand('italic')} title="Italic">I</button>
                    <button className="icon-btn" onClick={() => executeCommand('underline')} title="Underline">U</button>
                    <button className="icon-btn" onClick={() => executeCommand('strikeThrough')} title="Strikethrough">S</button>

                    <div className="emoji-wrapper">
                        <button className="icon-btn" onClick={() => setShowEmoji(p => !p)} title="Emoji">😊</button>
                        {showEmoji && (
                            <div className="emoji-menu">
                                {emojis.map((emoji) => (
                                    <button key={emoji} className="toolbar-btn" onClick={() => handleEmojiClick(emoji)}>
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="icon-btn" onClick={() => executeCommand('insertImage', prompt('Image URL') || '')} title="Image">🖼️</button>
                    <button className="icon-btn" onClick={handleLinkClick} title="Link">🌐</button>

                    <div className="divider" />

                    <button className="icon-btn" onClick={() => executeCommand('undo')} title="Undo">↶</button>
                    <button className="icon-btn" onClick={() => executeCommand('redo')} title="Redo">↷</button>
                    <button className="icon-btn" onClick={() => executeCommand('removeFormat')} title="Remove Formatting">🧽</button>
                    <button className="icon-btn" onClick={handleClear} title="Clear All">🗑️</button>

                    <div className="divider" />

                    <button className="icon-btn" onClick={() => executeCommand('insertUnorderedList')} title="Bullet List">•</button>
                    <button className="icon-btn" onClick={() => executeCommand('insertOrderedList')} title="Numbered List">1.</button>
                    <button className="icon-btn" onClick={() => executeCommand('justifyLeft')} title="Align Left">⬅️</button>
                    <button className="icon-btn" onClick={() => executeCommand('justifyCenter')} title="Align Center">↔️</button>
                    <button className="icon-btn" onClick={() => executeCommand('justifyRight')} title="Align Right">➡️</button>
                </div>

                <div className="editor-box-container">
                    {isEmpty && <div className="placeholder">What do you want to talk about?</div>}
                    <div
                        ref={editorRef}
                        className="editor-box"
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                    />
                </div>

                <button className="toggle-extras-btn" onClick={() => setShowExtras(p => !p)}>
                    {showExtras ? 'Hide Font Previews ▲' : 'Show Font Previews ▼'}
                </button>

                {showExtras && (
                    <div className="extras-font-section">
                        {fontGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="font-group">
                                <h3 className="font-group-title">{group.title}</h3>
                                <div className="extras-grid">
                                    {group.fonts.map((font, idx) => {
                                        const id = `font-preview-${groupIdx}-${idx}`;
                                        return (
                                            <div key={id} className="extra-box" style={font.style}>
                                                <h4>{font.label}</h4>
                                                <div className="font-preview-box">
                                                    <div id={id} dangerouslySetInnerHTML={{ __html: htmlSnapshot }} />
                                                    <button className="copy-font-btn" onClick={() => handleCopyFromPreview(id)}>
                                                        📋 Copy
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RichEditor;
