// ==========================================
// KẾT NỐI FIREBASE 
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, deleteDoc, getDoc, collection, query, orderBy, getDocs, serverTimestamp, onSnapshot, addDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMqWIl6o9wFuPNWAUV_LDVgqpfToXsCQs",
  authDomain: "moviechill-aef7b.firebaseapp.com",
  projectId: "moviechill-aef7b",
  storageBucket: "moviechill-aef7b.firebasestorage.app",
  messagingSenderId: "310759265527",
  appId: "1:310759265527:web:5ed6808773d5035f5caff2",
  measurementId: "G-GS9SX2BVPF"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
window.auth = auth;
window.db = db;
const googleProvider = new GoogleAuthProvider();
// const facebookProvider = new FacebookAuthProvider(); // Tạm khóa Facebook
  // --- 1. DỮ LIỆU PHIM HERO (Dùng cho slider) ---
  let heroMoviesData = [];
  let currentHeroSlug = '';

  const header = document.querySelector('header');
  const heroTitle = document.querySelector('.movie-title');
  const heroSub = document.querySelector('.movie-sub');
  const heroDesc = document.querySelector('.movie-desc');
  const heroTags = document.querySelectorAll('.movie-info .badge');
  const heroTypes = document.querySelector('.movie-type');
  const thumbsContainer = document.getElementById('hero-thumbnails-container');

  if(heroTitle) heroTitle.style.transition = 'opacity 0.3s ease';
  if(heroDesc) heroDesc.style.transition = 'opacity 0.3s ease';

  // --- 1.1 API & STATE MANAGEMENT (MODULARIZATION) ---
  const ApiService = {
    async get(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error(`[ApiService] Failed to fetch data from ${url}:`, error);
        throw error;
      }
    }
  };

  const AppState = {
    heroMoviesData: [],
    currentHeroSlug: '',
    
    setHeroMovies(data) {
      this.heroMoviesData = data;
    },
    setCurrentHeroSlug(slug) {
      this.currentHeroSlug = slug;
    }
  };

  // --- 1.2 DỮ LIỆU PHIM HERO (Dùng cho slider) ---
  // Hàm xử lý dữ liệu API thô thành dạng chuẩn cho Hero Banner
  function formatHeroMovieData(movieInfo, top5Movie, index, domainImg) {
    let cleanDesc = movieInfo.content || movieInfo.origin_name || '';
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanDesc;
    cleanDesc = tempDiv.textContent || tempDiv.innerText || "";
    if (cleanDesc.length > 200) cleanDesc = cleanDesc.substring(0, 200) + '...';

    return {
      img: domainImg + (movieInfo.poster_url || movieInfo.thumb_url || top5Movie.poster_url),
      thumb: domainImg + (movieInfo.thumb_url || top5Movie.thumb_url),
      title: movieInfo.name,
      sub: movieInfo.origin_name || 'MovieChill',
      rating: 'Mới',
      years: movieInfo.year || '2026',
      quality: movieInfo.quality || 'HD',
      episode: movieInfo.episode_current || 'Full',
      types: movieInfo.category ? movieInfo.category.slice(0, 3).map(c => c.name || c.title) : ['Hot'],
      desc: cleanDesc,
      slug: movieInfo.slug
    };
  }

  // Hàm render giao diện Thumbnail
  function renderHeroThumbnails(movies) {
    if (!thumbsContainer) return;
    thumbsContainer.innerHTML = '';
    movies.forEach((movie, index) => {
      const div = document.createElement('div');
      div.className = 'thumb-item' + (index === 0 ? ' active' : '');
      div.innerHTML = `<img src="${movie.thumb}" alt="${movie.title}">`;
      div.addEventListener('click', () => window.handleThumbClick(index));
      thumbsContainer.appendChild(div);
    });
  }

  // Hàm click đổi phim trên Hero Banner
  window.handleThumbClick = function(index) {
    if (!thumbsContainer) return;
    document.querySelector('.thumb-item.active')?.classList.remove('active');
    const allThumbs = thumbsContainer.querySelectorAll('.thumb-item');
    if (allThumbs[index]) allThumbs[index].classList.add('active');

    const data = AppState.heroMoviesData[index];
    if (!data) return;
    
    AppState.setCurrentHeroSlug(data.slug);
    
    if(window.innerWidth > 768) {
       header.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.9) 10%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0) 100%), url('${data.img}')`;
    } else {
       header.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0.6) 60%, var(--bg-dark, #141414) 85%, var(--bg-dark, #141414) 100%), url('${data.img}')`;
    }

    if(heroTitle) heroTitle.style.opacity = 0;
    if(heroDesc) heroDesc.style.opacity = 0;
    
    setTimeout(() => {
      if(heroTitle) heroTitle.textContent = data.title;
      if(heroSub) heroSub.textContent = data.sub;
      if(heroDesc) heroDesc.textContent = data.desc;
      
      if(heroTags && heroTags.length >= 4) {
        heroTags[0].textContent = data.rating;
        heroTags[1].textContent = data.years;
        heroTags[2].textContent = data.quality;
        heroTags[3].textContent = data.episode;
      }

      if(heroTypes) {
        heroTypes.innerHTML = data.types.map(t => `<span class="type">${t}</span>`).join('\n              ');
      }

      if(heroTitle) heroTitle.style.opacity = 1;
      if(heroDesc) heroDesc.style.opacity = 1;
    }, 300);
  }

  // Controller chính lấy dữ liệu 5 phim mới
  async function fetchHeroMovies() {
    try {
      const data = await ApiService.get('https://ophim1.com/v1/api/quoc-gia/han-quoc?page=1');
      const top5 = data.data.items.slice(0, 5);
      const domainImg = data.data.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/';

      // Fetch song song chi tiết 5 phim
      const detailPromises = top5.map(m => ApiService.get('https://ophim1.com/v1/api/phim/' + m.slug));
      const details = await Promise.all(detailPromises);

      const formattedData = details.map((detailRes, index) => {
         const movieInfo = detailRes.data ? (detailRes.data.item || detailRes.data.movie) : top5[index];
         return formatHeroMovieData(movieInfo, top5[index], index, domainImg);
      });

      AppState.setHeroMovies(formattedData);
      renderHeroThumbnails(formattedData);

      // Kích hoạt banner đầu tiên
      if (formattedData.length > 0) {
        window.handleThumbClick(0);
      }
    } catch (error) {
      console.error("[HeroBanner] Lỗi khi load banner:", error);
    }
  }

  fetchHeroMovies();

  // Gắn sự kiện Click cho nút Play ở Hero Banner
  const heroPlayBtn = document.querySelector('.play-btn');
  if(heroPlayBtn) {
    heroPlayBtn.style.cursor = 'pointer';
    heroPlayBtn.addEventListener('click', () => {
      if(window.playMovie && currentHeroSlug) {
        window.playMovie(currentHeroSlug);
      }
    });
  }

  // --- 2. XỬ LÝ NÚT TIM (LIKE) ---
  const likeBtns = document.querySelectorAll('.btn-icon');
  likeBtns.forEach(btn => {
    // Lọc ra các nút Like (nút có icon tim)
    if(btn.innerHTML.includes('fa-heart')) {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); // Ngăn chặn nhảy trang
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-regular')) {
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid');
          icon.style.color = '#ff4757'; // Chuyển sang đỏ
          this.style.boxShadow = '0 0 5px rgba(255, 71, 87, 0.5)';
        } else {
          icon.classList.add('fa-regular');
          icon.classList.remove('fa-solid');
          icon.style.color = 'inherit'; // Trả về màu gốc
          this.style.boxShadow = '1px 1px 1px 1px rgba(190, 190, 190, 0.678)';
        }
      });
    }
  });

  // --- 3. XỬ LÝ NÚT PLAY / XEM NGAY ---
  const playBtns = document.querySelectorAll('.btn-play, .play-btn');
  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      alert("Đang tải trình phát video... Chúc bạn xem phim vui vẻ tại NTB MovieChill!");
    });
  });

  // --- 4. KÉO THẢ CHUỘT (DRAG TO SCROLL) CHO DANH SÁCH PHIM TỚI LUI ---
  const sliders = document.querySelectorAll('.movie-list');
  let isDown = false;
  let startX;
  let scrollLeft;

  sliders.forEach(slider => {
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Tốc độ cuộn (nhân 2 để cuộn lướt nhanh hơn)
      slider.scrollLeft = scrollLeft - walk;
    });
  });

  // --- 5. MENU MOBILE VÀ TÌM KIẾM ---
  const hamburger = document.getElementById('hamburger');
  const navLink = document.querySelector('.nav-link');
  const parentMenuItems = document.querySelectorAll('.nav-link > li');

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navLink.classList.toggle('active');
    hamburger.classList.toggle('toggle');
  });

  parentMenuItems.forEach(li => {
    li.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-action');
      if (navItem) {
          // Ngăn không cho nổi bọt lên li cha nếu click trực tiếp vào sub-menu item,
          // vì ta sẽ xử lý click ở bên dưới.
          // Hoặc có thể xử lý luôn tại đây:
          e.preventDefault();
          const apiUrl = navItem.getAttribute('data-api');
          const title = navItem.getAttribute('data-title');
          
          if(apiUrl) {
            loadSearchData(apiUrl, title);
          }
      }

      const subMenu = li.querySelector('.menu1');
      if (subMenu) {
        e.stopPropagation();
        subMenu.classList.toggle('show-submenu');
      } else {
        navLink.classList.remove('active');
        hamburger.classList.remove('toggle');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!navLink.contains(e.target) && !hamburger.contains(e.target)) {
      navLink.classList.remove('active');
      hamburger.classList.remove('toggle');
      document.querySelectorAll('.menu1').forEach(m => m.classList.remove('show-submenu'));
    }
  });

  // --- 6. TÍCH HỢP API OPHIM ---
  const API_CONFIG = {
    OPHIM: {
      BASE_URL: 'https://ophim1.com/v1/api',
      DETAIL_URL: 'https://ophim1.com/v1/api/phim/'
    },
    KKPHIM: {
      BASE_URL: 'https://phimapi.com',
      DETAIL_URL: 'https://phimapi.com/phim/'
    }
  };

  const API_HOME = API_CONFIG.OPHIM.BASE_URL + '/home';
  const API_SEARCH = API_CONFIG.OPHIM.BASE_URL + '/tim-kiem?keyword=';
  // [Adapter Pattern] Chuẩn hóa dữ liệu từ nhiều nguồn API
  function normalizeMovieData(source, rawData) {
    let movieData = {};
    let episodes = [];
    
    if (source === 'OPHIM') {
      const data = rawData.data || rawData;
      movieData = data.item || data.movie || {};
      episodes = data.item?.episodes || data.movie?.episodes || data.episodes || [];
    } else if (source === 'KKPHIM') {
      movieData = rawData.movie || rawData.item || {};
      episodes = rawData.episodes || movieData.episodes || [];
    }
    
    movieData.name = movieData.name || movieData.title;
    return { movie: movieData, episodes: episodes };
  }

  // DOM Elements
  const list1 = document.getElementById('api-movie-list-1');
  const list2 = document.getElementById('api-movie-list-2');
  const searchResultsSection = document.getElementById('search-results-section');
  const searchMovieList = document.getElementById('search-movie-list');
  const mainHomeContent = document.getElementById('main-home-content');
  const searchKeywordSpan = document.getElementById('search-keyword');

  const videoModal = document.getElementById('video-modal');
  const videoIframe = document.getElementById('video-iframe');
  const videoTitle = document.getElementById('video-title');
  const videoCloseBtn = document.querySelector('.video-close-btn');
  const episodeList = document.getElementById('episode-list');

  // Đóng Modal Video
  window.closeVideoModal = function() {
    if (videoModal && videoModal.classList.contains('show')) {
      videoModal.classList.remove('show');
      if (videoIframe) {
        videoIframe.src = ''; 
        const parent = videoIframe.parentNode;
        if (parent) {
          parent.removeChild(videoIframe);
          parent.insertBefore(videoIframe, parent.firstChild);
        }
      }
      const movieInfoPanel = document.getElementById('movie-info-panel');
      if (movieInfoPanel) movieInfoPanel.classList.remove('active'); // Luôn đóng bảng thông tin khi đóng phim
      if (history.state && history.state.view === 'movie') {
        history.back(); // Quay lại trang trước đó (thường là home)
      }
    }
  }

  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', window.closeVideoModal);
  }

  // Logic cho Information Movie Panel
  const btnMovieInfo = document.getElementById('btn-movie-info');
  const movieInfoPanel = document.getElementById('movie-info-panel');
  const closeInfoBtn = document.getElementById('close-info-btn');

  window.renderMovieInfo = function() {
    if (window.currentPlayingMovie) {
        const m = window.currentPlayingMovie;
        
        // Poster
        const posterEl = document.getElementById('info-poster');
        if (posterEl) {
          const imgUrl = m.poster_url ? (m.poster_url.startsWith('http') ? m.poster_url : 'https://img.ophim.live/uploads/movies/' + m.poster_url) : (m.thumb_url ? 'https://img.ophim.live/uploads/movies/' + m.thumb_url : '');
          posterEl.src = imgUrl;
        }

        // Texts
        const titleVn = document.getElementById('info-title-vn');
        if (titleVn) titleVn.textContent = m.name || 'Đang cập nhật...';

        const titleEn = document.getElementById('info-title-en');
        if (titleEn) titleEn.textContent = `${m.origin_name || ''} (${m.year || '2026'})`;

        const qlt = document.getElementById('info-quality');
        if (qlt) qlt.textContent = m.quality || m.episode_current || 'FHD';

        const tim = document.getElementById('info-time');
        if (tim) tim.textContent = m.time || 'N/A';

        const ctry = document.getElementById('info-country');
        if (ctry) {
           ctry.textContent = (m.country && m.country.length > 0) ? m.country[0].name : 'Quốc tế';
        }

        const dir = document.getElementById('info-director');
        if (dir) {
           dir.textContent = (m.director && m.director.length > 0) ? m.director.join(', ') : 'Đang cập nhật...';
        }

        const act = document.getElementById('info-actors');
        if (act) {
           act.textContent = (m.actor && m.actor.length > 0) ? m.actor.join(', ') : 'Đang cập nhật...';
           act.className = '';
        }

        const contentEl = document.getElementById('info-content');
        if (contentEl) {
           // Loại bỏ các thẻ HTML nguy hiểm hoặc không cần thiết từ content
           let cleanContent = m.content ? m.content.replace(/<[^>]*>?/gm, '') : 'Nội dung phim đang được cập nhật...';
           contentEl.textContent = cleanContent;
        }
    }
  };

  if (btnMovieInfo && movieInfoPanel) {
    btnMovieInfo.addEventListener('click', () => {
      // Bật/tắt panel
      movieInfoPanel.classList.toggle('active');
      
      // Nếu bật, hãy render dữ liệu
      if (movieInfoPanel.classList.contains('active')) {
        window.renderMovieInfo();
      }
    });
  }

  if (closeInfoBtn && movieInfoPanel) {
    closeInfoBtn.addEventListener('click', () => {
      movieInfoPanel.classList.remove('active');
    });
  }

  // Đóng modal khi click ra ngoài
  window.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      window.closeVideoModal();
    }
  });

  // Fetch Trang Chủ
  async function fetchHomeMovies() {
    try {
      const data = await ApiService.get(API_HOME);
      const responseData = data.data || data; // Hỗ trợ nhiều cấu trúc trả về
      const domainImage = responseData.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/';
      
      const movies = responseData.items || [];
      const list1Movies = movies.slice(0, 10);
      const list2Movies = movies.slice(10, 20);

      renderMovies(list1Movies, list1, domainImage);
      renderMovies(list2Movies, list2, domainImage);

      // Render Ranking Board Sôi Nổi Nhất
      const rankTrending = document.getElementById('rank-trending');
      if(rankTrending) renderRankingList(movies.slice(0, 5), rankTrending, domainImage, 'trending');

      // Fetch Yêu Thích Nhất (Chiếu Rạp) & Hoạt Hình Hot
      try {
        const [favData, animeData] = await Promise.all([
          ApiService.get('https://ophim1.com/v1/api/danh-sach/phim-chieu-rap'),
          ApiService.get('https://ophim1.com/v1/api/danh-sach/hoat-hinh')
        ]);
        
        const favResponseData = favData.data || favData;
        const favDomainImage = favResponseData.APP_DOMAIN_CDN_IMAGE ? favResponseData.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/' : 'https://img.ophim.live/uploads/movies/';
        const favMovies = favResponseData.items || [];
        const rankFavorite = document.getElementById('rank-favorite');
        if(rankFavorite) renderRankingList(favMovies.slice(0, 5), rankFavorite, favDomainImage, 'favorite');

        const animeResponseData = animeData.data || animeData;
        const animeDomainImage = animeResponseData.APP_DOMAIN_CDN_IMAGE ? animeResponseData.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/' : 'https://img.ophim.live/uploads/movies/';
        const animeMovies = animeResponseData.items || [];
        const rankAnime = document.getElementById('rank-anime');
        if(rankAnime) renderRankingList(animeMovies.slice(0, 5), rankAnime, animeDomainImage, 'anime');

      } catch (rankingError) {
        console.error('Lỗi khi tải phim Ranking Board:', rankingError);
      }

    } catch (error) {
      console.error('Lỗi khi tải phim trang chủ:', error);
      const errorHtml = `
        <div style="text-align: center; padding: 40px 20px; width: 100%;">
          <i class="fa-solid fa-server" style="font-size: 40px; color: #ef4444; margin-bottom: 15px;"></i>
          <h3 style="color: #fff; margin-bottom: 10px; font-family: 'Inter', sans-serif;">Máy chủ đang bận đi cà phê!</h3>
          <p style="color: #ccc; font-size: 15px; font-family: 'Inter', sans-serif;">Hệ thống cung cấp phim đang được bảo trì hoặc quá tải. Vui lòng quay lại sau ít phút nhé.</p>
        </div>
      `;
      if(list1) list1.innerHTML = errorHtml;
      if(list2) list2.innerHTML = errorHtml;
    }
  }

  // Render Bảng xếp hạng
  function renderRankingList(movies, container, domainImage, type) {
    if (!container) return;
    container.innerHTML = '';
    movies.forEach((movie, index) => {
      let iconHtml = '';
      if (type === 'trending') {
        iconHtml = '<span class="rank-icon"><i class="fa-solid fa-arrow-trend-up" style="color: #839b25;"></i></span>';
      } else if (type === 'favorite') {
        iconHtml = '<span class="rank-icon"><span class="rank-dash">-</span></span>';
      } else if (type === 'anime') {
        iconHtml = '<span class="rank-icon"><i class="fa-solid fa-bolt" style="color: #efb003;"></i></span>';
      }

      const imgUrl = domainImage + movie.thumb_url;
      const li = document.createElement('li');
      li.style.cursor = 'pointer';
      li.onclick = () => playMovie(movie.slug);
      li.innerHTML = `
        <span class="rank-num">${index + 1}.</span>
        ${iconHtml}
        <img src="${imgUrl}" alt="${movie.name}" class="rank-thumb">
        <div class="rank-info">
          <h4 class="rank-title" title="${movie.name}">${movie.name}</h4>
          <span class="rank-year">(${movie.year || '2026'})</span>
        </div>
      `;
      container.appendChild(li);
    });
  }

  // Render HTML cho danh sách phim
  function renderMovies(movies, container, domainImage) {
    if (!container) return;
    container.innerHTML = '';
    window.currentMovies = window.currentMovies || {};
    movies.forEach(movie => {
      window.currentMovies[movie.slug] = movie;
      const imgUrl = domainImage + movie.thumb_url;
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="card-wrapper">
          <div class="item-info">
            <img class="bg-blur" src="${imgUrl}" alt="">
            <img class="main-img" src="${imgUrl}" alt="${movie.name}">
            <span class="episode">${movie.episode_current || 'Full'}</span>
          </div>
          <div class="card-info">
            <h3 class="title-vn">${movie.name}</h3>
            <p class="title-en">${movie.origin_name || ''}</p>
            <div class="hover">
              <div class="action-buttons">
                <button class="btn btn-play" onclick="playMovie('${movie.slug}')"><i class="fa-solid fa-play"></i>Xem Ngay</button>
                <button class="btn btn-icon like-btn" data-slug="${movie.slug}"><i class="fa-regular fa-heart"></i>Like</button>
                <button class="btn btn-icon two" onclick="playMovie('${movie.slug}', true)"><i class="fa-solid fa-circle-info"></i>Chi Tiết</button>
              </div>
              <div class="data-card">
                <span class="tag solid">${movie.country && movie.country[0] ? movie.country[0].name : 'Thế Giới'}</span>
                <span class="tag outline">${movie.year || '2026'}</span>
                <span class="tag solid-brown">${movie.quality || 'HD'}</span>
              </div>
              <div class="Manufacturer">
                <span style="color: #b3b3b3; font-size: 12px; font-weight: bold; letter-spacing: 2px;">NTB<span style="color: #efb003;"> MOVIECHILL</span></span>
              </div>
            </div>
          </div>
        </div>
      `;
      // Gắn sự kiện click vào ảnh
      const imgElement = card.querySelector('.item-info img');
      if(imgElement) {
        imgElement.style.cursor = 'pointer';
        imgElement.addEventListener('click', () => playMovie(movie.slug));
      }
      
      container.appendChild(card);
    });
    updateLikeButtons(container);
  }

  // Xem phim (Phát Video)
  window.playMovie = async function(slug, autoOpenInfo = false, pushHistory = true) {
    if (pushHistory) {
      history.pushState({ view: 'movie', slug: slug }, '', '#watch-' + slug);
    }
    if(videoTitle) videoTitle.textContent = "Đang tải...";
    if(episodeList) episodeList.innerHTML = ""; // Xóa danh sách tập cũ
    if(videoModal) {
      videoModal.classList.add('show');
      if(window.initComments) window.initComments(slug);
    }
    // Ẩn search dropdown nếu đang mở
    hideSuggestions();

    try {
      // Gọi cả 2 API cùng lúc để tiết kiệm thời gian
      const pOphim = ApiService.get(API_CONFIG.OPHIM.DETAIL_URL + slug).catch(e => ({ error: true }));
      const pKkphim = ApiService.get(API_CONFIG.KKPHIM.DETAIL_URL + slug).catch(e => ({ error: true }));

      const [resOphim, resKkphim] = await Promise.all([pOphim, pKkphim]);

      let finalMovie = null;
      let allEpisodes = [];

      // 1. Xử lý Server 1: OPhim
      if (!resOphim.error && resOphim.status && (resOphim.status === true || resOphim.status === 'success')) {
        const ophimData = normalizeMovieData('OPHIM', resOphim);
        finalMovie = ophimData.movie;
        ophimData.episodes.forEach(ep => {
          // Gắn nhãn để phân biệt
          ep.server_name = `OPhim - ${ep.server_name}`;
          allEpisodes.push(ep);
        });
      }

      // 2. Xử lý Server 2: KKPhim
      if (!resKkphim.error && resKkphim.status && (resKkphim.status === true || resKkphim.status === 'success')) {
        const kkphimData = normalizeMovieData('KKPHIM', resKkphim);
        if (!finalMovie) finalMovie = kkphimData.movie; // Dùng info từ KKPhim nếu OPhim chết
        kkphimData.episodes.forEach(ep => {
          ep.server_name = `KKPhim - ${ep.server_name.replace('#', '')}`;
          allEpisodes.push(ep);
        });
      }

      if (!finalMovie || allEpisodes.length === 0) {
        if(videoTitle) videoTitle.textContent = "Lỗi: Không tìm thấy bộ phim ở cả 2 Server.";
        return;
      }

      // Gán cục dữ liệu đã gộp trở lại cấu trúc cũ để UI tự render
      finalMovie.episodes = allEpisodes;
      const movie = finalMovie;

      if(videoTitle) videoTitle.textContent = movie.name;
      window.currentPlayingMovie = movie;
      if (typeof libAddWatched === 'function') libAddWatched(movie);

      const serverContainer = document.getElementById('server-container');
      const serverListEl = document.getElementById('server-list');
      if (serverContainer) serverContainer.style.display = 'none';
      if (serverListEl) serverListEl.innerHTML = '';

      if (movie.episodes && movie.episodes.length > 0) {
        // Hiển thị danh sách server
        if (serverContainer && serverListEl) {
          serverContainer.style.display = 'block';
          movie.episodes.forEach((server, sIndex) => {
            const sBtn = document.createElement('button');
            sBtn.className = 'server-btn';
            if (sIndex === 0) sBtn.classList.add('active');
            sBtn.textContent = server.server_name;
            sBtn.addEventListener('click', () => {
              document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
              sBtn.classList.add('active');
              renderEpisodes(server.server_data, movie.name);
            });
            serverListEl.appendChild(sBtn);
          });
        }

        // Mặc định render server đầu tiên
        renderEpisodes(movie.episodes[0].server_data, movie.name);
      } else {
        if(videoTitle) videoTitle.textContent = "Lỗi: Không tìm thấy tập phim để phát.";
      }

      // Cập nhật hoặc mở Info Panel
      const movieInfoPanel = document.getElementById('movie-info-panel');
      if (autoOpenInfo) {
        if (movieInfoPanel) {
           movieInfoPanel.classList.add('active');
           if(typeof window.renderMovieInfo === 'function') window.renderMovieInfo();
        }
      } else {
        // Luôn đóng info panel khi người dùng chủ động chọn "Xem phim" thay vì "Chi tiết"
        if (movieInfoPanel) movieInfoPanel.classList.remove('active');
      }

    } catch (error) {
      console.error("Lỗi khi lấy link phim:", error);
      if(videoTitle) videoTitle.textContent = "Lỗi tải phim.";
    }
  }

  // Hàm render danh sách tập phim cho server đã chọn
  function renderEpisodes(episodes, movieName) {
    if (!episodeList) return;
    episodeList.innerHTML = "";

    // Mặc định phát tập đầu tiên của server này
    if (episodes.length > 0 && videoIframe) {
      videoIframe.src = episodes[0].link_embed;
      let epNameDef = episodes[0].name.includes('Tập') ? episodes[0].name : 'Tập ' + episodes[0].name;
      if (videoTitle) videoTitle.innerHTML = `<span class="movie-name-part">${movieName}</span><span class="episode-name"><span class="ep-dash"> - </span>${epNameDef}</span>`;
      if (typeof libAddContinue === 'function' && window.currentPlayingMovie) {
          libAddContinue(window.currentPlayingMovie, epNameDef);
      }
    }

    episodes.forEach((ep, index) => {
      const btn = document.createElement('button');
      btn.className = 'ep-btn';
      if (index === 0) btn.classList.add('active'); // Mặc định tập 1 được chọn
      
      let epName = ep.name;
      if(!isNaN(epName) && epName !== '') {
        epName = 'Tập ' + epName;
      }
      btn.textContent = epName;

      btn.addEventListener('click', () => {
         document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
         btn.classList.add('active');
         if(videoIframe) videoIframe.src = ep.link_embed;
         if(videoTitle) videoTitle.innerHTML = `<span class="movie-name-part">${movieName}</span><span class="episode-name"><span class="ep-dash"> - </span>${epName}</span>`;
         if (typeof libAddContinue === 'function' && window.currentPlayingMovie) {
             libAddContinue(window.currentPlayingMovie, epName);
         }
      });
      
      episodeList.appendChild(btn);
    });
  }





  // Cập nhật hàm Like
  async function updateLikeButtons(container) {
    const likeBtns = container.querySelectorAll('.btn-icon.like-btn, .btn-icon:not(.two)');
    
    // Lấy trước danh sách favs từ Firestore nếu đã đăng nhập
    let favSlugs = [];
    if (window.auth && window.auth.currentUser && typeof libGet === 'function') {
        const favs = await libGet('favorite');
        favSlugs = favs.map(m => m.slug);
    }

    likeBtns.forEach(btn => {
      if(btn.innerHTML.includes('fa-heart')) {
        const slug = btn.getAttribute('data-slug');
        const icon = btn.querySelector('i');
        
        if (slug && favSlugs.includes(slug)) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#ff4757';
            btn.style.boxShadow = '0 0 5px rgba(255, 71, 87, 0.5)';
        }

        btn.onclick = async function(e) {
          e.preventDefault();
          
          if (!window.auth || !window.auth.currentUser) {
              alert('Vui lòng Đăng Nhập để thêm phim vào danh sách Yêu Thích!');
              const loginModal = document.getElementById('login-modal');
              if (loginModal) {
                  loginModal.classList.add('show');
                  document.body.style.overflow = 'hidden';
              }
              return;
          }

          const movie = (window.currentMovies && slug) ? window.currentMovies[slug] : null;
          
          if (icon.classList.contains('fa-regular')) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#ff4757';
            this.style.boxShadow = '0 0 5px rgba(255, 71, 87, 0.5)';
            if (movie && typeof window.libToggleFavorite === 'function') await window.libToggleFavorite(movie, true);
          } else {
            icon.classList.add('fa-regular');
            icon.classList.remove('fa-solid');
            icon.style.color = 'inherit';
            this.style.boxShadow = '1px 1px 1px 1px rgba(190, 190, 190, 0.678)';
            if (movie && typeof window.libToggleFavorite === 'function') await window.libToggleFavorite(movie, false);
          }
        };
      }
    });
  }

  // =============================================
  // Tìm kiếm với AUTOCOMPLETE DROPDOWN gợi ý
  // =============================================
  const searchInputAPI = document.querySelector('.search');
  const searchContainer = document.querySelector('.search-container');

  // Tạo dropdown gợi ý
  const suggestBox = document.createElement('div');
  suggestBox.id = 'search-suggest-box';
  suggestBox.className = 'search-suggest-box';
  if (searchContainer) searchContainer.appendChild(suggestBox);

  function hideSuggestions() {
    suggestBox.classList.remove('show');
    suggestBox.innerHTML = '';
  }

  // Ẩn dropdown khi click ra ngoài
  document.addEventListener('click', function(e) {
    if (!searchContainer || !searchContainer.contains(e.target)) {
      hideSuggestions();
    }
  });

  let debounceTimer = null;
  const IMG_DOMAIN = 'https://img.ophim.live/uploads/movies/';

  if (searchInputAPI) {
    // Autocomplete khi gõ
    searchInputAPI.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      const keyword = this.value.trim();

      if (keyword.length < 2) {
        hideSuggestions();
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const res = await fetch(API_SEARCH + encodeURIComponent(keyword));
          const json = await res.json();
          const responseData = json.data || json;
          const movies = responseData.items || [];

          if (movies.length === 0) {
            hideSuggestions();
            return;
          }

          // Giới hạn hiển 8 gợi ý
          const top = movies.slice(0, 8);
          suggestBox.innerHTML = '';

          top.forEach(movie => {
            const imgUrl = IMG_DOMAIN + (movie.poster_url || movie.thumb_url);
            const item = document.createElement('div');
            item.className = 'suggest-item';
            item.innerHTML = `
              <img src="${imgUrl}" alt="${movie.name}" class="suggest-thumb" onerror="this.src='${IMG_DOMAIN}${movie.thumb_url}'">
              <div class="suggest-info">
                <span class="suggest-title">${movie.name}</span>
                <span class="suggest-meta">${movie.origin_name || ''} &bull; ${movie.year || ''} &bull; ${movie.episode_current || 'Full'}</span>
              </div>
              <i class="fa-solid fa-play suggest-play-icon"></i>
            `;
            item.addEventListener('mousedown', (e) => {
              e.preventDefault(); // Ngăn blur xảy ra trước click
              searchInputAPI.value = movie.name;
              hideSuggestions();
              playMovie(movie.slug);
            });
            suggestBox.appendChild(item);
          });

          suggestBox.classList.add('show');
        } catch(err) {
          console.error('Lỗi autocomplete:', err);
        }
      }, 350);
    });

    // Nhấn Enter → hiển danh sách kết quả như cũ
    searchInputAPI.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        hideSuggestions();
        const keyword = this.value.trim();
        if (keyword !== '') {
          loadSearchData(API_SEARCH + encodeURIComponent(keyword), keyword);
        } else {
          if(mainHomeContent) mainHomeContent.style.display = 'block';
          if(searchResultsSection) searchResultsSection.style.display = 'none';
        }
      }
      if (e.key === 'Escape') {
        hideSuggestions();
        searchInputAPI.blur();
      }
    });
  }


  // --- XỬ LÝ MENU NAVIGATION API (Dùng Event Delegation) ---
  // (Đã được chuyển một phần logic vào parentMenuItems ở trên để tránh lỗi stopPropagation)
  document.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-action');
    // Chỉ xử lý các nav-action không nằm trong menu cha có submenu (vì đã xử lý ở trên)
    if (navItem && !navItem.closest('.nav-link > li')) {
      e.preventDefault();
      const apiUrl = navItem.getAttribute('data-api');
      const title = navItem.getAttribute('data-title');
      
      if(apiUrl) {
        loadSearchData(apiUrl, title);
      }
    }
  });

  // --- HISTORY & NAVIGATION STATE ---
  history.replaceState({ view: 'home' }, '', window.location.pathname);

  window.addEventListener('popstate', function(e) {
    const videoModal = document.getElementById('video-modal');
    const videoIframe = document.getElementById('video-iframe');
    const librarySection = document.getElementById('library-section');

    // Luôn đóng video modal nếu state KHÔNG phải là movie
    if (!e.state || e.state.view !== 'movie') {
      if (videoModal && videoModal.classList.contains('show')) {
        videoModal.classList.remove('show');
        if (videoIframe) {
          videoIframe.src = ''; 
          const parent = videoIframe.parentNode;
          if (parent) {
            parent.removeChild(videoIframe);
            parent.insertBefore(videoIframe, parent.firstChild);
          }
        }
      }
    }

    if (e.state) {
      if (e.state.view === 'home') {
        if(mainHomeContent) mainHomeContent.style.display = 'block';
        if(searchResultsSection) searchResultsSection.style.display = 'none';
        if(librarySection) librarySection.style.display = 'none';
      } else if (e.state.view === 'search') {
        loadSearchData(e.state.apiUrl, e.state.title, false);
      } else if (e.state.view === 'library') {
        if(mainHomeContent) mainHomeContent.style.display = 'none';
        if(searchResultsSection) searchResultsSection.style.display = 'none';
        if(librarySection) librarySection.style.display = 'block';
      } else if (e.state.view === 'movie') {
        window.playMovie(e.state.slug, false, false);
      }
    } else {
       if(mainHomeContent) mainHomeContent.style.display = 'block';
       if(searchResultsSection) searchResultsSection.style.display = 'none';
       if(librarySection) librarySection.style.display = 'none';
    }
  });

  window.loadSearchData = async function loadSearchData(apiUrl, title, pushHistory = true) {
      if(pushHistory) {
        history.pushState({ view: 'search', apiUrl: apiUrl, title: title }, '', '#search');
      }

      const librarySection = document.getElementById('library-section');
      if (librarySection) librarySection.style.display = 'none';

      if(mainHomeContent) mainHomeContent.style.display = 'none';
      if(searchResultsSection) searchResultsSection.style.display = 'block';
      if(searchKeywordSpan) searchKeywordSpan.textContent = title;
      if(searchMovieList) searchMovieList.innerHTML = '<p style="color:white; grid-column: 1 / -1; padding: 20px;">Đang tải danh sách phim...</p>';

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const responseData = data.data || data;
        
        const domainImage = responseData.APP_DOMAIN_CDN_IMAGE ? responseData.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/' : 'https://img.ophim.live/uploads/movies/';
        const movies = responseData.items || [];

        if (movies && movies.length > 0) {
            renderMovies(movies, searchMovieList, domainImage);
        } else {
            searchMovieList.innerHTML = '<p style="color:#aaa; grid-column: 1 / -1; padding: 20px; font-style:italic;">Không tìm thấy kết quả cho mục này.</p>';
        }
      } catch(error) {
        console.error("Lỗi khi tải danh mục:", error);
        searchMovieList.innerHTML = '<p style="color:white; grid-column: 1 / -1; padding: 20px;">Lỗi kết nối khi tải danh sách.</p>';
      }
  }

  // --- Tìm kiếm phim theo tên diễn viên (thử nhiều từ khóa) ---
  async function searchByActor(actorName) {
    if(mainHomeContent) mainHomeContent.style.display = 'none';
    if(searchResultsSection) searchResultsSection.style.display = 'block';
    if(searchKeywordSpan) searchKeywordSpan.textContent = `Diễn viên: ${actorName}`;
    if(searchMovieList) searchMovieList.innerHTML = `<p style="color:white; grid-column: 1 / -1; padding: 20px;">Đang tìm phim có diễn viên <strong style="color:#efb003">${actorName}</strong>...</p>`;
    history.pushState({ view: 'search', apiUrl: API_SEARCH + encodeURIComponent(actorName), title: `Diễn viên: ${actorName}` }, '', '#search');

    // Thử lần lượt: tên đầy đủ → từng từ riêng lẻ
    const nameParts = actorName.split(/[\s\-]+/).filter(p => p.length > 1);
    const keywords = [actorName, ...nameParts].filter((v, i, a) => a.indexOf(v) === i);

    const domainImage = 'https://img.ophim.live/uploads/movies/';
    let foundMovies = [];
    let usedKeyword = '';

    for (const kw of keywords) {
      try {
        const res = await fetch(API_SEARCH + encodeURIComponent(kw));
        const json = await res.json();
        const responseData = json.data || json;
        const items = responseData.items || [];
        if (items.length > 0) {
          foundMovies = items;
          usedKeyword = kw;
          break;
        }
      } catch(e) {
        console.error('Lỗi tìm kiếm actor:', e);
      }
    }

    if (foundMovies.length > 0) {
      if(searchKeywordSpan) searchKeywordSpan.textContent = `Diễn viên: ${actorName}`;
      renderMovies(foundMovies, searchMovieList, domainImage);
    } else {
      // Thông báo thân thiện khi không có kết quả
      const suggestionBtns = nameParts.map(p =>
        `<button onclick="loadSearchData('${API_SEARCH}${encodeURIComponent(p)}', '${p}')" style="background:rgba(239,176,3,0.12); border:1px solid rgba(239,176,3,0.5); color:#efb003; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; transition:all 0.2s;" onmouseover="this.style.background='rgba(239,176,3,0.25)'" onmouseout="this.style.background='rgba(239,176,3,0.12)'">🔍 Tìm "${p}"</button>`
      ).join('');
      searchMovieList.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 16px;">🎬</div>
          <h3 style="color:#fff; margin-bottom:10px; font-size:18px;">Không tìm thấy phim của <span style="color:#efb003;">${actorName}</span></h3>
          <p style="color:#888; font-size:14px; max-width:450px; margin: 0 auto 24px; line-height:1.6;">
            Cơ sở dữ liệu chưa hỗ trợ tìm kiếm trực tiếp theo tên diễn viên. Thử tìm theo tên phim mà diễn viên này đóng.
          </p>
          ${nameParts.length > 0 ? `<div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">${suggestionBtns}</div>` : ''}
        </div>
      `;
    }
  }


  // --- XỬ LÝ NÚT TRƯỢT (SLIDER ARROWS) - DÙNG TRANSFORM ĐỂ KHÔNG BỊ CLIP CARD ---
  const sliderWrappers = document.querySelectorAll('.slider-wrapper');
  sliderWrappers.forEach(wrapper => {
    const prevBtn = wrapper.querySelector('.prev-btn');
    const nextBtn = wrapper.querySelector('.next-btn');
    const movieList = wrapper.querySelector('.movie-list');

    let currentTranslate = 0;

    if (prevBtn && nextBtn && movieList) {
      prevBtn.addEventListener('click', () => {
        const viewWidth = wrapper.clientWidth;
        currentTranslate += viewWidth;
        if (currentTranslate > 0) currentTranslate = 0;
        movieList.style.transform = `translateX(${currentTranslate}px)`;
      });
      
      nextBtn.addEventListener('click', () => {
        const viewWidth = wrapper.clientWidth;
        const listWidth = movieList.scrollWidth;
        
        currentTranslate -= viewWidth;
        
        // Giới hạn không cho trượt quá danh sách
        const maxScroll = listWidth - viewWidth;
        if (Math.abs(currentTranslate) > maxScroll) {
          currentTranslate = -maxScroll;
        }
        
        movieList.style.transform = `translateX(${currentTranslate}px)`;
      });
    }
  });

  // Hàm render Top 10
  function renderTop10Movies(movies, container, domainImage) {
    if (!container) return;
    container.innerHTML = '';
    movies.forEach((movie, index) => {
      // Ưu tiên dùng poster_url (ảnh dọc), nếu không có thì dùng ảnh ngang (thumb_url)
      const imgPath = movie.poster_url || movie.thumb_url;
      const imgUrl = domainImage + imgPath;
      
      const card = document.createElement('div');
      card.className = 'top10-card';
      card.onclick = () => playMovie(movie.slug);
      card.innerHTML = `
        <div class="top10-img-box">
          <img src="${imgUrl}" alt="${movie.name}">
          <span class="top10-badge">${movie.episode_current || 'Full'}</span>
        </div>
        <div class="top10-info-container">
          <div class="top10-rank">${index + 1}</div>
          <div class="top10-text">
            <h4 class="top10-title" title="${movie.name}">${movie.name}</h4>
            <p class="top10-sub" title="${movie.origin_name || ''}">${movie.origin_name || ''} (${movie.year || '2026'})</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Lấy dữ liệu Top 10
  async function fetchTop10() {
    const container = document.getElementById('api-top10-list');
    if (!container) return;
    
    try {
      const response = await fetch('https://ophim1.com/v1/api/danh-sach/phim-bo?page=2'); // Lấy page 2 cho khác biệt
      const data = await response.json();
      const domainImage = data.data.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/';
      const movies = data.data.items.slice(0, 10); // Lấy đúng 10 phim
      renderTop10Movies(movies, container, domainImage);
    } catch(error) {
      console.error("Lỗi tải Top 10:", error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; width: 100%;">
          <i class="fa-solid fa-server" style="font-size: 40px; color: #ef4444; margin-bottom: 15px;"></i>
          <h3 style="color: #fff; margin-bottom: 10px; font-family: 'Inter', sans-serif;">Máy chủ đang bận đi cà phê!</h3>
          <p style="color: #ccc; font-size: 15px; font-family: 'Inter', sans-serif;">Hệ thống cung cấp phim đang được bảo trì hoặc quá tải. Vui lòng quay lại sau ít phút nhé.</p>
        </div>
      `;
    }
  }

  // Lấy dữ liệu phim theo quốc gia (Sidebar layout)
  async function fetchCountryMovies(slug, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const response = await fetch(`https://ophim1.com/v1/api/quoc-gia/${slug}`);
      const data = await response.json();
      const domainImage = data.data.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/';
      const movies = data.data.items.slice(0, 10);
      renderMovies(movies, container, domainImage);
    } catch(error) {
      console.error(`Lỗi tải phim ${slug}:`, error);
      container.innerHTML = '<p style="color:white; padding-left: 10px;">Lỗi tải dữ liệu.</p>';
    }
  }

  // Khởi tạo lấy dữ liệu
  fetchHomeMovies();
  fetchTop10();
  fetchCountryMovies('han-quoc', 'api-country-korea');
  fetchCountryMovies('trung-quoc', 'api-country-china');
  fetchCountryMovies('au-my', 'api-country-usuk');

  // ============================================================
  //  DARK / LIGHT MODE TOGGLE
  // ============================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme-icon') : null;

  // Khởi tạo theme từ localStorage (giữ trạng thái qua các lần load)
  const savedTheme = localStorage.getItem('moviechill-theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeIcon) themeIcon.textContent = '☀️';
  } else {
    if (themeIcon) themeIcon.textContent = '🌙';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');

      // Animate icon with a quick flip
      if (themeIcon) {
        themeIcon.style.transform = 'scale(0) rotate(180deg)';
        setTimeout(() => {
          themeIcon.textContent = isLight ? '☀️' : '🌙';
          themeIcon.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
      }

      // Persist preference
      localStorage.setItem('moviechill-theme', isLight ? 'light' : 'dark');
    });
  }

  // main.js - Tích hợp Login Modal mới

document.addEventListener('DOMContentLoaded', () => {
  // --- EXISTING CODE (giữ nguyên code cũ của em) ---
  // ... các hàm liên quan đến slider, menu, vv. ...

  // --- LOGIC CHO LOGIN MODAL MỚI ---
  const loginModal = document.getElementById('login-modal');
  const btnOpenLogin = document.getElementById('btn-login-header'); 
  const btnCloseLogin = document.querySelector('.login-close-btn');
  const googleBtn = document.querySelector('.google-btn');

  // Hàm cập nhật UI khi đăng nhập/đăng xuất
  function updateAuthUI(user) {
    if (user) {
      // Khi đã đăng nhập - Sử dụng cấu trúc HTML mới chuyên nghiệp hơn
      btnOpenLogin.classList.add('user-logged-in-btn');
      btnOpenLogin.innerHTML = `
        <img src="${user.photoURL || './ig/avatar-tho-bay-mau-11.jpg'}" class="user-avatar" alt="avatar">
        <span class="user-name">${user.displayName || 'Member Chill'}</span>
      `;
      btnOpenLogin.title = "Click để Đăng Xuất";
      
      btnOpenLogin.onclick = (e) => {
        e.preventDefault();
        if(confirm('Chào ' + (user.displayName || 'bạn') + ', bạn có muốn đăng xuất khỏi MovieChill không?')) {
          signOut(auth).then(() => {
            alert('Đã đăng xuất thành công!');
            location.reload();
          });
        }
      };

      if (loginModal.classList.contains('show')) {
        closeLoginModal();
      }
    } else {
      // Khi chưa đăng nhập
      btnOpenLogin.classList.remove('user-logged-in-btn');
      btnOpenLogin.innerHTML = `<i class="fa-regular fa-user"></i> Đăng Nhập`;
      btnOpenLogin.title = "Đăng Nhập";
      btnOpenLogin.onclick = (e) => {
        e.preventDefault();
        openLoginModal();
      };
    }
  }

  // Theo dõi trạng thái đăng nhập
  onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
  });

  // Xử lý đăng nhập bằng Google
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        alert(`Chào mừng ${user.displayName} đã quay trở lại!`);
        closeLoginModal();
      } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        alert("Đăng nhập thất bại!\nMã lỗi: " + error.code + "\nLời nhắn: " + error.message);
      }
    });
  }

  /* Tạm khóa tính năng đăng nhập Facebook 
  const facebookBtn = document.querySelector('.facebook-btn');
  if (facebookBtn) {
    facebookBtn.addEventListener('click', async () => {
      try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;
        alert(`Chào mừng ${user.displayName} đã đăng nhập bằng Facebook!`);
        closeLoginModal();
      } catch (error) {
        console.error("Lỗi đăng nhập Facebook:", error);
        alert("Đăng nhập Facebook thất bại!\nLưu ý: Bạn cần cấu hình App ID/Secret trong Firebase Console.\nLỗi: " + error.code);
      }
    });
  }
  */

  // Hàm mở modal
  function openLoginModal() {
    loginModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang nền
  }

  // Hàm đóng modal
  function closeLoginModal() {
    loginModal.classList.remove('show');
    document.body.style.overflow = ''; // Cho phép cuộn trang lại
  }

  // Bắt sự kiện click (Nút login ban đầu)
  btnOpenLogin.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (!auth.currentUser) {
      openLoginModal();
    }
  });

  btnCloseLogin.addEventListener('click', closeLoginModal);

  // Đóng khi click bên ngoài modal content
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      closeLoginModal();
    }
  });

  // Đóng bằng phím Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal.classList.contains('show')) {
      closeLoginModal();
    }
  });

  // Logic Đăng ký / Đăng nhập bằng Email
  const loginFormElement = document.getElementById('auth-login-form');
  const loginTitle = document.querySelector('.login-title');
  const loginSubmitBtn = document.querySelector('.login-submit-btn');
  const btnGotoRegister = document.getElementById('btn-goto-register');
  const btnGotoRegisterSub = document.getElementById('btn-goto-register-sub');
  
  let isRegisterMode = false;

  // Hàm chuyển đổi giao diện giữa Đăng nhập và Đăng ký
  function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    const passwordError = document.getElementById('passwordError');
    if (passwordError) passwordError.style.display = 'none';

    if (isRegisterMode) {
      if(loginTitle) loginTitle.textContent = 'Đăng ký';
      if(loginSubmitBtn) loginSubmitBtn.textContent = 'Đăng ký';
      if(btnGotoRegister) btnGotoRegister.textContent = 'ĐĂNG NHẬP NGAY';
      if(btnGotoRegisterSub) btnGotoRegisterSub.textContent = 'đăng nhập ngay';
      if(confirmGroup) confirmGroup.style.display = 'block';
    } else {
      if(loginTitle) loginTitle.textContent = 'Đăng nhập';
      if(loginSubmitBtn) loginSubmitBtn.textContent = 'Đăng nhập';
      if(btnGotoRegister) btnGotoRegister.textContent = 'ĐĂNG KÝ NGAY';
      if(btnGotoRegisterSub) btnGotoRegisterSub.textContent = 'đăng ký ngay';
      if(confirmGroup) confirmGroup.style.display = 'none';
    }
  }

  // Gắn sự kiện cho các nút chuyển đổi (nếu có)
  if (btnGotoRegister) {
    btnGotoRegister.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode();
    });
  }

  if (btnGotoRegisterSub) {
    btnGotoRegisterSub.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode();
    });
  }

  // Xử lý sự kiện submit form
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('login-username').value;
      const passInput = document.getElementById('login-pw').value;
      const confirmInput = document.getElementById('confirmPassword').value;
      const passwordError = document.getElementById('passwordError');
      
      if (!emailInput || !passInput) {
        alert("Vui lòng nhập Email và Mật khẩu!");
        return;
      }

      if (isRegisterMode) {
        if (passInput !== confirmInput) {
          if (passwordError) passwordError.style.display = 'block';
          return;
        } else {
          if (passwordError) passwordError.style.display = 'none';
        }
      }
      
      try {
        if (isRegisterMode) {
          const userCredential = await createUserWithEmailAndPassword(window.auth, emailInput, passInput);
          
          // Cập nhật thông tin profile mặc định cho người dùng mới
          await updateProfile(userCredential.user, {
            displayName: "Member Chill",
            photoURL: "https://avatarngau.sbs/wp-content/uploads/2025/05/avatar-tho-bay-mau-11.jpg"
          });

          await sendEmailVerification(userCredential.user);
          await signOut(window.auth); // Buộc người dùng phải xác minh mới được đăng nhập
          alert("Đăng ký thành công! Vui lòng kiểm tra hộp thư Email để kích hoạt tài khoản.");
          closeLoginModal();
        } else {
          // Xử lý Đăng nhập
          const userCredential = await signInWithEmailAndPassword(window.auth, emailInput, passInput);
          
          // Kiểm tra xem email đã được xác minh chưa
          if (!userCredential.user.emailVerified) {
            await signOut(window.auth);
            alert("Vui lòng kích hoạt tài khoản qua đường link đã gửi vào Email của bạn trước khi đăng nhập!");
            return;
          }
          
          closeLoginModal(); // Đóng modal, onAuthStateChanged sẽ tự lo phần UI
        }
      } catch (error) {
        console.error("Lỗi xác thực Email:", error);
        let msg = "Đã xảy ra lỗi không xác định!";
        switch(error.code) {
          case 'auth/email-already-in-use': 
            msg = "Email này đã được sử dụng cho một tài khoản khác!"; break;
          case 'auth/wrong-password': 
            msg = "Mật khẩu không chính xác!"; break;
          case 'auth/user-not-found': 
            msg = "Tài khoản không tồn tại, bạn có muốn đăng ký không?"; break;
          case 'auth/weak-password': 
            msg = "Mật khẩu quá yếu! Vui lòng nhập ít nhất 6 ký tự."; break;
          case 'auth/invalid-credential':
            msg = "Thông tin đăng nhập không hợp lệ (sai email hoặc mật khẩu)!"; break;
          case 'auth/invalid-email':
            msg = "Định dạng email không hợp lệ!"; break;
          default: 
            msg = "Lỗi: " + error.message;
        }
        alert(msg);
      }
    });
  }
});

