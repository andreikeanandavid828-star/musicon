import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from './Button.jsx';

/**
 * @fileoverview Displays an individual forum post and its comments thread.
 * @module PostDetail
 */


function AuthorLink({ item }) {
    const username = item.users?.username || 'Anonymous';
    const userId = item.user_id ?? item.users?.id;

    if (!userId) {
        return username;
    }

    return (
        <Link
            to={`/users/${encodeURIComponent(userId)}`}
            style={{
                color: 'var(--accent)',
                fontWeight: 600
            }}
        >
            {username}
        </Link>
    );
}


export default function PostDetail() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchPostAndComments() {
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                    credentials: 'include',
                });
                const data = await response.json();
                
                if (response.ok) {
                    const postData = data.post || data;
                    setPost(postData);
                    setComments(data.comments || postData.comments || []);
                } else {
                    setError(data.error || 'Failed to load post.');
                }
            } catch (err) {
                setError('Could not connect to server.');
            }
        }

        fetchPostAndComments();
    }, [postId]);

    async function addComment(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const body = new FormData(form).get('comment').trim();

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body }),
            });
            const result = await response.json();
            if (!response.ok) {
                alert(result.error || 'Failed to add comment');
                return;
            }
            form.reset();
            
            // Refresh comments
            const refreshResponse = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                credentials: 'include',
            });
            const refreshData = await refreshResponse.json();
            if (refreshResponse.ok) {
                const postData = refreshData.post || refreshData;
                setComments(refreshData.comments || postData.comments || []);
            }
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    if (error) {
        return (
            <main className="forum-page">
                <p role="alert" className="error-msg">{error}</p>
                <Link to="/forum">← Back to Forum</Link>
            </main>
        );
    }

    if (!post) {
        return (
            <main className="forum-page">
                <p>Loading post…</p>
            </main>
        );
    }

    return (
        <main className="forum-page">
            <Link to="/forum" className="back-link">← Back to Forum</Link>
            
            <article className="forum-post detail-post" style={{ marginTop: '20px', padding: '20px' }}>
                <h1>{post.title}</h1>
                <p className="forum-post-content" style={{ fontSize: '1.1rem', margin: '15px 0' }}>
                    {post.body}
                </p>
                <span className="forum-post-meta">Posted by <AuthorLink item={post} /></span>
            </article>

            <section className="comments-section" style={{ marginTop: '30px' }}>
                <h2>Comments ({comments.length})</h2>

                <form className="forum-form" onSubmit={addComment} style={{ margin: '20px 0' }}>
                    <textarea 
                        className="form-input forum-control forum-textarea" 
                        name="comment" 
                        rows="3" 
                        placeholder="Write a comment..." 
                        maxLength="1000" 
                        required 
                    />
                    <Button className="button--primary" type="submit">Post Comment</Button>
                </form>

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="forum-empty">No comments yet. Be the first to reply!</p>
                    ) : (
                        comments.map((comment, index) => (
                            <div key={comment.id || index} className="comment-card" style={{ padding: '12px', borderBottom: '1px solid var(--border)', margin: '10px 0' }}>
                                <p>{comment.body}</p>
                                <span className="forum-post-meta" style={{ fontSize: '0.85rem' }}>
                                    <AuthorLink item={comment} />
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}