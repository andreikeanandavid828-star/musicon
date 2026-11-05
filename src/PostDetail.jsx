import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from './Button.jsx';

export default function PostDetail() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null); // Fixed capitalization match
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
                setPost(data);
                setComments(data.comments || []);
            } else {
                setError('Failed to load post.');
            }
        } catch (err) {
            setError('Could not connect to server.');
        }
    }

    async function addComment(event) {
        event.preventDefault();
        const form = event.currentTarget; // Fixed typo: eventD -> event
        const body = new FormData(form).get('comment').trim();

        try {
            // Added postId back into the endpoint URL
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
            fetchPostDetails(); // Refresh comments
       } catch (err) {
            alert('Could not connect to server.');
       }  
    }

    async function deleteComment(commentId) {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            // Fixed single quotes to backticks for template literal interpolation
            const response = await fetch(`http://localhost:5000/api/posts/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok) {
                alert(result.error || 'Failed to delete comment');
                return;
            }
            fetchPostDetails(); // Refresh comments
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    if (error) return <main className="forum-page"><p className="error-msg">{error}</p><Link to="/forum">Back to Forum</Link></main>;
    
    if (!post) return <main className="forum-page"><p>Loading...</p></main>;

    const authorName = post.users?.username || 'Anonymous';

    return (
        <main className="forum-page">
            <p><Link to="/forum">&larr; Back to all discussions</Link></p>

            <article className="forum-post-detail">
                <h1>{post.title}</h1>
                <p className="forum-post-meta">Posted by {authorName}</p>
                <div className="forum-post-body-full">
                    <p>{post.body}</p>
                </div>
            </article>

            <section className="forum-comments-section" aria-label="Comments">
                <h3>Comments ({comments.length})</h3>

                {comments.map((comment) => {
                    const commentAuthor = comment.users?.username || 'Anonymous';
                    const isMyComment = comment.user_id === currentUserId;

                    return (
                        <div className="forum-comment-row" key={comment.id}>
                            <p className="forum-comment">
                                <strong>{commentAuthor}:</strong> {comment.body}
                            </p>
                            {isMyComment && (
                                <button
                                    className="forum-comment-delete"
                                    type="button"
                                    onClick={() => deleteComment(comment.id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    );
                })}
                <form className="forum-comment-form" onSubmit={addComment}>
                    <label className="visually-hidden" htmlFor="new-comment">Add a comment</label>
                    <input
                        className="form-input forum-control"
                        id="new-comment"
                        name="comment"
                        placeholder="Write a comment..."
                        maxLength="500"
                        required
                    />
                    <Button type="submit">Comment</Button>
                </form>
            </section>
        </main>
    );
}