import { useId, useState, useEffect } from 'react';
import Button from './Button.jsx';

function LikeButton({ itemLabel, isLiked, likeCount, onToggle, disabled }) {
    const inputId = useId();

    return (
        <div className="like-button">
            <input
                className="on"
                id={inputId}
                type="checkbox"
                checked={isLiked}
                onChange={onToggle}
                disabled={disabled}
                aria-label={`Like ${itemLabel}`}
            />
            <label className="like" htmlFor={inputId}>
                <svg className="like-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z" />
                </svg>
                <span className="like-text">Like</span>
            </label>
            <span className="like-count" aria-label={`${likeCount} likes`}>{likeCount}</span>
        </div>
    );
}

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [expandedPostId, setExpandedPostId] = useState(null);
    const [commentsMap, setCommentsMap] = useState({}); // Stores comments per post ID
    const [error, setError] = useState('');
    const [likeCounts, setLikeCounts] = useState({});
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [pendingLikes, setPendingLikes] = useState([]);
    const [likesLoaded, setLikesLoaded] = useState(false);

    // Fetch posts on component mount
    useEffect(() => {
        fetchPosts();
        fetchLikes();
    }, []);

    async function fetchPosts() {
        try {
            const response = await fetch('http://localhost:5000/api/posts/', {
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                setPosts(data);
            } else {
                setError('Failed to load posts.');
            }
        } catch (err) {
            setError('Could not connect to server.');
        }
    }

    async function fetchLikes() {
        try {
            const response = await fetch('http://localhost:5000/api/posts/likes/status', {
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to load likes');
            const data = await response.json();
            setLikeCounts(data.counts || {});
            setLikedPostIds(data.liked_post_ids || []);
            setLikesLoaded(true);
        } catch (err) {
            console.error('Failed to load likes:', err);
            setError('Could not load post likes.');
        }
    }

    async function toggleLike(postId) {
        if (!likesLoaded || pendingLikes.includes(postId)) return;

        const isLiked = likedPostIds.includes(postId);
        setPendingLikes(prev => [...prev, postId]);

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: isLiked ? 'DELETE' : 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(response.status === 401
                    ? 'Please log in to like posts.'
                    : (data.error || 'Could not update like.'));
            }
            // Reload authoritative counts, including changes made by other users.
            await fetchLikes();
        } catch (err) {
            alert(err.message);
        } finally {
            setPendingLikes(prev => prev.filter(id => id !== postId));
        }
    }

    async function addPost(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const body = formData.get('content').trim(); // Maps to backend 'body'

        try {
            const response = await fetch('http://localhost:5000/api/posts/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || 'Failed to create post');
                return;
            }

            form.reset();
            fetchPosts(); // Refresh feed after creating post
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    async function handleToggleExpand(postId) {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
        } else {
            setExpandedPostId(postId);
            // Fetch post detail and comments from backend
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                    credentials: 'include',
                });
                const data = await response.json();
                if (response.ok) {
                    setCommentsMap((prev) => ({
                        ...prev,
                        [postId]: data.comments || [],
                    }));
                }
            } catch (err) {
                console.error('Failed to load comments', err);
            }
        }
    }

    async function addComment(event, postId) {
        event.preventDefault();
        const form = event.currentTarget;
        const body = new FormData(form).get('comment').trim(); // Maps to backend 'body'

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ body }),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || 'Failed to add comment');
                return;
            }

            form.reset();
            
            // Refresh comments for this post
            const detailResponse = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                credentials: 'include',
            });
            const detailData = await detailResponse.json();
            if (detailResponse.ok) {
                setCommentsMap((prev) => ({
                    ...prev,
                    [postId]: detailData.comments || [],
                }));
            }
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    async function deleteComment(commentId, postId) {
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

            // Refresh the comments list for this specific post
            const detailResponse = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                credentials: 'include',
            });
            const detailData = await detailResponse.json();
            if (detailResponse.ok) {
                setCommentsMap((prev) => ({
                    ...prev,
                    [postId]: detailData.comments || [],
                }));
            }
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    const sortedPosts = [...posts].sort((firstPost, secondPost) => {
        const dateA = new Date(firstPost.created_at).getTime();
        const dateB = new Date(secondPost.created_at).getTime();
        if (sortOrder === 'oldest') return dateA - dateB;
        return dateB - dateA; // newest default
    });

    return (
        <main className="forum-page">
            <h1>Forum</h1>
            <p>Start a conversation about the music you love.</p>

            {error && <p role="alert" className="error-msg">{error}</p>}

            <section className="forum-compose" aria-labelledby="forum-compose-title">
                <h2 id="forum-compose-title">Write a post</h2>
                <form className="forum-form" onSubmit={addPost}>
                    <label htmlFor="post-title">Title</label>
                    <input className="form-input forum-control" id="post-title" name="title" maxLength="100" required />
                    <label htmlFor="post-content">Your post</label>
                    <textarea className="form-input forum-control forum-textarea" id="post-content" name="content" rows="4" maxLength="2000" required />
                    <Button className="button--primary" type="submit">Publish post</Button>
                </form>
            </section>

            <section className="forum-list" aria-labelledby="forum-list-title">
                <div className="forum-list-header">
                    <h2 id="forum-list-title">Discussions</h2>
                    <label className="forum-sort-label" htmlFor="forum-sort">Sort by</label>
                    <select
                        className="form-input forum-sort"
                        id="forum-sort"
                        value={sortOrder}
                        onChange={(event) => setSortOrder(event.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
                {sortedPosts.length === 0 ? (
                    <p className="forum-empty">No discussions yet. Your post will be the first.</p>
                ) : sortedPosts.map((post) => {
                    const postComments = commentsMap[post.id] || [];
                    const authorName = post.users?.username || 'Anonymous';

                    return (
                        <article className="forum-post" key={post.id}>
                            <div className="forum-post-heading">
                                <button
                                    className="forum-post-toggle"
                                    type="button"
                                    aria-expanded={expandedPostId === post.id}
                                    aria-controls={`comments-${post.id}`}
                                    onClick={() => handleToggleExpand(post.id)}
                                >
                                    <span className="forum-post-title">{post.title}</span>
                                    <span className="forum-post-content">{post.body}</span>
                                    <span className="forum-post-meta">{authorName} | {postComments.length} comments</span>
                                    <span className="forum-post-indicator" aria-hidden="true">
                                        {expandedPostId === post.id ? 'Hide' : 'Show'}
                                    </span>
                                </button>
                                <LikeButton
                                    itemLabel={`post ${post.title}`}
                                    isLiked={likedPostIds.includes(post.id)}
                                    likeCount={likeCounts[post.id] || 0}
                                    onToggle={() => toggleLike(post.id)}
                                    disabled={!likesLoaded || pendingLikes.includes(post.id)}
                                />
                            </div>
                            <section
                                className="forum-comments"
                                id={`comments-${post.id}`}
                                aria-label={`Comments on ${post.title}`}
                                hidden={expandedPostId !== post.id}
                            >
                                <h4>Comments ({postComments.length})</h4>
                                {postComments.map((comment) => {
                                    const commentAuthor = comment.users?.username || 'Anonymous';
                                    return (
                                        <div className="forum-comment-row" key={comment.id}>
                                            <p className="forum-comment">
                                                <strong>{commentAuthor}:</strong> {comment.body}
                                            </p>
                                            <button 
                                                className="forum-comment-delete" 
                                                type="button" 
                                                onClick={() => deleteComment(comment.id, post.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    );
                                })}
                                <form className="forum-comment-form" onSubmit={(event) => addComment(event, post.id)}>
                                    <label className="visually-hidden" htmlFor={`comment-${post.id}`}>Add a comment</label>
                                    <input
                                        className="form-input forum-control"
                                        id={`comment-${post.id}`}
                                        name="comment"
                                        placeholder="Write a comment..."
                                        maxLength="500"
                                        required
                                    />
                                    <Button type="submit">Comment</Button>
                                </form>
                            </section>
                        </article>
                    );
                })}
            </section>
        </main>
    );
}