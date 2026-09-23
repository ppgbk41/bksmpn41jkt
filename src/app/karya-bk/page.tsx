'use client';

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Smile,
  X,
  Send,
  Flag,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Award,
  Lightbulb,
  FileText,
  User,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userClass?: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  userId: string;
  studentId?: string;
  studentName: string;
  studentClass: string;
  userRole: string;
  avatarUrl?: string;
  imageUrl: string;
  caption: string;
  category: string;
  status: string;
  likesCount: number;
  commentsCount: number;
  reportsCount?: number;
  createdAt: string;
  userLiked?: boolean;
  comments?: Comment[];
}

const EMOJI_LIST = ['😊', '👍', '❤️', '🎉', '😍', '😄', '🤗', '💪', '🌟', '✨', '📚', '📝', '🎨', '🥰', '🙌'];

const CATEGORIES = ['Semua', 'LKPD', 'Karya', 'Refleksi', 'Aktivitas BK', 'Lainnya'];

export default function KaryaBkPage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Post Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('LKPD');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postSuccessToast, setPostSuccessToast] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  // Expanded comments state per post
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<{ [postId: string]: boolean }>({});

  // Bookmarks local state
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{ [postId: string]: boolean }>({});

  // Image Lightbox Preview
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Report Modal State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Delete Confirmation Modal State
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  useEffect(() => {
    fetchSessionAndPosts();
  }, [activeCategory]);

  const fetchSessionAndPosts = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      let url = `/api/karya-bk?category=${encodeURIComponent(activeCategory)}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const postsRes = await fetch(url);
      if (postsRes.ok) {
        const pData = await postsRes.json();
        setPosts(pData.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessionAndPosts();
  };

  // Image upload handling (drag & drop / file input)
  const handleImageFileSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPostError('Format file harus berupa JPG, JPEG, PNG, atau WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPostError('Ukuran file foto maksimal 5 MB.');
      return;
    }

    setPostError(null);
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileSelect(e.dataTransfer.files[0]);
    }
  };

  const insertEmoji = (emoji: string) => {
    if (captionRef.current) {
      const start = captionRef.current.selectionStart;
      const end = captionRef.current.selectionEnd;
      const text = caption;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setCaption(newText);
      setTimeout(() => {
        if (captionRef.current) {
          captionRef.current.selectionStart = start + emoji.length;
          captionRef.current.selectionEnd = start + emoji.length;
          captionRef.current.focus();
        }
      }, 50);
    } else {
      setCaption(prev => prev + emoji);
    }
  };

  // Submit Post
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageFile && !imagePreviewUrl) {
      setPostError('Silakan pilih foto hasil karya/LKPD terlebih dahulu.');
      return;
    }
    if (!caption.trim()) {
      setPostError('Ceritakan sedikit tentang karyamu di kolom caption.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);
      setPostError(null);

      let finalImageUrl = imagePreviewUrl || '';

      // Upload file if actual File selected
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('file', selectedImageFile);
        
        setUploadProgress(40);
        const uploadRes = await fetch('/api/karya-bk/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Gagal mengunggah foto');
        }
        finalImageUrl = uploadData.imageUrl;
      }

      setUploadProgress(70);

      // Submit Post Data
      const postRes = await fetch('/api/karya-bk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: finalImageUrl,
          caption: caption.trim(),
          category: selectedCategory
        })
      });

      const postData = await postRes.json();
      if (!postRes.ok) {
        throw new Error(postData.error || 'Gagal membuat postingan karya');
      }

      setUploadProgress(100);
      
      // Reset Modal Form
      setShowCreateModal(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setCaption('');
      setSelectedCategory('LKPD');
      setPostError(null);

      // Show Success Toast
      setPostSuccessToast('Karyamu berhasil dibagikan! 🎉');
      setTimeout(() => setPostSuccessToast(null), 4000);

      // Refresh Feed
      fetchSessionAndPosts();
    } catch (err: any) {
      setPostError(err.message || 'Terjadi kesalahan saat memposting karya.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Like Toggle Handler
  const handleToggleLike = async (postId: string) => {
    // Optimistic UI Update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const newLikedState = !p.userLiked;
          return {
            ...p,
            userLiked: newLikedState,
            likesCount: newLikedState ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/karya-bk/${postId}/like`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  // Bookmark Toggle
  const handleToggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Submit Comment Handler
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [postId]: true }));
      const res = await fetch(`/api/karya-bk/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      const data = await res.json();
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        // Append new comment optimistically
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              const currentComments = p.comments || [];
              return {
                ...p,
                commentsCount: p.commentsCount + 1,
                comments: [...currentComments, data.comment]
              };
            }
            return p;
          })
        );
      } else {
        alert(data.error || 'Gagal mengirim komentar');
      }
    } catch (e) {
      alert('Gagal mengirim komentar');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Report Post Submit
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !reportReason.trim()) return;

    try {
      setSubmittingReport(true);
      const res = await fetch(`/api/karya-bk/${reportingPostId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Laporan berhasil dikirim');
        setReportingPostId(null);
        setReportReason('');
      } else {
        alert(data.error || 'Gagal mengirim laporan');
      }
    } catch (e) {
      alert('Gagal mengirim laporan');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Delete Post Submit
  const handleDeleteSubmit = async () => {
    if (!deletingPostId) return;
    try {
      setSubmittingDelete(true);
      const res = await fetch(`/api/karya-bk/${deletingPostId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== deletingPostId));
        setDeletingPostId(null);
        setPostSuccessToast('Postingan berhasil dihapus.');
        setTimeout(() => setPostSuccessToast(null), 3000);
      } else {
        alert(data.error || 'Gagal menghapus postingan');
      }
    } catch (e) {
      alert('Gagal menghapus postingan');
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Moderation Toggle (Hide/Publish)
  const handleToggleHidePost = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hidden' ? 'published' : 'hidden';
    try {
      const res = await fetch(`/api/karya-bk/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Format Time Relative
  const getRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays === 1) return 'Kemarin';
      return `${diffDays} hari yang lalu`;
    } catch (e) {
      return dateStr;
    }
  };

  // Category Badge Colors
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'LKPD':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Karya':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Refleksi':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Aktivitas BK':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Floating Success Toast */}
        {postSuccessToast && (
          <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-xs font-bold">{postSuccessToast}</span>
          </div>
        )}

        {/* 1. Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Galeri Positif & Kreatif BK
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Karya BK Siswa</h1>
            <p className="text-xs text-purple-100 mt-1 max-w-md">
              Bagikan hasil karya dan pengalaman belajarmu bersama BK! Lingkungan yang aman, saling menyemangati, dan inspiratif.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="relative z-10 px-5 py-3 bg-white hover:bg-slate-100 text-purple-700 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-all shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Bagikan Karyamu</span>
          </button>
        </div>

        {/* 2. Area Buat Postingan ("Create Post" Card) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border-2 border-white dark:border-slate-800 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0) || 'S'}</span>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-left px-4 py-3 rounded-2xl text-xs text-slate-500 dark:text-slate-400 font-medium transition-all flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60"
            >
              <span>Bagikan lembar kerja (LKPD) atau karya BK-mu hari ini...</span>
              <ImageIcon className="w-4 h-4 text-purple-500" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 px-1 text-xs">
            <button
              onClick={() => {
                setSelectedCategory('LKPD');
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 px-3 py-1.5 rounded-xl transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Upload LKPD</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Karya');
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Foto Karya</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory('Refleksi');
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Refleksi BK</span>
            </button>
          </div>
        </div>

        {/* 3. Filter Timeline & Search Bar */}
        <div className="space-y-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama siswa, kelas, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                {cat === 'Semua' && <Sparkles className="w-3.5 h-3.5" />}
                {cat === 'LKPD' && <FileText className="w-3.5 h-3.5" />}
                {cat === 'Karya' && <ImageIcon className="w-3.5 h-3.5" />}
                {cat === 'Refleksi' && <Lightbulb className="w-3.5 h-3.5" />}
                {cat === 'Aktivitas BK' && <Award className="w-3.5 h-3.5" />}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Timeline Feed Posts */}
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="w-3/4 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* 10. Empty State */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Belum ada karya yang dibagikan.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Yuk, bagikan hasil karya atau lembar kerja BK-mu agar bisa menginspirasi teman-teman lainnya!
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Bagikan Karya</span>
            </button>
          </div>
        ) : (
          /* Instagram-Style Post Feed Cards */
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                  post.status === 'hidden'
                    ? 'border-red-300 dark:border-red-900/60 opacity-60'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Hidden Status Warning Banner for Admin/BK */}
                {post.status === 'hidden' && (
                  <div className="bg-red-50 dark:bg-red-950/60 px-4 py-1.5 border-b border-red-200 dark:border-red-900 text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" />
                      Postingan ini sedang disembunyikan oleh Moderasi Guru BK
                    </span>
                    {user && ['ADMIN', 'GURU_BK'].includes(user.role) && (
                      <button
                        onClick={() => handleToggleHidePost(post.id, post.status)}
                        className="underline hover:text-red-800"
                      >
                        Tampilkan kembali
                      </button>
                    )}
                  </div>
                )}

                {/* Card Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border border-white dark:border-slate-800 overflow-hidden">
                      {post.avatarUrl ? (
                        <img src={post.avatarUrl} alt={post.studentName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{post.studentName.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:underline cursor-pointer">
                          {post.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                          {post.studentClass}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {getRelativeTime(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Category Tag */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(post.category)}`}>
                      {post.category}
                    </span>

                    {/* Guru BK / Owner Controls */}
                    {user && (
                      <div className="flex items-center gap-1">
                        {['ADMIN', 'GURU_BK'].includes(user.role) && (
                          <button
                            onClick={() => handleToggleHidePost(post.id, post.status)}
                            title={post.status === 'hidden' ? 'Publikasikan' : 'Sembunyikan'}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            {post.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        )}

                        {(post.userId === user.id || ['ADMIN', 'GURU_BK'].includes(user.role)) && (
                          <button
                            onClick={() => setDeletingPostId(post.id)}
                            title="Hapus Postingan"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Media (Image) */}
                <div
                  onClick={() => setLightboxImage(post.imageUrl)}
                  className="w-full bg-slate-950 relative group cursor-pointer overflow-hidden max-h-[500px] flex items-center justify-center"
                >
                  <img
                    src={post.imageUrl}
                    alt="Karya BK Siswa"
                    className="w-full object-cover max-h-[500px] group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Klik untuk memperbesar
                    </span>
                  </div>
                </div>

                {/* Card Content & Action Bar */}
                <div className="p-4 space-y-3">
                  {/* Caption Text */}
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    <span className="font-bold mr-2 text-slate-900 dark:text-slate-100">{post.studentName}</span>
                    <span>{post.caption}</span>
                  </div>

                  {/* Action Buttons Row (Di Bawah Postingan / Caption) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-4">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className="flex items-center gap-1.5 text-xs font-bold transition-all group"
                      >
                        <Heart
                          className={`w-5 h-5 transition-transform group-active:scale-125 ${
                            post.userLiked
                              ? 'fill-red-500 text-red-500'
                              : 'text-slate-500 dark:text-slate-400 group-hover:text-red-500'
                          }`}
                        />
                        <span className={post.userLiked ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}>
                          {post.likesCount} suka
                        </span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        onClick={() =>
                          setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.commentsCount} komentar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Save/Bookmark Button */}
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className="text-slate-500 dark:text-slate-400 hover:text-purple-600 transition-colors"
                        title="Simpan Karya"
                      >
                        <Bookmark
                          className={`w-5 h-5 ${
                            bookmarkedPosts[post.id] ? 'fill-purple-600 text-purple-600' : ''
                          }`}
                        />
                      </button>

                      {/* Laporkan Content Button */}
                      <button
                        onClick={() => setReportingPostId(post.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Laporkan konten tidak sesuai"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comments Expansion Drawer */}
                  {expandedComments[post.id] && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Komentar Siswa & Guru BK
                      </h4>

                      {/* Existing Comments List */}
                      {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-0.5 border border-slate-100 dark:border-slate-800"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-slate-100">
                                    {comment.userName}
                                  </span>
                                  {comment.userClass && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                                      {comment.userClass}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400">
                                  {getRelativeTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                                {comment.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Belum ada komentar. Jadilah yang pertama memberikan kata-kata positif! 😊
                        </p>
                      )}

                      {/* Comment Input Box */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Tulis komentar positif..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={submittingComment[post.id] || !commentInputs[post.id]?.trim()}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0"
                        >
                          {submittingComment[post.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 5. Modal Form Buat Postingan Baru */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-purple-200 dark:border-purple-800 shadow-2xl space-y-4 my-8 relative">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Bagikan Karya BK / LKPD
                    </h3>
                    <p className="text-[10px] text-slate-400">Postingan aman untuk lingkungan sekolah</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setPostError(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs">
                {postError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-2xl text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{postError}</span>
                  </div>
                )}

                {/* 1. Upload Foto Area */}
                <div>
                  <label className="font-bold block mb-1 text-slate-900 dark:text-slate-100">
                    Upload Foto Karya / LKPD *
                  </label>
                  {!imagePreviewUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors"
                      onClick={() => document.getElementById('karya-file-input')?.click()}
                    >
                      <Upload className="w-8 h-8 text-purple-500 mx-auto" />
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Tarik & lepas foto di sini, atau klik untuk memilih
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Format: JPG, JPEG, PNG, WEBP (Maksimal 5 MB)
                      </p>
                      <input
                        id="karya-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFileSelect(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56 bg-slate-950 flex items-center justify-center">
                      <img src={imagePreviewUrl} alt="Preview" className="max-h-56 object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageFile(null);
                          setImagePreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Kategori Postingan */}
                <div>
                  <label className="font-bold block mb-1 text-slate-900 dark:text-slate-100">
                    Kategori Karya *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="LKPD">📄 LKPD BK (Lembar Kerja Peserta Didik)</option>
                    <option value="Karya">🎨 Karya / Gambar / Poster BK</option>
                    <option value="Refleksi">💡 Refleksi Diri BK</option>
                    <option value="Aktivitas BK">🌟 Aktivitas / Mind Map BK</option>
                    <option value="Lainnya">📌 Lainnya</option>
                  </select>
                </div>

                {/* 3. Caption Textarea & Emoji Toolbar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-900 dark:text-slate-100">
                      Caption / Deskripsi Karya *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-purple-600 dark:text-purple-400 font-bold text-[11px] flex items-center gap-1 hover:underline"
                    >
                      <Smile className="w-3.5 h-3.5" />
                      {showEmojiPicker ? 'Tutup Emoji' : '+ Tambah Emoji'}
                    </button>
                  </div>

                  <textarea
                    ref={captionRef}
                    rows={3}
                    required
                    placeholder="Ceritakan sedikit tentang karyamu..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-purple-500/30"
                  />

                  {/* Quick Emoji Toolbar Panel */}
                  {showEmojiPicker && (
                    <div className="mt-2 p-2.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl flex flex-wrap gap-1.5 animate-fadeIn">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="w-8 h-8 text-base rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center justify-center transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upload Progress Bar if active */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-purple-600 font-bold">
                      <span>Mengunggah postingan karya...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-600/40 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Posting Karya
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 6. Image Lightbox Modal */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 text-white bg-white/20 rounded-full hover:bg-white/40"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Detail Karya"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}

        {/* 7. Modal Laporkan Postingan */}
        {reportingPostId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Laporkan Konten Postingan
                </h3>
                <button onClick={() => setReportingPostId(null)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400">
                  Bantu kami menjaga galeri sekolah ini tetap positif dan aman. Mengapa Anda melaporkan postingan ini?
                </p>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan alasan laporan (misal: mengandung perundungan, data pribadi, atau konten tidak pantas)..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl dark:border-slate-700"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
                  >
                    {submittingReport ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 8. Modal Hapus Postingan */}
        {deletingPostId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Hapus Postingan Karya?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Tindakan ini tidak dapat dibatalkan. Postingan akan dihapus dari timeline.
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPostId(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400 font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={submittingDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30"
                >
                  {submittingDelete ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