// ==========================================
// TÍNH NĂNG THƯ VIỆN PHIM (LIBRARY MODULE) - FIRESTORE
// ==========================================

window.libGet = async function(key) {
    if (!window.auth || !window.auth.currentUser) return [];
    const uid = window.auth.currentUser.uid;
    const db = window.db;
    
    try {
        const q = query(collection(db, 'users', uid, key), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data;
    } catch (error) {
        console.error("Lỗi lấy dữ liệu " + key + ":", error);
        return [];
    }
}

window.libToggleFavorite = async function(movie, isAdd) {
    if (!window.auth || !window.auth.currentUser) return;
    const uid = window.auth.currentUser.uid;
    const db = window.db;
    const docRef = doc(db, 'users', uid, 'favorite', movie.slug);

    if (isAdd) {
        // Loại bỏ các giá trị undefined có thể gây lỗi Firestore
        const cleanMovie = JSON.parse(JSON.stringify(movie));
        await setDoc(docRef, {
            ...cleanMovie,
            timestamp: serverTimestamp()
        });
    } else {
        await deleteDoc(docRef);
    }
    
    // Nếu đang mở tab favorite thì render lại
    const activeTab = document.querySelector('.lib-tab-btn.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'favorite') {
        renderLibrary('favorite');
    }
}

window.libAddWatched = async function(movie) {
    if (!window.auth || !window.auth.currentUser) return;
    const uid = window.auth.currentUser.uid;
    const db = window.db;
    const docRef = doc(db, 'users', uid, 'watched', movie.slug);

    const cleanMovie = JSON.parse(JSON.stringify(movie));
    await setDoc(docRef, {
        ...cleanMovie,
        timestamp: serverTimestamp()
    });
}

window.libAddContinue = async function(movie, episodeName) {
    if (!window.auth || !window.auth.currentUser) return;
    const uid = window.auth.currentUser.uid;
    const db = window.db;
    const docRef = doc(db, 'users', uid, 'continue', movie.slug);

    const cleanMovie = JSON.parse(JSON.stringify(movie));
    await setDoc(docRef, {
        ...cleanMovie,
        last_watched_ep: episodeName,
        timestamp: serverTimestamp()
    });
}

window.libRemoveMovie = async function(collectionName, slug) {
    if (!window.auth || !window.auth.currentUser) return;
    const uid = window.auth.currentUser.uid;
    const db = window.db;
    try {
        const docRef = doc(db, 'users', uid, collectionName, slug);
        await deleteDoc(docRef);
        // Cập nhật lại giao diện ngay sau khi xóa
        renderLibrary(collectionName);
    } catch (error) {
        console.error("Lỗi khi xóa phim:", error);
    }
}

window.renderLibrary = async function(tabName) {
    const container = document.getElementById('library-movie-list');
    if (!container) return;
    
    if (!window.auth || !window.auth.currentUser) {
        container.innerHTML = '<p style="color:#efb003; grid-column: 1 / -1; padding: 20px; font-weight:bold; font-size: 16px;"><i class="fa-solid fa-lock"></i> Vui lòng Đăng Nhập để xem Thư Viện của bạn.</p>';
        return;
    }

    container.innerHTML = '<p style="color:#aaa; grid-column: 1 / -1; padding: 20px;">Đang tải dữ liệu từ Firestore...</p>';
    
    const data = await libGet(tabName);
    
    if (data.length === 0) {
        container.innerHTML = '<p style="color:#aaa; grid-column: 1 / -1; padding: 20px; font-style:italic;">Chưa có phim nào trong danh sách này.</p>';
        return;
    }
    
    container.innerHTML = '';
    window.currentMovies = window.currentMovies || {};
    
    data.forEach(movie => {
        window.currentMovies[movie.slug] = movie;
        const imgUrl = movie.thumb_url.startsWith('http') ? movie.thumb_url : ('https://img.ophim.live/uploads/movies/' + movie.thumb_url);
        
        let badgeHtml = `<span class="episode">${movie.episode_current || 'Full'}</span>`;
        if (tabName === 'continue' && movie.last_watched_ep) {
            badgeHtml += `<div class="continue-badge">Đang xem: ${movie.last_watched_ep}</div>`;
        }

        let deleteBtnHtml = '';
        if (tabName === 'watched' || tabName === 'continue') {
            deleteBtnHtml = `<button class="delete-movie-btn" onclick="event.stopPropagation(); libRemoveMovie('${tabName}', '${movie.slug}')" title="Xóa khỏi danh sách"><i class="fa-solid fa-trash"></i></button>`;
        }

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
        <div class="card-wrapper">
          <div class="item-info">
            <img class="bg-blur" src="${imgUrl}" alt="">
            <img class="main-img" src="${imgUrl}" alt="${movie.name}">
            ${badgeHtml}
            ${deleteBtnHtml}
          </div>
          <div class="card-info">
            <h3 class="title-vn">${movie.name}</h3>
            <p class="title-en">${movie.origin_name || ''}</p>
            <div class="hover">
              <div class="action-buttons">
                <button class="btn btn-play" onclick="playMovie('${movie.slug}')"><i class="fa-solid fa-play"></i>Xem Ngay</button>
                <button class="btn btn-icon like-btn" data-slug="${movie.slug}"><i class="fa-regular fa-heart"></i>Like</button>
                <button class="btn btn-icon two" onclick="playMovie('${movie.slug}', true)"><i class="fa-solid fa-circle-info"></i>Chi Tiết</button>
              </div>
              <div class="data-card">
                <span class="tag solid">${(movie.country && movie.country[0]) ? movie.country[0].name : 'Thế Giới'}</span>
                <span class="tag outline">${movie.year || '2026'}</span>
                <span class="tag solid-brown">${movie.quality || 'HD'}</span>
              </div>
              <div class="Manufacturer">
                <span style="color: #b3b3b3; font-size: 12px; font-weight: bold; letter-spacing: 2px;">NTB<span style="color: #efb003;"> MOVIECHILL</span></span>
              </div>
            </div>
          </div>
        </div>
        `;
        
        const imgElement = card.querySelector('.item-info img.main-img');
        if(imgElement) {
          imgElement.style.cursor = 'pointer';
          imgElement.addEventListener('click', () => playMovie(movie.slug));
        }
        
        container.appendChild(card);
    });
    
    // Re-bind like buttons for these new cards
    updateLikeButtons(container);
}

// Lắng nghe sự kiện click nút Thư Viện trên Nav
document.addEventListener('DOMContentLoaded', () => {
    const navLibraryBtn = document.getElementById('nav-library');
    const librarySection = document.getElementById('library-section');
    const mainHomeContent = document.getElementById('main-home-content');
    const searchResultsSection = document.getElementById('search-results-section');
    const tabBtns = document.querySelectorAll('.lib-tab-btn');

    if (navLibraryBtn) {
        navLibraryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            history.pushState({ view: 'library' }, '', '#library');
            if (mainHomeContent) mainHomeContent.style.display = 'none';
            if (searchResultsSection) searchResultsSection.style.display = 'none';
            if (librarySection) {
                librarySection.style.display = 'block';
                // Mặc định load tab Yêu Thích
                document.querySelector('.lib-tab-btn[data-tab="favorite"]').click();
            }
            
            // Xóa active ở các nav item khác
            document.querySelectorAll('.nav-link li').forEach(li => li.classList.remove('active'));
            navLibraryBtn.classList.add('active');
            
            // Đóng menu mobile nếu đang mở
            const hamburger = document.getElementById('hamburger');
            const navLink = document.querySelector('.nav-link');
            if (hamburger && navLink) {
                hamburger.classList.remove('toggle');
                navLink.classList.remove('active');
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLibrary(btn.getAttribute('data-tab'));
        });
    });
    
    // Tải lại library nếu đang mở khi user login/logout
    import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js").then(({ onAuthStateChanged }) => {
        if (window.auth) {
            onAuthStateChanged(window.auth, (user) => {
                const librarySection = document.getElementById('library-section');
                if (librarySection && librarySection.style.display === 'block') {
                    const activeTab = document.querySelector('.lib-tab-btn.active');
                    if (activeTab) {
                        renderLibrary(activeTab.getAttribute('data-tab'));
                    }
                }
                
                // Re-render tất cả nút Like trên trang chủ để update trạng thái
                const allContainers = document.querySelectorAll('.movie-list');
                allContainers.forEach(container => {
                    if (container.id !== 'library-movie-list') {
                        updateLikeButtons(container);
                    }
                });
            });
        }
    });

    // --- XỬ LÝ NÚT DONATE ---
    const btnDonate = document.getElementById('btn-donate-header');
    const donateModal = document.getElementById('donate-modal');
    const closeDonateBtn = document.getElementById('close-donate-btn');

    if (btnDonate && donateModal) {
        btnDonate.addEventListener('click', () => {
            donateModal.classList.add('active');
        });
    }

    if (closeDonateBtn && donateModal) {
        closeDonateBtn.addEventListener('click', () => {
            donateModal.classList.remove('active');
        });
    }

    // Đóng donate khi click ngoài modal
    if (donateModal) {
        window.addEventListener('click', (e) => {
            if (e.target === donateModal) {
                donateModal.classList.remove('active');
            }
        });
    }

    // Copy STK
    const copyableElems = document.querySelectorAll('.info-value.copyable');
    copyableElems.forEach(elem => {
        elem.addEventListener('click', function() {
            const textToCopy = this.textContent.trim().replace(' Copy', '');
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalHTML = this.innerHTML;
                this.innerHTML = `${textToCopy} <i class="fa-solid fa-check" style="color: #4ade80;"></i>`;
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                }, 2000);
            });
        });
    });

    // ==========================================
    // REAL-TIME COMMENTS
    // ==========================================
    let currentCommentsUnsubscribe = null;
    let currentWatchingMovieSlug = null;

    // Tính thời gian tương đối
    function timeSince(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " năm trước";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " tháng trước";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " ngày trước";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " giờ trước";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " phút trước";
      return "vừa xong";
    }

    // Khởi tạo khung bình luận cho phim
    window.initComments = function(movieSlug) {
      currentWatchingMovieSlug = movieSlug;
      const commentsList = document.getElementById('comments-list');
      if (!commentsList) return;
      
      // Hủy listener cũ nếu có
      if (currentCommentsUnsubscribe) {
        currentCommentsUnsubscribe();
        currentCommentsUnsubscribe = null;
      }
      
      commentsList.innerHTML = '<div class="no-comments-msg">Đang tải bình luận...</div>';

      import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(({ collection, query, orderBy, onSnapshot }) => {
        // Tạo query lấy bình luận xếp theo thời gian mới nhất
        const commentsRef = collection(window.db, 'movies', movieSlug, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        // Lắng nghe realtime
        currentCommentsUnsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            commentsList.innerHTML = '<div class="no-comments-msg">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>';
            return;
          }

          let commentsHTML = '';
          const currentUid = window.auth && window.auth.currentUser ? window.auth.currentUser.uid : null;

          const parents = [];
          const repliesMap = {};

          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const comment = { id: docSnap.id, ...data };
            if (data.parentId) {
              if (!repliesMap[data.parentId]) repliesMap[data.parentId] = [];
              repliesMap[data.parentId].push(comment);
            } else {
              parents.push(comment);
            }
          });

          const generateCommentHTML = (c, isReply = false, extraClass = '') => {
            const timeStr = c.createdAt ? timeSince(c.createdAt.toDate()) : 'vừa xong';
            const avatarUrl = c.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.displayName || 'User') + '&background=random';
            const isOwner = currentUid && c.uid === currentUid;
            
            const parentIdAttr = isReply ? c.parentId : c.id;
            const replyBtnHtml = currentUid ? `<button class="btn-reply-comment" data-id="${c.id}" data-parent-id="${parentIdAttr}" data-name="${c.displayName}">Phản hồi</button>` : '';
            const deleteBtnHtml = isOwner ? `<button class="btn-delete-comment" data-id="${c.id}" title="Xóa bình luận"><i class="fa-solid fa-trash"></i></button>` : '';
            const replyToHtml = (isReply && c.replyTo) ? `<span class="reply-to-tag">@${c.replyTo}</span>` : '';

            return `
              <div class="comment-item ${extraClass}" id="comment-${c.id}">
                <img src="${avatarUrl}" alt="${c.displayName}" class="comment-avatar">
                <div class="comment-item-content">
                  <div class="comment-header">
                    <span class="comment-name">${c.displayName || 'Người dùng ẩn danh'}</span>
                    <span class="comment-time">${timeStr}</span>
                    ${replyBtnHtml}
                    ${deleteBtnHtml}
                  </div>
                  <div class="comment-body">${replyToHtml}${c.text}</div>
                </div>
              </div>
            `;
          };

          parents.forEach(p => {
            commentsHTML += generateCommentHTML(p, false);
            const reps = repliesMap[p.id];
            if (reps && reps.length > 0) {
              reps.reverse(); // Đảo ngược để cũ nhất lên trên
              commentsHTML += `<div class="replies-container">`;
              
              const MAX_VISIBLE = 2;
              const hasMore = reps.length > MAX_VISIBLE;

              reps.forEach((r, index) => {
                const extraClass = (hasMore && index >= MAX_VISIBLE) ? 'hidden-reply' : '';
                commentsHTML += generateCommentHTML(r, true, extraClass);
              });

              if (hasMore) {
                const hiddenCount = reps.length - MAX_VISIBLE;
                commentsHTML += `
                  <div class="show-more-replies-wrapper">
                    <button class="btn-show-more-replies">
                      <i class="fa-solid fa-reply"></i> Xem thêm ${hiddenCount} phản hồi
                    </button>
                  </div>
                `;
              }

              commentsHTML += `</div>`;
            }
          });

          commentsList.innerHTML = commentsHTML;
        }, (error) => {
          console.error("Lỗi khi tải bình luận: ", error);
          commentsList.innerHTML = '<div class="no-comments-msg" style="color: #ef4444;">Không thể tải bình luận. Vui lòng tải lại trang.</div>';
        });
      });
    };

    // Lắng nghe sự kiện Auth để bật tắt form bình luận
    const authWarning = document.getElementById('comment-auth-warning');
    const loginTrigger = document.querySelector('.login-trigger');
    if (loginTrigger) {
      loginTrigger.addEventListener('click', () => {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
      });
    }
    const inputForm = document.getElementById('comment-input-form');
    const avatarImg = document.getElementById('current-user-avatar');
    const textarea = document.getElementById('comment-textarea');
    const charCount = document.getElementById('comment-char-count');
    const btnSubmit = document.getElementById('btn-submit-comment');

    import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js").then(({ onAuthStateChanged }) => {
      if (window.auth) {
        onAuthStateChanged(window.auth, (user) => {
          if (user) {
            if(authWarning) authWarning.style.display = 'none';
            if(inputForm) inputForm.style.display = 'flex';
            if(avatarImg) avatarImg.src = user.photoURL || './ig/avatar-tho-bay-mau-11.jpg';
          } else {
            if(authWarning) authWarning.style.display = 'block';
            if(inputForm) inputForm.style.display = 'none';
          }
        });
      }
    });

    // Xử lý đếm ký tự
    if (textarea) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        if(charCount) charCount.textContent = `${len}/500`;
        if (len > 0 && len <= 500) {
          if(btnSubmit) btnSubmit.disabled = false;
        } else {
          if(btnSubmit) btnSubmit.disabled = true;
        }
      });
    }

    // Xử lý gửi bình luận
    if (btnSubmit) {
      btnSubmit.disabled = true; // Mặc định disable
      btnSubmit.addEventListener('click', () => {
        if (!window.auth || !window.auth.currentUser || !currentWatchingMovieSlug) {
          alert("Vui lòng đăng nhập để bình luận!");
          return;
        }
        
        const text = textarea.value.trim();
        if (!text || text.length > 500) return;
        
        btnSubmit.disabled = true;
        const originalText = btnSubmit.textContent;
        btnSubmit.textContent = 'Đang gửi...';

        import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(({ collection, addDoc, serverTimestamp }) => {
          const user = window.auth.currentUser;
          addDoc(collection(window.db, 'movies', currentWatchingMovieSlug, 'comments'), {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            text: text,
            createdAt: serverTimestamp()
          }).then(() => {
            textarea.value = '';
            if(charCount) charCount.textContent = '0/500';
          }).catch((error) => {
            console.error("Lỗi khi gửi bình luận: ", error);
            alert("Có lỗi xảy ra, vui lòng thử lại sau!");
          }).finally(() => {
            btnSubmit.textContent = originalText;
            btnSubmit.disabled = textarea.value.trim().length === 0;
          });
        });
      });
    }

    // Xử lý sự kiện trên danh sách bình luận (Xóa, Phản hồi)
    const commentsListElement = document.getElementById('comments-list');
    if (commentsListElement) {
      commentsListElement.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete-comment');
        if (deleteBtn) {
          const commentId = deleteBtn.getAttribute('data-id');
          if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(({ doc, deleteDoc }) => {
              const docRef = doc(window.db, 'movies', currentWatchingMovieSlug, 'comments', commentId);
              deleteDoc(docRef).catch(err => {
                console.error("Lỗi khi xóa bình luận: ", err);
                alert("Không thể xóa bình luận, vui lòng kiểm tra lại quyền hoặc kết nối mạng!");
              });
            });
          }
          return;
        }

        const replyBtn = e.target.closest('.btn-reply-comment');
        if (replyBtn) {
          // Xóa các form reply cũ nếu có
          document.querySelectorAll('.reply-input-form').forEach(f => f.remove());

          const parentId = replyBtn.getAttribute('data-parent-id');
          const replyToName = replyBtn.getAttribute('data-name');
          const commentItemContent = replyBtn.closest('.comment-item-content');
          
          if (commentItemContent) {
            const formHtml = `
              <div class="reply-input-form">
                <div class="reply-input-wrapper">
                  <textarea class="reply-textarea" placeholder="Viết phản hồi..."></textarea>
                  <div class="reply-actions">
                    <button class="btn-cancel-reply">Hủy</button>
                    <button class="btn-send-reply" data-parent-id="${parentId}" data-reply-to="${replyToName}">Gửi phản hồi</button>
                  </div>
                </div>
              </div>
            `;
            commentItemContent.insertAdjacentHTML('beforeend', formHtml);
            
            const newTextarea = commentItemContent.querySelector('.reply-textarea');
            const newSendBtn = commentItemContent.querySelector('.btn-send-reply');
            newSendBtn.disabled = true;

            newTextarea.addEventListener('input', () => {
              newSendBtn.disabled = newTextarea.value.trim().length === 0;
            });
            newTextarea.focus();
          }
          return;
        }

        const cancelBtn = e.target.closest('.btn-cancel-reply');
        if (cancelBtn) {
          const form = cancelBtn.closest('.reply-input-form');
          if (form) form.remove();
          return;
        }

        const showMoreBtn = e.target.closest('.btn-show-more-replies');
        if (showMoreBtn) {
          const container = showMoreBtn.closest('.replies-container');
          if (container) {
            container.querySelectorAll('.hidden-reply').forEach(el => el.classList.remove('hidden-reply'));
            showMoreBtn.closest('.show-more-replies-wrapper').remove();
          }
          return;
        }

        const sendReplyBtn = e.target.closest('.btn-send-reply');
        if (sendReplyBtn) {
          if (!window.auth || !window.auth.currentUser) return;
          const form = sendReplyBtn.closest('.reply-input-form');
          const textarea = form.querySelector('.reply-textarea');
          const text = textarea.value.trim();
          if (!text) return;

          const parentId = sendReplyBtn.getAttribute('data-parent-id');
          const replyTo = sendReplyBtn.getAttribute('data-reply-to');
          
          sendReplyBtn.disabled = true;
          sendReplyBtn.textContent = 'Đang gửi...';

          import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(({ collection, addDoc, serverTimestamp }) => {
            const user = window.auth.currentUser;
            addDoc(collection(window.db, 'movies', currentWatchingMovieSlug, 'comments'), {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
              text: text,
              parentId: parentId,
              replyTo: replyTo,
              createdAt: serverTimestamp()
            }).then(() => {
              if (form) form.remove();
            }).catch((error) => {
              console.error("Lỗi khi gửi phản hồi: ", error);
              alert("Có lỗi xảy ra, vui lòng thử lại sau!");
              sendReplyBtn.textContent = 'Gửi phản hồi';
              sendReplyBtn.disabled = false;
            });
          });
        }
      });
    }
    // Gắn cleanup vào window.closeVideoModal
    const originalCloseVideoModal = window.closeVideoModal;
    window.closeVideoModal = function() {
      if (currentCommentsUnsubscribe) {
        currentCommentsUnsubscribe();
        currentCommentsUnsubscribe = null;
      }
      currentWatchingMovieSlug = null;
      if (originalCloseVideoModal) {
        originalCloseVideoModal();
      }
    };

    // --- SUPPORT INFO MODAL LOGIC ---
    const infoModal = document.getElementById('info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalBody = document.getElementById('info-modal-body');
    const closeInfoModalBtn = document.querySelector('.close-info-modal');
    
    const infoData = {
      faq: {
        title: "Câu Hỏi Thường Gặp (FAQ)",
        content: `
          <h4>1. Phim trên MovieChill có mất phí không?</h4>
          <p>Không, toàn bộ phim trên MovieChill đều được cung cấp hoàn toàn miễn phí.</p>
          <h4>2. Làm sao để tải phim về máy?</h4>
          <p>Hiện tại chúng tôi chỉ hỗ trợ xem trực tuyến để bảo vệ bản quyền. Tính năng tải phim sẽ được cân nhắc trong tương lai.</p>
          <h4>3. Tôi bị lỗi không xem được video?</h4>
          <p>Bạn vui lòng thử đổi server (Vietsub #1, #2) hoặc tải lại trang. Nếu vẫn không được, hãy liên hệ với chúng tôi.</p>
        `
      },
      terms: {
        title: "Điều Khoản Dịch Vụ",
        content: `
          <p>Chào mừng bạn đến với MovieChill. Khi sử dụng trang web này, bạn đồng ý với các điều khoản sau:</p>
          <ul>
            <li><strong>Mục đích sử dụng:</strong> Trang web chỉ dành cho mục đích giải trí cá nhân, phi thương mại.</li>
            <li><strong>Bản quyền:</strong> Chúng tôi không lưu trữ bất kỳ tệp video nào trên máy chủ của mình. Mọi nội dung đều được liên kết từ bên thứ ba.</li>
            <li><strong>Trách nhiệm:</strong> Người dùng tự chịu trách nhiệm về các bình luận và tương tác của mình trên nền tảng.</li>
          </ul>
        `
      },
      privacy: {
        title: "Chính Sách Bảo Mật",
        content: `
          <p>Chúng tôi luôn tôn trọng quyền riêng tư của bạn. Dưới đây là cách chúng tôi xử lý dữ liệu:</p>
          <ul>
            <li><strong>Thu thập dữ liệu:</strong> Chúng tôi chỉ lưu trữ các thông tin cơ bản (Tên, Email, Avatar) khi bạn đăng nhập qua Google/Facebook để hỗ trợ tính năng bình luận.</li>
            <li><strong>Cookies:</strong> Hệ thống sử dụng cookies và localStorage để lưu trữ trạng thái đăng nhập và phim bạn đang xem dở.</li>
            <li><strong>Cam kết:</strong> Chúng tôi tuyệt đối không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba.</li>
          </ul>
        `
      },
      contact: {
        title: "Liên Hệ Với Chúng Tôi",
        content: `
          <p>Nếu bạn có bất kỳ câu hỏi, góp ý hay báo cáo lỗi, vui lòng liên hệ qua các kênh sau:</p>
          <ul>
            <li><strong>Email:</strong> support@moviechill.vn</li>
            <li><strong>Facebook:</strong> fb.com/moviechill.official</li>
            <li><strong>Hotline:</strong> 1900 1234 (Giờ hành chính)</li>
          </ul>
          <p><em>Chúng tôi sẽ cố gắng phản hồi bạn trong vòng 24 giờ làm việc. Cảm ơn bạn đã đồng hành!</em></p>
        `
      }
    };

    document.querySelectorAll('.info-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const type = link.getAttribute('data-info');
        if (infoData[type]) {
          infoModalTitle.innerHTML = infoData[type].title;
          infoModalBody.innerHTML = infoData[type].content;
          infoModal.style.display = 'block';
        }
      });
    });

    if (closeInfoModalBtn) {
      closeInfoModalBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === infoModal) {
        infoModal.style.display = 'none';
      }
    });

});


// Xử lý sự kiện mất kết nối Internet (Offline Mode)
const offlineModal = document.getElementById('offline-modal');

window.addEventListener('offline', () => {
  if (offlineModal) {
    offlineModal.style.display = 'flex';
  }
});

window.addEventListener('online', () => {
  if (offlineModal) {
    offlineModal.style.display = 'none';
  }
});

// Xử lý sự kiện Ẩn/Hiện mật khẩu
document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('login-pw');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', function () {
      const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmPasswordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }
});
