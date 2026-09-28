import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAq8WLT4gEvxcshYFvqGp138hb0kz1qm7Q",
  authDomain: "earnwithgrace-61615.firebaseapp.com",
  databaseURL: "https://earnwithgrace-61615-default-rtdb.firebaseio.com",
  projectId: "earnwithgrace-61615",
  storageBucket: "earnwithgrace-61615.firebasestorage.app",
  messagingSenderId: "653977405846",
  appId: "1:653977405846:web:26a6961a7336841700f5b7",
  measurementId: "G-0KCVHC9H25"
};

export default function App() {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'messages' | 'profile'
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'text' | 'image' | 'reel'
  const [notification, setNotification] = useState(null);

  const [myAlias, setMyAlias] = useState('');
  const [myMajor, setMyMajor] = useState('Computer Science');
  const [myYear, setMyYear] = useState('Sophomore');
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);

  const [newPostType, setNewPostType] = useState('text'); // 'text' | 'image' | 'reel'
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const [visibleCommentsPostId, setVisibleCommentsPostId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');

  useEffect(() => {
    if (!document.getElementById('fa-cdn')) {
      const link = document.createElement('link');
      link.id = 'fa-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);

      setAuth(authInstance);
      setDb(dbInstance);

      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(authInstance, __initial_auth_token);
          } else {
            await signInAnonymously(authInstance);
          }
        } catch (err) {
          console.error("Auth init error:", err);
          await signInAnonymously(authInstance);
        }
      };

      initAuth();

      const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
        setUser(currentUser);
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization error:", e);
      setIsAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    const appId = 'letstalk-student-app';

    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUsers(list);

      const me = list.find(u => u.uid === user.uid);
      if (me) {
        setMyAlias(me.alias);
        setMyMajor(me.major || 'Computer Science');
        setMyYear(me.year || 'Sophomore');
        setHasCompletedProfile(true);
      }
    }, (err) => console.error("Users error:", err));

    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubPosts = onSnapshot(postsRef, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPosts(list);
    }, (err) => console.error("Posts error:", err));

    const msgsRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const unsubMsgs = onSnapshot(msgsRef, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(list);
    }, (err) => console.error("Messages error:", err));

    return () => {
      unsubUsers();
      unsubPosts();
      unsubMsgs();
    };
  }, [db, user]);

  useEffect(() => {
    if (!db || !visibleCommentsPostId) return;
    const appId = 'letstalk-student-app';
    const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', `post_${visibleCommentsPostId}_comments`);
    
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setCommentsMap(prev => ({ ...prev, [visibleCommentsPostId]: list }));
    }, (err) => console.error("Comments error:", err));

    return () => unsubscribe();
  }, [db, visibleCommentsPostId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!myAlias.trim()) {
      showToast("Please enter a valid secret student alias!");
      return;
    }

    if (!user) {
      showToast("Authentication not ready. Please wait a moment.");
      return;
    }

    const studentCode = `#TALK-${Math.floor(1000 + Math.random() * 9000)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(myAlias)}_${studentCode}`;
    const appId = 'letstalk-student-app';

    const userProfile = {
      uid: user.uid,
      studentCode: studentCode,
      alias: myAlias.trim(),
      major: myMajor,
      year: myYear,
      avatarUrl: avatarUrl,
      createdAt: Date.now()
    };

    try {
      if (db) {
        const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
        await setDoc(userDocRef, userProfile);
      }
      setHasCompletedProfile(true);
      showToast(`Welcome to letsTalk! Your code is ${studentCode} 🚀`);
    } catch (err) {
      console.error("Profile save error:", err);
      showToast("Failed to save profile.");
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setHasCompletedProfile(false);
      showToast("Successfully logged out from letsTalk.");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setMediaPreviewUrl(objectUrl);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaPreviewUrl) {
      showToast("Please write something or attach media!");
      return;
    }

    const appId = 'letstalk-student-app';
    const myProfile = users.find(u => u.uid === user?.uid) || { 
      alias: myAlias || "AnonymousTalker", 
      studentCode: "#TALK-0000",
      major: myMajor,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=fallback`
    };

    const newPost = {
      authorUid: user.uid,
      authorAlias: myProfile.alias,
      authorStudentCode: myProfile.studentCode || "#TALK-9999",
      authorMajor: myProfile.major,
      authorAvatar: myProfile.avatarUrl,
      type: newPostType,
      content: newPostContent,
      mediaUrl: mediaPreviewUrl || (newPostType === 'image' ? "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80" : newPostType === 'reel' ? "https://assets.mixkit.co/videos/preview/mixkit-students-studying-in-a-library-43093-large.mp4" : ""),
      likes: [],
      createdAt: Date.now(),
      commentsCount: 0
    };

    try {
      if (db) {
        const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
        await addDoc(postsRef, newPost);
      }
      setNewPostContent("");
      setSelectedFile(null);
      setMediaPreviewUrl("");
      setNewPostType("text");
      showToast("Whisper published to letsTalk feed! ✨");
    } catch (err) {
      console.error("Post creation error:", err);
      showToast("Error publishing post.");
    }
  };

  const handleToggleLike = async (post) => {
    if (!user) return;
    const appId = 'letstalk-student-app';
    const hasLiked = post.likes && post.likes.includes(user.uid);
    const updatedLikes = hasLiked
      ? post.likes.filter(id => id !== user.uid)
      : [...(post.likes || []), user.uid];

    try {
      if (db) {
        const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
        await updateDoc(postRef, { likes: updatedLikes });
      }
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user) return;

    const appId = 'letstalk-student-app';
    const myProfile = users.find(u => u.uid === user.uid) || { alias: myAlias || "Talker", studentCode: "#TALK-0000", avatarUrl: "" };

    const commentData = {
      authorUid: user.uid,
      authorAlias: myProfile.alias,
      authorStudentCode: myProfile.studentCode,
      authorAvatar: myProfile.avatarUrl,
      text: newCommentText.trim(),
      createdAt: Date.now()
    };

    try {
      if (db) {
        const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', `post_${postId}_comments`);
        await addDoc(commentsRef, commentData);

        const targetPost = posts.find(p => p.id === postId);
        if (targetPost) {
          const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId);
          await updateDoc(postRef, { commentsCount: (targetPost.commentsCount || 0) + 1 });
        }
      }
      setNewCommentText("");
    } catch (err) {
      console.error("Comment add error:", err);
      showToast("Failed to add comment.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatUser || !user) return;

    const appId = 'letstalk-student-app';
    const msgData = {
      senderUid: user.uid,
      receiverUid: activeChatUser.uid,
      text: newMessageText.trim(),
      createdAt: Date.now()
    };

    try {
      if (db) {
        const msgsRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
        await addDoc(msgsRef, msgData);
      }
      setNewMessageText("");
    } catch (err) {
      console.error("Message send error:", err);
      showToast("Failed to send message.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30 animate-pulse">
            <i className="fa-solid fa-comments text-white text-xl"></i>
          </div>
          <p className="text-sm font-medium text-slate-400">Connecting to letsTalk secure network...</p>
        </div>
      </div>
    );
  }

  if (!hasCompletedProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        {notification && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-md">
            <i className="fa-solid fa-bell text-cyan-400"></i>
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <i className="fa-solid fa-comments text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                letsTalk <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">100% Anonymous</span>
              </h1>
              <p className="text-xs text-slate-400">Zero email disclosure • Cryptographic student codes</p>
            </div>
          </div>
        </header>

        <main className="w-full max-w-md mx-auto px-6 py-8 z-10 my-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30 text-white text-2xl">
                <i className="fa-solid fa-user-secret"></i>
              </div>
              <h2 className="text-2xl font-bold text-white">Join letsTalk</h2>
              <p className="text-xs text-slate-400">
                Your email remains entirely private. Choose your secret student alias, major, and unique avatar!
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Secret Student Alias</label>
                <div className="relative">
                  <i className="fa-solid fa-mask absolute left-3.5 top-3.5 text-slate-500"></i>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. NeonScholar"
                    value={myAlias}
                    onChange={(e) => setMyAlias(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Major</label>
                  <select 
                    value={myMajor}
                    onChange={(e) => setMyMajor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Computer Science</option>
                    <option>Engineering</option>
                    <option>Literature</option>
                    <option>Business</option>
                    <option>Architecture</option>
                    <option>Medicine</option>
                    <option>Fine Arts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Year</label>
                  <select 
                    value={myYear}
                    onChange={(e) => setMyYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                    <option>Graduate</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.98]"
              >
                <span>Enter letsTalk Feed</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
          </div>
        </main>

        <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-600 z-10">
          letsTalk &copy; 2026 • Secure Anonymous Student Platform
        </footer>
      </div>
    );
  }

  const myProfile = users.find(u => u.uid === user?.uid) || { alias: myAlias, studentCode: '#TALK-0000', major: myMajor, year: myYear, avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${myAlias}` };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 border border-slate-700 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-md">
          <i className="fa-solid fa-bell text-cyan-400"></i>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <i className="fa-solid fa-comments text-white"></i>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                letsTalk 
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {myProfile.studentCode}
                </span>
              </h1>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80">
            <button 
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === 'feed' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <i className="fa-solid fa-fire"></i>
              <span className="hidden sm:inline">Feed</span>
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === 'messages' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span className="hidden sm:inline">Messages</span>
              {messages.filter(m => m.receiverUid === user?.uid).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <i className="fa-solid fa-user-astronaut"></i>
              <span className="hidden sm:inline">Profile</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 z-10">
        
        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-2">
                  <img src={myProfile.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full bg-slate-950 border border-cyan-500/40" />
                  Posting as <strong className="text-white">{myProfile.alias} ({myProfile.studentCode})</strong>
                </span>
                
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => { setNewPostType('text'); setSelectedFile(null); setMediaPreviewUrl(''); }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${newPostType === 'text' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    <i className="fa-solid fa-align-left"></i> Text
                  </button>
                  <button 
                    onClick={() => { setNewPostType('image'); setSelectedFile(null); setMediaPreviewUrl(''); }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${newPostType === 'image' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    <i className="fa-solid fa-image"></i> Photo
                  </button>
                  <button 
                    onClick={() => { setNewPostType('reel'); setSelectedFile(null); setMediaPreviewUrl(''); }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${newPostType === 'reel' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    <i className="fa-solid fa-video"></i> Reel
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea 
                  rows="3"
                  placeholder={newPostType === 'text' ? "What's on your mind? Share anonymously..." : newPostType === 'image' ? "Caption your photo..." : "Caption your video reel..."}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                />

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept={newPostType === 'image' ? 'image/*' : 'video/*'}
                  className="hidden"
                  onChange={handleFileChange}
                />

                {newPostType !== 'text' && (
                  <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-2xl p-3">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors border border-slate-700"
                    >
                      <i className={`fa-solid ${newPostType === 'image' ? 'fa-upload' : 'fa-film'}`}></i>
                      <span>{selectedFile ? 'Change File' : `Select ${newPostType === 'image' ? 'Photo' : 'Video Reel'} from Device`}</span>
                    </button>
                    <span className="text-xs text-slate-400 truncate max-w-[240px]">
                      {selectedFile ? selectedFile.name : 'No file chosen'}
                    </span>
                  </div>
                )}

                {mediaPreviewUrl && newPostType === 'image' && (
                  <div className="relative w-full h-40 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                    <img src={mediaPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setSelectedFile(null); setMediaPreviewUrl(''); }}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full text-xs"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}

                {mediaPreviewUrl && newPostType === 'reel' && (
                  <div className="relative w-full h-40 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <video src={mediaPreviewUrl} controls className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setSelectedFile(null); setMediaPreviewUrl(''); }}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full text-xs z-10"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500"><i className="fa-solid fa-shield text-emerald-400"></i> No emails disclosed. Student ID active.</span>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <i className="fa-solid fa-paper-plane"></i> Publish
                  </button>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 tracking-wider uppercase">Live Student Feed</h2>
              <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button onClick={() => setFeedFilter('all')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${feedFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>All</button>
                <button onClick={() => setFeedFilter('text')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${feedFilter === 'text' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Text</button>
                <button onClick={() => setFeedFilter('image')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${feedFilter === 'image' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Photos</button>
                <button onClick={() => setFeedFilter('reel')} className={`px-3 py-1.5 rounded-lg font-medium transition-all ${feedFilter === 'reel' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Reels</button>
              </div>
            </div>

            <div className="space-y-4">
              {posts.length === 0 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                  <i className="fa-regular fa-comment-dots text-4xl mb-3 text-slate-700"></i>
                  <p className="text-sm">No posts yet. Be the first to start a conversation!</p>
                </div>
              )}

              {posts
                .filter(p => feedFilter === 'all' || p.type === feedFilter)
                .map(post => {
                  const hasLiked = post.likes && post.likes.includes(user?.uid);
                  const postComments = commentsMap[post.id] || [];
                  const areCommentsVisible = visibleCommentsPostId === post.id;

                  return (
                    <div key={post.id || post.createdAt} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={post.authorAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-2xl bg-slate-950 border border-cyan-500/40 p-1" 
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{post.authorAlias || "Anonymous Student"}</h3>
                              <span className="text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full border border-slate-700">
                                {post.authorStudentCode || "#TALK-0000"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{post.authorMajor || "Student"} • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>

                        {post.authorUid !== user?.uid && (
                          <button 
                            onClick={() => {
                              const targetUser = users.find(u => u.uid === post.authorUid) || { uid: post.authorUid, alias: post.authorAlias, studentCode: post.authorStudentCode, avatarUrl: post.authorAvatar };
                              setActiveChatUser(targetUser);
                              setActiveTab('messages');
                            }}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                          >
                            <i className="fa-solid fa-paper-plane"></i> Message
                          </button>
                        )}
                      </div>

                      {post.content && (
                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      )}

                      {post.type === 'image' && post.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950 flex items-center justify-center">
                          <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {post.type === 'reel' && post.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950 flex items-center justify-center">
                          <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <button 
                          onClick={() => handleToggleLike(post)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${hasLiked ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                        >
                          <i className={`${hasLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                          <span>{post.likes ? post.likes.length : 0} Likes</span>
                        </button>

                        <button 
                          onClick={() => setVisibleCommentsPostId(areCommentsVisible ? null : post.id)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                        >
                          <i className="fa-solid fa-comments"></i>
                          <span>{areCommentsVisible ? 'Hide Comments' : `Show Comments (${post.commentsCount || postComments.length})`}</span>
                        </button>
                      </div>

                      {areCommentsVisible && (
                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 bg-slate-950/50 p-3 rounded-2xl">
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {postComments.length === 0 && (
                              <p className="text-xs text-slate-500 text-center py-2">No comments yet. Start the discussion!</p>
                            )}
                            {postComments.map(comment => (
                              <div key={comment.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <img src={comment.authorAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} alt="Avatar" className="w-5 h-5 rounded-full bg-slate-950" />
                                    <span className="text-xs font-bold text-white">{comment.authorAlias}</span>
                                    <span className="text-[9px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded-full">{comment.authorStudentCode}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-slate-300 pl-7">{comment.text}</p>
                              </div>
                            ))}
                          </div>

                          <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex items-center space-x-2">
                            <input 
                              type="text"
                              placeholder="Write a reply anonymously..."
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                            />
                            <button 
                              type="submit"
                              className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                            >
                              Reply
                            </button>
                          </form>
                        </div>
                      )}

                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[650px] bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md">
            
            <div className="md:col-span-1 border-r border-slate-800/80 pr-4 flex flex-col space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Student Directory</h3>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-500 text-xs"></i>
                  <input 
                    type="text"
                    placeholder="Search by alias or code (#TALK)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 pl-9 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {users
                  .filter(u => u.uid !== user?.uid)
                  .filter(u => u.alias.toLowerCase().includes(searchQuery.toLowerCase()) || u.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(u => {
                    const isSelected = activeChatUser?.uid === u.uid;
                    return (
                      <div 
                        key={u.uid}
                        onClick={() => setActiveChatUser(u)}
                        className={`p-3 rounded-2xl cursor-pointer flex items-center space-x-3 transition-colors ${isSelected ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-950/60 hover:bg-slate-950 border border-slate-800/50'}`}
                      >
                        <img src={u.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} alt="Avatar" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1" />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-white truncate">{u.alias}</h4>
                          <span className="text-[10px] text-cyan-400 font-mono">{u.studentCode}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col justify-between">
              {activeChatUser ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                      <img src={activeChatUser.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} alt="Avatar" className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{activeChatUser.alias}</h4>
                        <span className="text-[10px] text-cyan-400 font-mono">{activeChatUser.studentCode} • {activeChatUser.major || "Student"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Secure Encrypted</span>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                    {messages
                      .filter(m => (m.senderUid === user?.uid && m.receiverUid === activeChatUser.uid) || (m.senderUid === activeChatUser.uid && m.receiverUid === user?.uid))
                      .length === 0 && (
                        <div className="text-center text-slate-500 my-auto py-20 text-xs">
                          <i className="fa-regular fa-paper-plane text-3xl mb-2 text-slate-700"></i>
                          <p>No messages yet with {activeChatUser.alias}. Say hello!</p>
                        </div>
                      )}

                    {messages
                      .filter(m => (m.senderUid === user?.uid && m.receiverUid === activeChatUser.uid) || (m.senderUid === activeChatUser.uid && m.receiverUid === user?.uid))
                      .map(m => {
                        const isMe = m.senderUid === user?.uid;
                        return (
                          <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs space-y-1 ${isMe ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow-lg shadow-cyan-500/20' : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'}`}>
                              <p className="whitespace-pre-wrap">{m.text}</p>
                              <span className={`block text-[9px] text-right ${isMe ? 'text-slate-900/70' : 'text-slate-500'}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                    <input 
                      type="text"
                      placeholder={`Message ${activeChatUser.alias}...`}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button 
                      type="submit"
                      className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2">
                  <i className="fa-solid fa-comments text-4xl text-slate-700"></i>
                  <p className="text-xs">Select a student from the directory to start chatting anonymously.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
            <div className="text-center space-y-3">
              <img src={myProfile.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-3xl bg-slate-950 border-2 border-cyan-500/50 mx-auto shadow-xl p-2" />
              <div>
                <h2 className="text-xl font-bold text-white">{myProfile.alias}</h2>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30 font-mono">
                  {myProfile.studentCode}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Major</span>
                <span className="text-white font-medium">{myProfile.major}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Academic Year</span>
                <span className="text-white font-medium">{myProfile.year}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Email Privacy</span>
                <span className="text-emerald-400 font-medium">100% Protected (Hidden)</span>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-2xl text-xs border border-rose-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-right-from-bracket"></i> Log Out
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-600 z-10">
        letsTalk &copy; 2026 • Secure Anonymous Student Platform
      </footer>
    </div>
  );
}
