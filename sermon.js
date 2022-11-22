const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const seriesId = urlParams.get('series');
let sermon;

const loadWidget = async () => {
    const seriesList = await fetch('https://phc.events/api/widgets/sermons')
        .then(response => response.json())
        .then(data => data.sermons)
    
    console.log(seriesList)
    sermon = seriesList.filter(series => series.Sermon_Series_ID == seriesId)[0].messages.filter(message => message.Sermon_ID == id)[0]
    console.log(sermon)
    
}
loadWidget();