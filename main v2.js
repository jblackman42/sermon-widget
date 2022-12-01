const urlParams = new URLSearchParams(window.location.search);

class Series extends HTMLElement {
    constructor () {
        super();
        this.seriesList = [];
        this.page = 0;


        Promise.resolve(fetch('https://phc.events/api/widgets/sermons'))
            .then(response => response.json())
            .then(data => {
                this.seriesList = data.sermons;

                this.update();
            })


    }
    update = () => {
        const tempSeriesList = [...this.seriesList];
        const seriesView = tempSeriesList.splice(12 * this.page, 12);
    
        this.innerHTML = '';
        
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'widget-container';
        const seriesCardContainer = document.createElement('div')
        seriesCardContainer.id = 'series-card-container'
        for (let i = 0; i < seriesView.length; i ++) {
            let currentId = seriesView[i].Sermon_Series_ID;

            const seriesDOM = document.createElement('div');
                seriesDOM.classList.add('series');
                const seriesImageContainerDOM = document.createElement('a');
                seriesImageContainerDOM.classList.add('series-image-container');
                seriesImageContainerDOM.href = `${this.getAttribute('targeturl')}?id=${seriesView[i].Sermon_Series_ID}`;
            const seriesImageDOM = document.createElement('img');
                seriesImageDOM.src = seriesView[i].Series_Image;
                seriesImageDOM.alt = seriesView[i].Title;
            const seriesTitleDOM = document.createElement('a');
                seriesTitleDOM.innerText = 'View More';
                seriesTitleDOM.href = `${this.getAttribute('targeturl')}?id=${seriesView[i].Sermon_Series_ID}`;
            const seriesBanner = document.createElement('div');
                seriesBanner.classList.add('series-banner');
            const bannerLabel = document.createElement('p');
                bannerLabel.innerText = 'Current Series';
                seriesBanner.appendChild(bannerLabel);
            const watchNowBtn = document.createElement('button');
                watchNowBtn.onclick = this.watchLatest;
                watchNowBtn.innerText = 'Watch Latest Sermon'
                seriesBanner.appendChild(watchNowBtn);
    
            seriesImageContainerDOM.appendChild(seriesImageDOM);
            if (this.seriesList[0].Sermon_Series_ID == currentId) seriesDOM.appendChild(seriesBanner)
            seriesDOM.appendChild(seriesImageContainerDOM);
            seriesDOM.appendChild(seriesTitleDOM);
            seriesCardContainer.appendChild(seriesDOM);
            widgetContainer.appendChild(seriesCardContainer);
        }
        const buttonContainer = document.createElement('div');
            buttonContainer.id = 'series-btn-container';
        const prevPageBtnDOM = document.createElement('button');
            prevPageBtnDOM.onclick = this.prevPage;
            prevPageBtnDOM.innerText = 'Previous Page';
            prevPageBtnDOM.id = 'prev-btn';
        const nextPageBtnDOM = document.createElement('button');
            nextPageBtnDOM.onclick = this.nextPage;
            nextPageBtnDOM.innerText = 'Next Page';
            nextPageBtnDOM.id = 'next-btn';
        
        buttonContainer.appendChild(prevPageBtnDOM);
        buttonContainer.appendChild(nextPageBtnDOM);
        widgetContainer.appendChild(buttonContainer);

        this.appendChild(widgetContainer)
    }
    nextPage = () => {
        const maxPages = Math.floor(this.seriesList.length / 12);
        if (this.page >= maxPages) return;
    
        this.page ++;
        this.update();
    }
    prevPage = () => {
        if (this.page <= 0) return;
    
        this.page --;
        this.update();
    }
    watchLatest = () => {
        console.log('watch latest')
        const series = this.seriesList[0];
        // const sermon = series.messages[series.messages.length - 1];
        const sermon = series.messages.filter(message => message.links.filter(link => link.Link_Type_ID == 1).length).pop();
    
        window.location = `${this.getAttribute('watchurl')}?series=${series.Sermon_Series_ID}&id=${sermon.Sermon_ID}`
    }
}

