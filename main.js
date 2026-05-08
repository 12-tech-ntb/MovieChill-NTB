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
      slug: 'tro-choi-con-muc' // Tạm dùng Squid Game
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
    } catch (error) {
      console.error('Lỗi khi tải phim trang chủ:', error);
      if(list1) list1.innerHTML = '<p style="color:white; padding: 20px;">Lỗi tải dữ liệu.</p>';
      if(list2) list2.innerHTML = '<p style="color:white; padding: 20px;">Lỗi tải dữ liệu.</p>';
    }
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
            <img src="${imgUrl}" alt="${movie.name}">
            <span class="episode">${movie.episode_current || 'Full'}</span>
          </div>
          <div class="card-info">
            <h3 class="title-vn">${movie.name}</h3>
            <p class="titel-en">${movie.origin_name || ''}</p>
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
    if(videoModal) videoModal.classList.add('show');
    try {
      const response = await fetch(API_DETAIL + slug);
      const resData = await response.json();
      const responseData = resData.data || resData;
      const movie = responseData.movie || responseData.item;
      if(videoTitle) videoTitle.textContent = movie.name;

      if (movie.episodes && movie.episodes.length > 0 && movie.episodes[0].server_data && movie.episodes[0].server_data.length > 0) {
        const linkEmbed = movie.episodes[0].server_data[0].link_embed;
        if(videoIframe) videoIframe.src = linkEmbed;
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

  // Tìm kiếm
  const searchInputAPI = document.querySelector('.search');
  if (searchInputAPI) {
    searchInputAPI.addEventListener('keypress', async function (e) {
      if (e.key === 'Enter') {
        const keyword = this.value.trim();
        if(keyword !== '') {
          // Ẩn trang chủ, hiện kết quả
          if(mainHomeContent) mainHomeContent.style.display = 'none';
          if(searchResultsSection) searchResultsSection.style.display = 'block';
          if(searchKeywordSpan) searchKeywordSpan.textContent = keyword;
          if(searchMovieList) searchMovieList.innerHTML = '<p style="color:white; grid-column: 1 / -1; padding: 20px;">Đang tìm kiếm...</p>';

          try {
            const response = await fetch(API_SEARCH + encodeURIComponent(keyword));
            const data = await response.json();
            const responseData = data.data || data;
            const domainImage = responseData.APP_DOMAIN_CDN_IMAGE + '/uploads/movies/';
            const movies = responseData.items || [];

            if (movies && movies.length > 0) {
                renderMovies(movies, searchMovieList, domainImage);
            } else {
                searchMovieList.innerHTML = '<p style="color:white; grid-column: 1 / -1; padding: 20px;">Không tìm thấy phim nào phù hợp.</p>';
            }
          } catch(error) {
            console.error("Lỗi tìm kiếm:", error);
            searchMovieList.innerHTML = '<p style="color:white; grid-column: 1 / -1; padding: 20px;">Lỗi kết nối khi tìm kiếm.</p>';
          }
        } else {
          // Trở về trang chủ
          if(mainHomeContent) mainHomeContent.style.display = 'block';
          if(searchResultsSection) searchResultsSection.style.display = 'none';
        }
      }
    });
  }

  // Khởi tạo lấy dữ liệu
  fetchHomeMovies();