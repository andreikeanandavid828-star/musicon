import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from './Button.jsx';

const placeholderName = 'MusicBox listener';

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [expandedPostId, setExpandedPostId] = useState(null);

    function addPost(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const content = formData.get('content').trim();

        setPosts((currentPosts) => [
            { id: crypto.randomUUID(), title, content, author: placeholderName, createdAt: Date.now(), comments: [] },
            ...currentPosts,
        ]);
        form.reset();
    }

    function addComment(event, postId) {
        event.preventDefault();
        const form = event.currentTarget;
        const content = new FormData(form).get('comment').trim();

        setPosts((currentPosts) => currentPosts.map((post) => (
            post.id === postId
                ? { ...post, comments: [...post.comments, { id: crypto.randomUUID(), content, author: placeholderName }] }
                : post
        )));
        form.reset();
    }

    const sortedPosts = [...posts].sort((firstPost, secondPost) => {
        if (sortOrder === 'oldest') return firstPost.createdAt - secondPost.createdAt;
        if (sortOrder === 'most-comments') return secondPost.comments.length - firstPost.comments.length;
        return secondPost.createdAt - firstPost.createdAt;
    });

    return (
        <main className="forum-page">
            <h1>Forum</h1>
            <p>Start a conversation about the music you love.</p>

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
                        <option value="most-comments">Most comments</option>
                    </select>
                </div>
                {sortedPosts.length === 0 ? (
                    <p className="forum-empty">No discussions yet. Your post will be the first.</p>
                ) : sortedPosts.map((post) => (
                    <article className="forum-post" key={post.id}>
                        <button
                            className="forum-post-toggle"
                            type="button"
                            aria-expanded={expandedPostId === post.id}
                            aria-controls={`comments-${post.id}`}
                            onClick={() => setExpandedPostId((currentId) => currentId === post.id ? null : post.id)}
                        >
                            <span className="forum-post-title">{post.title}</span>
                            <span className="forum-post-content">{post.content}</span>
                            <span className="forum-post-meta">{post.author} | {post.comments.length} comments</span>
                            <span className="forum-post-indicator" aria-hidden="true">
                                {expandedPostId === post.id ? 'Hide' : 'Show'}
                            </span>
                        </button>
                        <section
                            className="forum-comments"
                            id={`comments-${post.id}`}
                            aria-label={`Comments on ${post.title}`}
                            hidden={expandedPostId !== post.id}
                        >
                            <h4>Comments ({post.comments.length})</h4>
                            {post.comments.map((comment) => (
                                <p className="forum-comment" key={comment.id}>
                                    <strong>{comment.author}:</strong> {comment.content}
                                </p>
                            ))}
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
                ))}
            </section>
        </main>
    );
}