/**
         * 1. Render songs
         * 2. Scroll top
         * 3. Play/pause/seek
         * 4. CD rotate
         * 5. Next / previous
         * 6. Random
         * 7. Next / repeat when ended
         * 8. Active song
         * 9. Scroll active song into view
         * 10. Play song when click
        */
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'PLAYER'

const heading = $('header h2') 
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volumnSlider = $('.volumn-slider')
const volumnMute = $('.volumn-mute')
const volumnSmall = $('.volumn-small')
const volumnLarge = $('.volumn-large')
const iconVolumn = $$('.vol')

const app = {
     currentIndex: 0,
     isPlaying: false,
     isRandom: false,
     isRepeat: false,
     volumnCurrent: 0,
     isMute: false,
     config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
     setConfig: function(key, value) {
         this.config[key] = value
         localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
     },
     songs: [
         {
             name: 'Shadow Of The Sun',
             singer: 'Max Elto',
             path: './assets/music/Shadow Of The Sun.mp4',
             image: './assets/img/image1.webp'
         },
         {
             name: 'My Stupid Heart',
             singer: 'Walk Off The Earth',
             path: './assets/music/My Stupid Heart.mp4',
             image: './assets/img/image2.webp'                    
         },
         {
             name: 'A Sky Full Of Star',
             singer: 'Miia',
             path: './assets/music/A sky full of star.mp4',
             image: './assets/img/image3.webp'
         },
         {
             name: 'Golden Hour',
             singer: 'JVKE',
             path: './assets/music/Sunset lover.mp4',
             image: './assets/img/image4.webp'
         },
         {
             name: 'At My Worst',
             singer: 'Sympton X Collective',
             path: './assets/music/Nơi đâu cũng thấy em.mp4',
             image: './assets/img/image5.webp'
         },
         {
             name: 'As It Was',
             singer: 'PREP',
             path: './assets/music/as it was.mp4',
             image: './assets/img/image6.webp'
         },
         {
             name: 'Love Is Gone',
             singer: 'Dansyyfi, Julia',
             path: './assets/music/Somewhere in time.mp4',
             image: './assets/img/image7.webp'
         },
         {
             name: 'Scars To Your Beautiful',
             singer: 'Alolyssa',
             path: './assets/music/Is it just me.mp4',
             image: './assets/img/image8.webp'
         }
     ],

     render: function(){
         const htmls = this.songs.map((song, index) => {
             return `
                 <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                     <div class="thumb" style="background-image: url('${song.image}')">
                     </div>
                     <div class="body">
                         <h3 class="title">${song.name}</h3>
                         <p class="author">${song.singer}</p>
                     </div>
                     <div class="option">
                         <i class="fas fa-ellipsis-h"></i>
                     </div>
                 </div>
             `
         })
         playlist.innerHTML = htmls.join('')
     },
     defineProperties: function(){
         Object.defineProperty(this, 'currentSong', {
             get: function(){
                 return this.songs[this.currentIndex]
             }
         })
     },

     handleEvents: function(){
         const cd = $('.cd')
         const cdWidth = cd.offsetWidth
         //Xử lí CD quay và dừng
         cdAnimate = cdThumb.animate([
             {transform: 'rotate(360deg)'} 
         ],
             {
                 duration: 10000, //10s
                 iterations: Infinity
             }
         )
         cdAnimate.pause()
         //Xử lí kéo lên xuống
         document.onscroll = function(){
             const scrollTop = window.scrollY || document.documentElement.scrollTop
             const newCdWidth = cdWidth - scrollTop
             cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
             cd.style.opacity = newCdWidth / cdWidth
         }
         //Xử lí khi click play
         playBtn.onclick = () => {
             if(this.isPlaying) {
                 audio.pause()
             }
             else {
                 audio.play()
             }
         }
         //Xử lí khi song được play
         audio.onplay = () => {
             this.isPlaying = true
             player.classList.add('playing')
             cdAnimate.play()
         }
         //Xử lí khi song bị pause
         audio.onpause = () => {
             this.isPlaying = false
             player.classList.remove('playing')
             cdAnimate.pause()
         }

         //Khi tiến độ bài hát thay đổi
         audio.ontimeupdate = () => {
             if(audio.duration) {
                 const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                 progress.value = progressPercent
             }
         }
         //Xử lí khi tua song
         progress.oninput = (e) => {
             const seekTime = e.target.value * audio.duration / 100
             audio.currentTime = seekTime
         }
         //Xử lí khi next song
         nextBtn.onclick = () => {
             if(this.isRandom){
                 this.playRandom()
             }
             else{
                 this.nextSong()
             }
             audio.play()
             this.render()
             this.scrollToActiveSong()
         }
         //Xử lí khi prev song
         prevBtn.onclick = () => {
             if(this.isRandom){
                 this.playRandom()
             }
             else{
                 this.prevSong()
             }
             audio.play()
             this.render()
             this.scrollToActiveSong()
         }
         //Xử lí bật/tắt random
         randomBtn.onclick = () => {
             this.isRandom = !this.isRandom
             this.setConfig('isRandom', this.isRandom)
             randomBtn.classList.toggle('active', this.isRandom)
         }
         //Xử lí lặp lại song
         repeatBtn.onclick = () => {
             this.isRepeat = !this.isRepeat
             this.setConfig('isRepeat', this.isRepeat)
             repeatBtn.classList.toggle('active', this.isRepeat)
         }
         //Xử lí khi tăng giảm âm lượng
         volumnSlider.oninput = (e) => {
             this.volumnCurrent = e.target.value
             // this.setConfig('volumnValue', Number(this.volumnCurrent))
             audio.volume = this.volumnCurrent / 100
             this.handleVolumn(this.volumnCurrent)
         }
         //Xử lí khi nhấn vào icon volumn để đổi chế độ bật tắt âm
         iconVolumn.forEach((item) => {
             item.onclick = (e) => {
                 this.handleIconVolumn(e.target)
             }
         })
         //Xử lí khi end song thì next song
         audio.onended = () => {
             if(this.isRepeat) {
                 audio.play()
             }
             else {
                 nextBtn.click()
             }
         }
         //Xử lí khi click vào playlist
         playlist.onclick = (e) => {
             const songNode = e.target.closest('.song:not(.active)')
             if(songNode || e.target.closest('.option')){
                 if(songNode) {
                     // this.currentIndex = songNode.getAttribute('data-index')
                     this.currentIndex = Number(songNode.dataset.index)
                     this.loadCurrentSong()
                     this.render()
                     audio.play()
                 }

                 //Xử lí khi click vào option
                 if(e.target.closest('.option')) {

                 }
             }
         }
     },
     scrollToActiveSong: function() {
         setTimeout( () => {
             $('.song.active').scrollIntoView({
                 behavior: 'smooth',
                 block: 'end'
             })
         }, 300)
     },
     
     loadCurrentSong: function() {
         heading.textContent = this.currentSong.name
         cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
         audio.src = this.currentSong.path
        //  this.setConfig('currentIndex', this.currentIndex)
     },
     loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        // this.currentIndex = this.config.currentIndex
        // this.volumnCurrent = this.config.volumnCurrent
        // console.log(this.volumnCurrent)
        // volumnSlider.value = this.config.volumnCurrent
        // this.handleVolumn(this.config.volumnCurrent)
        // Object.assign(this, this.config)
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    },
     nextSong: function () {
         this.currentIndex++
         if(this.currentIndex >= this.songs.length){
             this.currentIndex = 0
         }
         this.loadCurrentSong()
     },
     prevSong: function() {
         this.currentIndex--
         if(this.currentIndex < 0){
             this.currentIndex = this.songs.length - 1
         }
         this.loadCurrentSong()
     },
     playRandom: function() {
         let newIndex
         do {
             newIndex = Math.floor(Math.random() * this.songs.length)
         } while (newIndex === this.currentIndex)
         this.currentIndex = newIndex
         this.loadCurrentSong()
     },
     handleVolumn: function(volumnCurrent) {
         volumnCurrent = Number(volumnCurrent)
         switch(true) {
             case (volumnCurrent == 0):
                 console.log('0')
                 document.querySelector('.vol.active').classList.remove('active')
                 volumnMute.classList.add('active');
                 break;
             case ((volumnCurrent >= 1) && (volumnCurrent <= 30)):
                 console.log('25')
                 document.querySelector('.vol.active').classList.remove('active')
                 volumnSmall.classList.add('active');
                 break;
             case ((volumnCurrent >= 31) && (volumnCurrent <=70)):
                 console.log('50')
                 document.querySelector('.vol.active').classList.remove('active')
                 volumnSmall.classList.add('active');
                 break;
             case ((volumnCurrent >= 71) && (volumnCurrent <= 100)):
                 console.log('100')
                 document.querySelector('.vol.active').classList.remove('active')
                 volumnLarge.classList.add('active');
                 break;
         }
     },
     handleIconVolumn: function(icon) {
         this.isMute = !this.isMute
         if(this.isMute) {
             icon.classList.remove('active')
             volumnMute.classList.add('active')
             audio.muted = true;
         }
         else {
             // this.volumnCurrent = Number(this.config.volumnCurrent)
             // console.log(this.volumnCurrent)
             this.handleVolumn(this.volumnCurrent)
             audio.muted = false
         }
     },
     start: function(){
         //Gán cấu hình từ config vào ứng dụng player
         this.loadConfig

         //Định nghĩa các thuộc tính Object
         this.defineProperties()

         //Lắng nghe xử lí các sự kiện
         this.handleEvents()

         //Tải thông tin bài hát đầu tiên khi chạy ứng dụng
         this.loadCurrentSong()

         //Render playlist
         this.render()
         
         
     }
}

app.start()