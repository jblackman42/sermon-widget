const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const seriesId = urlParams.get('series');
const sermonContainerDOM = document.getElementById('sermon-container')
let sermon;

const loadWidget = async () => {
    const seriesList = await fetch('https://phc.events/api/widgets/sermons')
        .then(response => response.json())
        .then(data => data.sermons)
    
    console.log(seriesList)
    sermon = seriesList.filter(series => series.Sermon_Series_ID == seriesId)[0].messages.filter(message => message.Sermon_ID == id)[0]
    console.log(sermon)
    
    const videoURL = sermon.links.filter(link => link.Link_Type_ID == 1).length ? sermon.links.filter(link => link.Link_Type_ID == 1)[0].Link_URL : null;
    const audioURL = sermon.links.filter(link => link.Link_Type_ID == 2).length ? sermon.links.filter(link => link.Link_Type_ID == 2)[0].Link_URL : null;

    const sermonSeries = seriesList.filter(series => series.Sermon_Series_ID == seriesId)[0].messages.filter(message => message.Sermon_ID != id);

    sermonContainerDOM.innerHTML = `
        <div id="video-container">
            <video id="video" controls></video>
            <p id="video-error">Video Unavailable</p>
        </div>
        <div id="widget-card-container">
            <h1>${sermon.Title}</h1>
            <p>${sermon.Speaker}</p>
            <p>${new Date(sermon.Sermon_Date).toLocaleDateString()}</p>
            <button id="shareBtn" onclick="share('Share Sermon')">Share <i class='fas fa-share-square'></i></button>
            ${audioURL ? `<a href="${audioURL}">Audio Download </a>` : ''}
            <div id="other-sermons">
                ${sermonSeries.map(message => {
                    return `
                        <a href="/sermon.html?series=${seriesId}&id=${message.Sermon_ID}">
                            <img src="${message.Sermon_Image}" alt="${message.Title}" />
                            <div class="sermon-image-overlay">
                                <h1>${message.Title}</h1>
                                <p>${message.Speaker}</p>
                                <p>${new Date(message.Sermon_Date).toLocaleDateString()}</p>
                            </div>
                        </a>
                    `
                }).join('')}
            </div>
        </div>
    `
    
    if (Hls.isSupported() && videoURL) {
        var video = document.getElementById("video");
        var hls = new Hls();
        hls.loadSource(videoURL);
        hls.attachMedia(video);
        // hls.on(Hls.Events.MANIFEST_PARSED, function () {
        //     video.play();          
        // });
    } else {
        const errorDOM = document.getElementById('video-error');
        errorDOM.style.visibility = 'visible';
        errorDOM.style.display = 'block';
    }
}
loadWidget();

const share = (title) => {

    // Fallback, Tries to use API only
    // if navigator.share function is
    // available
    if (navigator.share) {
        navigator.share({

            // Title that occurs over
            // web share dialog
            title: title ? title : 'Share',

            // URL to share
            url: window.location.href
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(err => {

            // Handle errors, if occured
            console.log(
            "Error while using Web share API:");
            console.log(err);
        });
    } else {

        // Alerts user if API not available 
        alert("Browser doesn't support this API!");
    }
}