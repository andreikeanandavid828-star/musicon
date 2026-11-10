import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function PostDetail() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCurrentUser();
        fetchPostDetails();
    }, [postId]);

    async function fetchCurrentUser() {
        try {
            const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setCurrentUserId(data.id || data.user_id);
            }
        } catch (err) {
            console.error('Could not fetch current user:', err);
        }
    }

    async function fetchPostDetails() {
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, { 
                credentials: 'include' 
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
            fetchPostDetails(); 
       } catch (err) {
            alert('Could not connect to server.');
       }  
    }

    async function deleteComment(commentId) {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok) {
                alert(result.error || 'Failed to delete comment');
                return;
            }
            fetchPostDetails(); 
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    if (error) {
        return (
            <main className="forum-page">
                <p className="error-msg">{error}</p>
                <Link to="/forum">&larr; Back to Forum</Link>
            </main>
        );
    }
    
    if (!post) {
        return (
            <main className="forum-page">
                <p>Loading discussion...</p>
            </main>
        );
    }

    const authorName = post.users?.username || post.username || 'Anonymous';
    const postTitle = post.title || 'Untitled Discussion';
    const postBody = post.body || post.content || '';
    
    const rawPostAvatarPath = post.users?.profile_picture_path || post.profile_picture_path;
    const postAvatarPath = (rawPostAvatarPath && !rawPostAvatarPath.startsWith('file:///')) ? rawPostAvatarPath : null;
    const postAvatarUrl = postAvatarPath 
        ? `https://lpvgrxwgruhlxbboivth.supabase.co/storage/v1/object/public/profile-images/${postAvatarPath}` 
        : null;

    return (
        <main className="forum-page">
            <p><Link to="/forum" className="back-link">&larr; Back to all discussions</Link></p>

            <article className="forum-post-detail" style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    {postAvatarUrl ? (
                        <img 
                            src={postAvatarUrl} 
                            alt={`${authorName}'s avatar`} 
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--border)', display: 'grid', placeItems: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <h1 style={{ overflowWrap: 'break-word', wordBreak: 'break-word', margin: 0, fontSize: '1.8rem' }}>
                            {postTitle}
                        </h1>
                        <p className="forum-post-meta" style={{ margin: '4px 0 0 0' }}>
                            Posted by <strong>{authorName}</strong>
                        </p>
                    </div>
                </div>

                <div className="forum-post-body-full" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.6', marginTop: '16px' }}>
                    <p style={{ margin: 0 }}>{postBody}</p>
                </div>
            </article>

            <section className="forum-comments-section" aria-label="Comments">
                <h3 style={{ marginBottom: '16px' }}>Comments ({comments.length})</h3>

                {comments.length === 0 ? (
                    <p className="forum-empty" style={{ marginBottom: '24px' }}>No comments yet. Start the conversation below!</p>
                ) : (
                    comments.map((comment) => {
                        const commentAuthor = comment.users?.username || comment.username || 'Anonymous';
                        const rawCommentAvatarPath = comment.users?.profile_picture_path || comment.profile_picture_path;
                        const commentAvatarPath = (rawCommentAvatarPath && !rawCommentAvatarPath.startsWith('file:///')) ? rawCommentAvatarPath : null;
                        
                        const commentAvatarUrl = commentAvatarPath 
                            ? `https://lpvgrxwgruhlxbboivth.supabase.co/storage/v1/object/public/profile-images/${commentAvatarPath}` 
                            : null;
                        const isMyComment = comment.user_id === currentUserId;

                        return (
                            <div className="forum-comment-row" key={comment.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                                {commentAvatarUrl ? (
                                    <img 
                                        src={commentAvatarUrl} 
                                        alt={`${commentAuthor}'s avatar`} 
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
                                        {commentAuthor.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="forum-comment" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', margin: 0 }}>
                                        <strong>{commentAuthor}:</strong> {comment.body || comment.content}
                                    </p>
                                </div>

                                {isMyComment && (
                                    <button
                                        className="forum-comment-delete button"
                                        type="button"
                                        onClick={() => deleteComment(comment.id)}
                                        style={{ padding: '4px 8px', fontSize: '0.81rem', flexShrink: 0 }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}

                <form className="forum-comment-form" onSubmit={addComment} style={{ marginTop: '24px' }}>
                    <label className="visually-hidden" htmlFor="new-comment">Add a comment</label>
                    <input
                        className="form-input forum-control"
                        id="new-comment"
                        name="comment"
                        placeholder="Write a comment..."
                        maxLength="500"
                        required
                    />
                    <Button type="submit" className="button--primary">Comment</Button>
                </form>
            </section>
        </main>
    );
}