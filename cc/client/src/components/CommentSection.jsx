import { useState } from 'react'
import { useApp } from '../services/AppContext.jsx'
import * as api from '../services/api.js'
import { timeAgo } from '../services/utils.js'
import RoleBadge from './RoleBadge.jsx'

function CommentBox({ onSubmit, placeholder, autoFocus, onCancel }) {
  const [text, setText] = useState('')
  const submit = async () => { if (await onSubmit(text)) { setText(''); onCancel?.() } }
  return (
    <div className="flex gap-2 items-start">
      <textarea autoFocus={autoFocus} value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={placeholder} className="input" />
      <div className="flex flex-col gap-1">
        <button onClick={submit} className="btn-primary btn-sm">Post</button>
        {onCancel && <button onClick={onCancel} className="btn-outline btn-sm">Cancel</button>}
      </div>
    </div>
  )
}

function Node({ c, all, post, depth }) {
  const { db, user, act } = useApp()
  const [replying, setReplying] = useState(false)
  const author = db.users.find((u) => u.id === c.authorId)
  const children = all.filter((x) => x.parentId === c.id)
  return (
    <div className={depth ? 'ml-4 pl-3 border-l-2 border-slate-200' : ''}>
      <div className="py-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{author?.name || 'Unknown'}</span>
          {author && <RoleBadge role={author.role} />}<span>{timeAgo(c.createdAt)}</span>
        </div>
        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{c.text}</p>
        <div className="flex gap-3 mt-1 text-xs font-semibold text-slate-500">
          <button onClick={() => setReplying(!replying)} className="hover:text-accent">Reply</button>
          {api.canDeleteComment(user, c, post) && (
            <button onClick={() => window.confirm('Delete this comment and its replies?') && act(() => api.deleteComment(c.id), 'Comment deleted')} className="hover:text-red-600">Delete</button>
          )}
        </div>
        {replying && <div className="mt-2"><CommentBox autoFocus placeholder={`Reply to ${author?.name}...`} onCancel={() => setReplying(false)} onSubmit={(t) => act(() => api.addComment({ postId: post.id, parentId: c.id, text: t }), 'Reply posted')} /></div>}
      </div>
      {children.map((ch) => <Node key={ch.id} c={ch} all={all} post={post} depth={depth + 1} />)}
    </div>
  )
}

export default function CommentSection({ post }) {
  const { db, user, act } = useApp()
  const all = db.comments.filter((c) => c.postId === post.id).sort((a, b) => a.createdAt - b.createdAt)
  return (
    <div className="border-t border-slate-100 mt-3 pt-3">
      <CommentBox placeholder="Add a comment..." onSubmit={(t) => act(() => api.addComment({ postId: post.id, text: t }), 'Comment posted')} />
      <div className="mt-2 divide-y divide-slate-100">
        {all.filter((c) => !c.parentId).map((c) => <Node key={c.id} c={c} all={all} post={post} depth={0} />)}
        {all.length === 0 && <p className="text-sm text-slate-500 py-2">No comments yet. Start the conversation.</p>}
      </div>
    </div>
  )
}
