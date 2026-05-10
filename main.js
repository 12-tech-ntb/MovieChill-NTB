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
    movies.forEach(movie => {
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
                <button class="btn btn-icon"><i class="fa-regular fa-heart"></i>Like</button>
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

      if (movie.episodes && movie.episodes.length > 0 && movie.episodes[0].server_data && movie.episodes[0].server_data.length > 0) {
        const episodes = movie.episodes[0].server_data;
        
        // Mặc định phát tập đầu tiên
        if(videoIframe) videoIframe.src = episodes[0].link_embed;

        // Render danh sách tập
        if(episodeList) {
          episodes.forEach((ep, index) => {
            const btn = document.createElement('button');
            btn.className = 'ep-btn';
            if (index === 0) btn.classList.add('active'); // Mặc định tập 1 được chọn
            
            // Xử lý tên tập phim (nếu là "Full" thì giữ nguyên, nếu là số thì thêm chữ "Tập")
            let epName = ep.name;
            if(!isNaN(epName) && epName !== '') {
              epName = 'Tập ' + epName;
            }
            btn.textContent = epName;

            btn.addEventListener('click', () => {
               // Xóa class active của các nút khác
               document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
               // Đổi màu nút được click
               btn.classList.add('active');
               // Đổi link video
               if(videoIframe) videoIframe.src = ep.link_embed;
               // Cập nhật tiêu đề video
               if(videoTitle) videoTitle.textContent = movie.name + " - " + epName;
            });
            
            episodeList.appendChild(btn);
          });
        }
      } else {
        if(videoTitle) videoTitle.textContent = "Lỗi: Không tìm thấy tập phim để phát.";
      }
    } catch (error) {
      console.error("Lỗi khi lấy link phim:", error);
      if(videoTitle) videoTitle.textContent = "Lỗi tải phim.";
    }
  }


  // Cập nhật hàm Like
  function updateLikeButtons(container) {
    const likeBtns = container.querySelectorAll('.btn-icon');
    likeBtns.forEach(btn => {
      if(btn.innerHTML.includes('fa-heart')) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const icon = this.querySelector('i');
          if (icon.classList.contains('fa-regular')) {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
            icon.style.color = '#ff4757';
            this.style.boxShadow = '0 0 5px rgba(255, 71, 87, 0.5)';
          } else {
            icon.classList.add('fa-regular');
            icon.classList.remove('fa-solid');
            icon.style.color = 'inherit';
            this.style.boxShadow = '1px 1px 1px 1px rgba(190, 190, 190, 0.678)';
          }
        });
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


  // --- XỬ LÝ MENU NAVIGATION API (Dùng Event Delegation để bao quát cả phần mới thêm) ---
  document.addEventListener('click', function(e) {
    const navItem = e.target.closest('.nav-action');
    if (navItem) {
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