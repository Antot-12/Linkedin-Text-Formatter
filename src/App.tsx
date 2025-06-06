import React, { useState } from 'react';
import './assets/styles.css';
import RichEditor from './components/RichEditor';
import PostPreview from './components/PostPreview';

const App: React.FC = () => {
    const [html, setHtml] = useState('');
    return (
        <div className="container">
            <RichEditor onChange={setHtml} />
            <PostPreview html={html} />
        </div>
    );
};

export default App;