class SeriesDetails extends HTMLElement {
    constructor () {
        super();


        Promise.resolve(fetch('https://phc.events/api/widgets/sermons'))
            .then(response => response.json())
            .then(data => {
                this.seriesList = data.sermons;

                this.update();
            })


    }
    update = () => {
        this.id = urlParams.get('id');
        if (!urlParams.get('id')) return;

        const seriesIds = this.seriesList.map(series => series.Sermon_Series_ID);
        const maxId = Math.max(...seriesIds)
        const minId = Math.min(...seriesIds)
        let series = this.seriesList.filter(series => series.Sermon_Series_ID == this.id)[0]
    
        const firstDay = new Date(series.messages[0].Sermon_Date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
        const lastDay = new Date(series.messages[series.messages.length - 1].Sermon_Date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
        
        const widgetCardContainer = document.createElement('div');
        widgetCardContainer.id = 'widget-card-container';

        const backButtonContainer = document.createElement('div');
            backButtonContainer.id = 'back-btn-container';
        const backButtonLink = document.createElement('a');
            backButtonLink.href = this.getAttribute('returnurl');
            backButtonLink.classList.add('back-btn');
            backButtonLink.innerHTML = "<i class='fas fa-arrow-left'></i> Back to Series Finder"
            backButtonContainer.appendChild(backButtonLink);
            this.appendChild(backButtonContainer)
    
        const widgetCardHTML = `
        <div id="series-head-row">
            <a ${series.Sermon_Series_ID == maxId ? 'style="opacity: 0; cursor: default;"' : `href="${this.getAttribute('currenturl')}?id=${seriesIds[seriesIds.indexOf(parseInt(this.id)) - 1]}"`}><i class='fas fa-arrow-left'></i> next series</a>
            <h1 id="series-title">${series.Title}</h1>
            <a ${series.Sermon_Series_ID == minId ? 'style="opacity: 0; cursor: default;"' : `href="${this.getAttribute('currenturl')}?id=${seriesIds[seriesIds.indexOf(parseInt(this.id)) + 1]}"`}>prevous series <i class='fas fa-arrow-right'></i></a>
        </div>
        <div id="series-row">
            <div id="sermon-image-container">
                <img src="${series.Series_Image}" alt="${series.Title}"/>
                <div id="series-info-row">
                    <p><strong>${series.Sermon_Series_ID == maxId ? 'Current Series' : `${series.messages.length} week series`}</strong></p>
                    <p>${firstDay}${firstDay != lastDay ? ` - ${lastDay}` : ''}</p>
                    <button id="shareBtn" onclick="share('Share Series', 'Check out this series from Pure Heart Church!')">Share</button>
                </div>
            </div>
            <div id="sermon-content">
                ${series.messages.map(message => {
                    const date = new Date(message.Sermon_Date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
                    return `
                    <a class="messages" href="${this.getAttribute('targeturl')}?series=${this.id}&id=${message.Sermon_ID}">
                        <img src="${message.Sermon_Image ? message.Sermon_Image : series.Series_Image}" alt="${message.Title}"/>
                        <div class="sermon-info">
                            <p class="sermon-title">${message.Title}</p>
                            <p>${date} | ${message.Speaker}</p>
                        </div>
                    </a>
                    `
                }).join('')}
            </div>
        </div>
        
        `
        widgetCardContainer.innerHTML = widgetCardHTML;
        this.appendChild(widgetCardContainer)
    }
}

class SermonDetails extends HTMLElement {
    constructor () {
        super();


        Promise.resolve(fetch('https://phc.events/api/widgets/sermons'))
            .then(response => response.json())
            .then(data => {
                this.seriesList = data.sermons;

                this.update();
            })


    }
    update = () => {
            this.id = urlParams.get('id');
            this.seriesId = urlParams.get('series');

            if (!urlParams.get('id') || !urlParams.get('series')) return;

            this.sermon = this.seriesList.filter(series => series.Sermon_Series_ID == this.seriesId)[0].messages.filter(message => message.Sermon_ID == this.id)[0]
            const currSeries = this.seriesList.filter(series => series.Sermon_Series_ID == this.seriesId)[0]
            const videoURL = this.sermon.links.filter(link => link.Link_Type_ID == 1).length ? this.sermon.links.filter(link => link.Link_Type_ID == 1)[0].Link_URL : null;
            const audioURL = this.sermon.links.filter(link => link.Link_Type_ID == 2).length ? this.sermon.links.filter(link => link.Link_Type_ID == 2)[0].Link_URL : null;
        
            const sermonSeries = this.seriesList.filter(series => series.Sermon_Series_ID == this.seriesId)[0].messages.filter(message => message.Sermon_ID != this.id);
        
            const mobile = this.mobileCheck();
            
            const sermonContainerDOM = document.createElement('div')
        
            sermonContainerDOM.innerHTML = `
                <div id="video-container">
                    <p class="video-error"></p>
                    <video id="${this.getFileExtension(videoURL) == 'm3u8' ? 'video' : ''}" class="video-js vjs-default-skin" controls>
                        <source src="${videoURL}">
                    </video>
                </div>
                <div id="back-btn-container">
                    <a href="${this.getAttribute('returnurl')}?id=${this.seriesId}" class="back-btn"><i class='fas fa-arrow-left'></i> Back to series</a>
                </div>
                <div id="video-card-container">
                    <div class="row">
                        <div class="col">
                            <h1>${this.sermon.Title}</h1>
                            <p>${this.sermon.Speaker}</p>
                            <p>${new Date(this.sermon.Sermon_Date).toLocaleDateString()}</p>
                        </div>
                        <div class="col">
                            <button id="shareBtn" class="btn" onclick="share('Share Series', 'Check out this sermon from Pure Heart Church!')">Share</button>
                            ${audioURL ? `<a href="${audioURL}" target="_blank" class="btn">Listen</a>` : ''}
                        </div>
                    </div>
                    ${sermonSeries.length ? `<h3>Other Sermons From This Series:</h3>
                    <div class="row">
                        <div id="other-sermons">
                            ${sermonSeries.map(message => {
                                return `
                                    <a href="${this.getAttribute('currenturl')}?series=${this.seriesId}&id=${message.Sermon_ID}">
                                        <img src="${message.Sermon_Image ? message.Sermon_Image : currSeries.Series_Image}" alt="${message.Title}" />
                                        <div class="sermon-image-overlay">
                                            <h1>${message.Title}</h1>
                                            <p>${message.Speaker}</p>
                                            <p>${new Date(message.Sermon_Date).toLocaleDateString()}</p>
                                        </div>
                                    </a>
                                `
                            }).join('')}
                        </div>
                    </div>` : ''}
                </div>
            `
            this.appendChild(sermonContainerDOM)
            
            if (Hls.isSupported() && videoURL && !mobile) {
                var video = document.getElementById("video");
                var hls = new Hls();
                hls.loadSource(videoURL);
                hls.attachMedia(video);
            } else if (!mobile && videoURL) {
                var video = document.getElementById("video");
                video.style.backgroundImage = `url('${this.sermon.Sermon_Image}')`
                video.style.filter = 'brightness(.25)';
                var videoError = document.querySelector('.video-error');
                videoError.innerText = 'Playback error: Please try again later.'
                videoError.style.visibility = 'visible';
                videoError.style.display = 'block';
            } else if (!videoURL) {
                var videoError = document.querySelector('.video-error');
                videoError.innerText = 'Video Not Yet Available. Try Again Later'
                videoError.style.visibility = 'visible';
                videoError.style.display = 'block';
            }
    }
    mobileCheck = () => {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };
    
    
    getFileExtension = (filename) => {
        return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
    }
}

const share = (title, text) => {
    if (navigator.share) {
        navigator.share({
        title: title,
        text: text,
        url: window.location,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
        window.location = `mailto:?subject=${title}&body=${text}: ${window.location}`
    }
}

customElements.define('series-finder', Series)
customElements.define('series-details', SeriesDetails)
customElements.define('sermon-details', SermonDetails)