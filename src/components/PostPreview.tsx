import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import avatar from '../assets/unnamed.png';

interface Props {
    html: string;
}

const WORD_LIMIT = 35;

const boldBaseUC = 0x1d400;
const boldBaseLC = 0x1d41a;
const italicBaseUC = 0x1d434;
const italicBaseLC = 0x1d44e;
const boldItBaseUC = 0x1d468;
const boldItBaseLC = 0x1d482;
const boldNumBase = 0x1d7ce;

const underlineComb = '\u0332';
const strikeComb = '\u0336';

type TextStyle = {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
};

const mapLatin = (ch: string, mode: 'bold' | 'italic' | 'boldItalic'): string => {
    if (!/[A-Za-z0-9]/.test(ch)) return ch;

    if (/\d/.test(ch) && mode === 'bold') {
        return String.fromCodePoint(boldNumBase + (+ch));
    }

    const upper = ch >= 'A' && ch <= 'Z';
    const code = ch.charCodeAt(0) - (upper ? 65 : 97);
    const base =
        mode === 'bold'
            ? upper
                ? boldBaseUC
                : boldBaseLC
            : mode === 'italic'
                ? upper
                    ? italicBaseUC
                    : italicBaseLC
                : upper
                    ? boldItBaseUC
                    : boldItBaseLC;

    return String.fromCodePoint(base + code);
};

const stylise = (text: string, style: TextStyle): string => {
    let transformed = text;

    if (style.bold && style.italic) {
        transformed = transformed.split('').map(c => mapLatin(c, 'boldItalic')).join('');
    } else if (style.bold) {
        transformed = transformed.split('').map(c => mapLatin(c, 'bold')).join('');
    } else if (style.italic) {
        transformed = transformed.split('').map(c => mapLatin(c, 'italic')).join('');
    }

    if (style.underline) {
        transformed = transformed.split('').map(c => c + underlineComb).join('');
    }

    if (style.strike) {
        transformed = transformed.split('').map(c => c + strikeComb).join('');
    }

    return transformed;
};

const PostPreview: React.FC<Props> = ({ html }) => {
    const [shortHtml, setShortHtml] = useState('');
    const [hasText, setHasText] = useState(false);
    const fullPreview = useRef('');
    const expanded = useRef(false);
    const [, bump] = useState(0);

    const safe = (h: string) =>
        DOMPurify.sanitize(h, {
            ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'ul', 'ol', 'li', 'br', 'p', 'a', 'span'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'style']
        });

    const tagHash = (h: string) =>
        h.replace(/(#\w[\w\d]*)/g, '<span class="hashtag">$1</span>');

    const refresh = () => {
        fullPreview.current = tagHash(safe(html));

        const helper = document.createElement('div');
        helper.innerHTML = safe(html);
        const words = (helper.textContent || '').trim().split(/\s+/);
        setHasText(words.length > 0);

        if (words.length <= WORD_LIMIT) {
            setShortHtml(fullPreview.current);
        } else {
            const cut = words.slice(0, WORD_LIMIT).join(' ') + '…';
            setShortHtml(tagHash(DOMPurify.sanitize(cut)));
        }
    };

    useEffect(refresh, [html]);

    const domToUnicode = (node: Node, active: TextStyle = {}, isLast = false): string => {
        let out = '';

        const nextStyle = (base: TextStyle): TextStyle => ({ ...base });

        if (node.nodeType === 3) {
            out += stylise((node as Text).nodeValue || '', active);
        } else if (node.nodeType === 1) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();

            const st = nextStyle(active);
            if (tag === 'b' || tag === 'strong') st.bold = true;
            if (tag === 'i' || tag === 'em') st.italic = true;
            if (tag === 'u') st.underline = true;
            if (tag === 's' || tag === 'strike') st.strike = true;

            if (tag === 'br') {
                out += '\n';
            } else if (tag === 'li') {
                const inner = Array.from(el.childNodes).map((n, i, a) => domToUnicode(n, st, i === a.length - 1)).join('');
                out += `• ${inner}\n`;
            } else if (tag === 'a') {
                out += stylise(el.textContent || '', st) + ` (${el.getAttribute('href')})`;
            } else {
                const children = Array.from(el.childNodes);
                children.forEach((child, idx) => {
                    out += domToUnicode(child, st, idx === children.length - 1);
                });

                if ((tag === 'p' || tag === 'div') && !isLast && !out.endsWith('\n')) {
                    out += '\n';
                }
            }
        }

        return out;
    };

    const handleCopy = () => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = safe(html);
        const text = domToUnicode(wrapper).trim();

        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('✅ Copied as styled Unicode!');
    };

    return (
        <div className="right-panel">
            <h2 style={{ marginBottom: '2rem' }}>Live Preview</h2>
            <div className="preview-card">
                <div className="preview-header">
                    <img src={avatar} className="preview-avatar" alt="" />
                    <div>
                        <div className="preview-name">Jane Doe</div>
                        <div className="preview-meta">Frontend Developer • 1h</div>
                    </div>
                </div>

                {!hasText ? (
                    <div className="preview-placeholder">
                        Start writing and your post will appear here…
                    </div>
                ) : (
                    <>
                        <div
                            className="preview-content"
                            dangerouslySetInnerHTML={{
                                __html: expanded.current ? fullPreview.current : shortHtml
                            }}
                        />
                        {shortHtml !== fullPreview.current && (
                            <div className="preview-toggle">
                                <span
                                    className="toggle-link"
                                    onClick={() => {
                                        expanded.current = !expanded.current;
                                        bump(x => x + 1);
                                    }}
                                >
                                    {expanded.current ? 'collapse' : '…more'}
                                </span>
                            </div>
                        )}
                    </>
                )}

                <div className="stats-bar">
                    <div className="likes-count">👍 57</div>
                    <div className="comments-reposts">
                        <span>💬 26 comments</span>
                        <span>🔁 6 reposts</span>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="action-btn">👍 Like</button>
                    <button className="action-btn">💬 Comment</button>
                    <button className="action-btn">🔁 Share</button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button className="copy-btn" onClick={handleCopy}>
                        📋 Copy (Unicode Styled)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPreview;
