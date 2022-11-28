const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
let series;




const loadWidget = async () => {
    const seriesList = await fetch(`https://phc.events/api/widgets/sermons`)
        .then(response => response.json())
        .then(data => data.sermons)
    
    console.log(seriesList)
    const seriesIds = seriesList.map(series => series.Sermon_Series_ID);
    console.log(seriesIds)
    const maxId = Math.max(...seriesIds)
    const minId = Math.min(...seriesIds)
    series = seriesList.filter(series => series.Sermon_Series_ID == id)[0]

    const firstDay = new Date(series.messages[0].Sermon_Date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
    const lastDay = new Date(series.messages[series.messages.length - 1].Sermon_Date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
    
    const widgetCardContainer = document.getElementById('widget-card-container');

    const widgetCardHTML = `
    <div id="series-head-row">
        <a ${series.Sermon_Series_ID == maxId ? 'style="opacity: 0; cursor: default;"' : `href="/series.html?id=${seriesIds[seriesIds.indexOf(parseInt(id)) - 1]}"`}><i class='fas fa-arrow-left'></i> next series</a>
        <h1 id="series-title">${series.Title}</h1>
        <a href="/series.html?id=${seriesIds[seriesIds.indexOf(parseInt(id)) + 1]}">prevous series <i class='fas fa-arrow-right'></i></a>
    </div>
    <div id="series-row">
        <div id="sermon-image-container">
            <img src="${series.Series_Image}" alt="${series.Title}"/>
            <div id="series-info-row">
                <p><strong>${series.Sermon_Series_ID == maxId ? 'Current Series' : `${series.messages.length} week series`}</strong></p>
                <p>${firstDay}${firstDay != lastDay ? ` - ${lastDay}` : ''}</p>
                <button id="shareBtn" onclick="share('Share Series')">Share <i class='fas fa-share-square'></i></button>
            </div>
        </div>
        <div id="sermon-content">
            ${series.messages.map(message => {
                const date = new Date(message.Sermon_Date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
                return `
                <a class="messages" href="/sermon.html?series=${id}&id=${message.Sermon_ID}">
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