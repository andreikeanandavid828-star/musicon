import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
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
    const [error, setError] = useState('');
    const [likeCounts, setLikeCounts] = useState({});
    const [likedPostIds, setLikedPostIds] = useState([]);
    const [pendingLikes, setPendingLikes] = useState([]);
    const [likesLoaded, setLikesLoaded] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchLikes();
    }, []);

    async function fetchPosts() {
        try {
            const response = await fetch('http://localhost:5000/api/posts/', { credentials: 'include' });
            const data = await response.json();
            if (response.ok) setPosts(data);
            else setError('Failed to load posts.');
        } catch (err) {
            setError('Could not connect to server.');
        }
    }

    async function fetchLikes() {
        try {
            const response = await fetch('http://localhost:5000/api/posts/likes/status', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to load likes');
            const data = await response.json();
            setLikeCounts(data.counts || {});
            setLikedPostIds(data.liked_post_ids || []);
            setLikesLoaded(true);
        } catch (err) {
            console.error('Failed to load likes:', err);
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
            if (!response.ok) throw new Error('Could not update like.');
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
        const body = formData.get('content').trim();

        try {
            const response = await fetch('http://localhost:5000/api/posts/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body }),
            });
            const result = await response.json();
            if (!response.ok) {
                alert(result.error || 'Failed to create post');
                return;
            }
            form.reset();
            fetchPosts();
        } catch (err) {
            alert('Could not connect to server.');
        }
    }

    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return (
        <main className="forum-page">
            <h1>Forum</h1>
            <p>Start a conversation about the music you love.</p>

            {error && <p role="alert" className="error-msg">{error}</p>}

            <section className="forum-compose">
                <h2>Write a post</h2>
                <form className="forum-form" onSubmit={addPost}>
                    <label htmlFor="post-title">Title</label>
                    <input className="form-input forum-control" id="post-title" name="title" maxLength="100" required />
                    <label htmlFor="post-content">Your post</label>
                    <textarea className="form-input forum-control forum-textarea" id="post-content" name="content" rows="4" maxLength="2000" required />
                    <Button className="button--primary" type="submit">Publish post</Button>
                </form>
            </section>

            <section className="forum-list">
                <div className="forum-list-header">
                    <h2>Discussions</h2>
                    <select
                        className="form-input forum-sort"
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
                    const authorName = post.users?.username || 'Anonymous';
                    return (
                        <article className="forum-post" key={post.id}>
                            <div className="forum-post-heading">
                                <div className="forum-post-main">
                                    <Link to={`/forum/posts/${post.id}`} className="forum-post-title-link">
                                        <h3 className="forum-post-title">{post.title}</h3>
                                    </Link>
                                    <p className="forum-post-content">{post.body}</p>
                                    <span className="forum-post-meta">Posted by {authorName}</span>
                                </div>
                                <LikeButton
                                    itemLabel={`post ${post.title}`}
                                    isLiked={likedPostIds.includes(post.id)}
                                    likeCount={likeCounts[post.id] || 0}
                                    onToggle={() => toggleLike(post.id)}
                                    disabled={!likesLoaded || pendingLikes.includes(post.id)}
                                />
                            </div>
                        </article>
                    );
                })}
            </section>
        </main>
    );
}