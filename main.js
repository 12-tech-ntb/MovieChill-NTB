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
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, deleteDoc, getDoc, collection, query, orderBy, getDocs, serverTimestamp 
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
  const heroMoviesData = [
    {
      img: './ig/a1.jpg',
      title: 'Can This Love Be Translated ?',
      sub: 'MovieChill',
      rating: '⭐9.9', years: '2026', quality: '4K', episode: 'Full',
      types: ['Tình Cảm', 'Ngôn Tình', 'Chill'],
      desc: 'Đi khắp thế giới để quay chương trình truyền hình, cảm xúc của một người nổi tiếng và phiên dịch viên của cô lại chẳng thể nào thông dịch.',
      slug: 'tieng-yeu-nay-anh-dich-duoc-khong' // Link chuẩn từ API OPhim
    },
    {
      img: './ig/Homtown.jpg',
      title: 'Điệu Cha Cha Cha Làng Biển',
      sub: 'Hometown Cha-Cha-Cha',
      rating: '⭐9.5', years: '2021', quality: 'FHD', episode: 'Tập 16',
      types: ['Hài Hước', 'Lãng Mạn', 'Đời Thường'],
      desc: 'Một nha sĩ từ thành phố chuyển đến một ngôi làng ven biển và mở phòng khám, tại đây cô gặp gỡ một chàng trai kỳ lạ luôn nhiệt tình giúp đỡ mọi người.',
      slug: 'dieu-cha-cha-cha-lang-bien'
    },
    {
      img: './ig/Taxi3.jpg',
      title: 'Tài Xế Taxi 3',
      sub: 'Taxi Driver 3',
      rating: '⭐9.8', years: '2025', quality: '4K', episode: 'Trailer',
      types: ['Hành Động', 'Tội Phạm', 'Bí Ẩn'],
      desc: 'Kim Do Gi và đội ngũ Rainbow Taxi tiếp tục hành trình thực thi công lý thay cho những người yếu thế trong xã hội bằng những chuyến xe báo thù đẫm máu.',
      slug: 'an-danh' // Taxi Driver 1
    },
    {
      img: './ig/TheK2.jpg',
      title: 'Mật Danh K2',
      sub: 'The K2',
      rating: '⭐9.2', years: '2016', quality: 'FHD', episode: 'Full',
      types: ['Hành Động', 'Chính Trị', 'Kịch Tính'],
      desc: 'Một cựu lính đánh thuê được thuê làm vệ sĩ cho vợ của một ứng cử viên tổng thống, vô tình vướng vào những âm mưu chính trị và tình yêu phức tạp.',
      slug: 'mat-danh-k2'
    },
    {
      img: './ig/a5.jpg',
      title: 'Trò Chơi Thao Túng',
      sub: 'The Manipulated',
      rating: '⭐9.4', years: '2025', quality: '4K', episode: 'Tập 5',
      types: ['Tâm Lý', 'Kinh Dị', 'Giật Gân'],
      desc: 'Những vòng lặp tâm lý gay cấn và các bí mật kinh hoàng được vén màn trong một trò chơi sinh tử không lối thoát, nơi lòng tin là thứ xa xỉ nhất.',
      slug: 'tro-choi-thao-tung' // Link chuẩn từ API
    }
  ];

  // Lưu trữ slug của phim đang hiển thị trên Hero
  let currentHeroSlug = heroMoviesData[0].slug;

  // Các DOM element của Hero Section
  const header = document.querySelector('header');
  const heroTitle = document.querySelector('.movie-title');
  const heroSub = document.querySelector('.movie-sub');
  const heroDesc = document.querySelector('.movie-desc');
  const heroTags = document.querySelectorAll('.movie-info .badge');
  const heroTypes = document.querySelector('.movie-type');
  const thumbs = document.querySelectorAll('.thumb-item');

  // Gắn transition cho text để đổi mượt hơn
  heroTitle.style.transition = 'opacity 0.3s ease';
  heroDesc.style.transition = 'opacity 0.3s ease';

  // Xử lý Click Thumbnail
  thumbs.forEach((item, index) => {
    item.addEventListener('click', function() {
      // Đổi class active
      document.querySelector('.thumb-item.active')?.classList.remove('active');
      this.classList.add('active');

      // Cập nhật dữ liệu từ mảng
      const data = heroMoviesData[index];
      currentHeroSlug = data.slug;
      
      // Update background với gradient
      if(window.innerWidth > 768) {
         header.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.9) 10%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0) 100%), url('${data.img}')`;
      } else {
         header.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0.6) 60%, #242424 85%, #242424 100%), url('${data.img}')`;
      }

      // Thêm hiệu ứng mờ dần khi đổi text
      heroTitle.style.opacity = 0;
      heroDesc.style.opacity = 0;
      
      setTimeout(() => {
        heroTitle.textContent = data.title;
        heroSub.textContent = data.sub;
        heroDesc.textContent = data.desc;
        
        // Update tags
        if(heroTags.length >= 4) {
          heroTags[0].textContent = data.rating;
          heroTags[1].textContent = data.years;
          heroTags[2].textContent = data.quality;
          heroTags[3].textContent = data.episode;
        }

        // Update types
        if(heroTypes) {
          heroTypes.innerHTML = data.types.map(t => `<span class="type">${t}</span>`).join('\n              ');
        }

        heroTitle.style.opacity = 1;
        heroDesc.style.opacity = 1;
      }, 300);
    });
  });

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
  const API_HOME = 'https://ophim1.com/v1/api/home';
  const API_SEARCH = 'https://ophim1.com/v1/api/tim-kiem?keyword=';
  const API_DETAIL = 'https://ophim1.com/v1/api/phim/';

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
  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', () => {
      videoModal.classList.remove('show');
      videoIframe.src = ''; // Dừng phát video
    });
  }

  // Đóng modal khi click ra ngoài
  window.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      videoModal.classList.remove('show');
      videoIframe.src = '';
    }
  });

  // Fetch Trang Chủ
  async function fetchHomeMovies() {
    try {
      const response = await fetch(API_HOME);
      const data = await response.json();
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
        const [favRes, animeRes] = await Promise.all([
          fetch('https://ophim1.com/v1/api/danh-sach/phim-chieu-rap'),
          fetch('https://ophim1.com/v1/api/danh-sach/hoat-hinh')
        ]);
        
        const favData = await favRes.json();
        const favResponseData = favData.data || favData;
        const favDomainImage = favResponseData.APP_DOMAIN_CDN_IMAGE ? favResponseData.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/' : 'https://img.ophim.live/uploads/movies/';
        const favMovies = favResponseData.items || [];
        const rankFavorite = document.getElementById('rank-favorite');
        if(rankFavorite) renderRankingList(favMovies.slice(0, 5), rankFavorite, favDomainImage, 'favorite');

        const animeData = await animeRes.json();
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
      if(list1) list1.innerHTML = '<p style="color:white; padding: 20px;">Lỗi tải dữ liệu.</p>';
      if(list2) list2.innerHTML = '<p style="color:white; padding: 20px;">Lỗi tải dữ liệu.</p>';
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
                <button class="btn btn-icon two"><i class="fa-solid fa-circle-info"></i>Chi Tiết</button>
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
  window.playMovie = async function(slug) {
    if(videoTitle) videoTitle.textContent = "Đang tải...";
    if(episodeList) episodeList.innerHTML = ""; // Xóa danh sách tập cũ
    if(videoModal) videoModal.classList.add('show');
    // Ẩn search dropdown nếu đang mở
    hideSuggestions();

    try {
      const response = await fetch(API_DETAIL + slug);
      const resData = await response.json();
      const responseData = resData.data || resData;
      const movie = responseData.movie || responseData.item;
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
      if (videoTitle) videoTitle.textContent = movieName + " - " + epNameDef;
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
         if(videoTitle) videoTitle.textContent = movieName + " - " + epName;
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
    if (e.state) {
      if (e.state.view === 'home') {
        if(mainHomeContent) mainHomeContent.style.display = 'block';
        if(searchResultsSection) searchResultsSection.style.display = 'none';
      } else if (e.state.view === 'search') {
        loadSearchData(e.state.apiUrl, e.state.title, false);
      }
    } else {
       if(mainHomeContent) mainHomeContent.style.display = 'block';
       if(searchResultsSection) searchResultsSection.style.display = 'none';
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
      container.innerHTML = '<p style="color:white; padding-left: 40px;">Lỗi tải dữ liệu Top 10.</p>';
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
        <img src="${user.photoURL || './ig/default-avatar.png'}" class="user-avatar" alt="avatar">
        <span class="user-name">${user.displayName || 'Người dùng'}</span>
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

  // Tạm thời ngăn form submit
  const loginFormElement = document.getElementById('auth-login-form');
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Chức năng đăng nhập bằng Email đang được phát triển. Vui lòng sử dụng Google!');
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

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
        <div class="card-wrapper">
          <div class="item-info">
            <img class="bg-blur" src="${imgUrl}" alt="">
            <img class="main-img" src="${imgUrl}" alt="${movie.name}">
            ${badgeHtml}
          </div>
          <div class="card-info">
            <h3 class="title-vn">${movie.name}</h3>
            <p class="title-en">${movie.origin_name || ''}</p>
            <div class="hover">
              <div class="action-buttons">
                <button class="btn btn-play" onclick="playMovie('${movie.slug}')"><i class="fa-solid fa-play"></i>Xem Ngay</button>
                <button class="btn btn-icon like-btn" data-slug="${movie.slug}"><i class="fa-regular fa-heart"></i>Like</button>
                <button class="btn btn-icon two"><i class="fa-solid fa-circle-info"></i>Chi Tiết</button>
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
});

