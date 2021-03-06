//Master View Component Constructor
function MasterView() {

    //create object instance, parasitic subclass of Observable
    var self = Ti.UI.createView({
        backgroundColor:'white'
    });

    // load Feed module
    var Feed = require('Services/feed');
    var episodesFeed = new Feed();

    // Load database module
    var EpisodesDb = require('Services/db');

    // Load episodeRow module
    var EpisodeRow = require('ui/common/episodeRow');

    // Create container for episodes
    var episodesList = [];

    // Create tableView for episodes
    var table = Ti.UI.createTableView({});
    self.add(table);

    // Update Feeds
    Ti.API.info('Fetching remote feed');
    episodesFeed.fetchRemoteFeed();

    Ti.App.addEventListener('fetchRemoteFeedFinished', function(e){

        // Get the date of the newest stored episode
        var episodes = new EpisodesDb();
        var latestUpdate = episodes.getLatestUpdate();

        // Make sure we have a latest episode
        if( null === latestUpdate ){
            Ti.API.error('latestUpdate is null!');
        }

        // get the new episodes
        Ti.API.info('Getting new episodes fom Feed');
        newEpisodes = episodesFeed.getNewEpisodes(latestUpdate);

        // Save new episodes to database
        for(var i = 0, j = newEpisodes.length; i < j; i++){
            // newEpisodes is an array with DOMElements
            var itemNode = newEpisodes[i];

            // Feed.getEpisodeDetails returns an objects
            var episode = episodesFeed.getEpisodeDetails(itemNode);

            episodes.saveEpisode(episode);
        }

        // Remember to close the DB
        episodes.close();

        Ti.App.fireEvent('episodesDbUpdated');
    });

    // When database is updated, refresh the episodesTable 
    Ti.App.addEventListener('episodesDbUpdated', addNewEpisodesToTable);

    // Method to add episodes to table
    function addAllEpisodesToTable(){

        Ti.API.info('Adding all episodes in DB to table');

        // Fetch episodes from db
        var episodes = new EpisodesDb();
        var episodesList = episodes.getEpisodesList();
        episodes.close();

        // Break if there are no episodes to load
        if( episodesList.length < 1 ){
            Ti.API.debug('No episodes in list, returning');
            return;
        }

        // Define newestEpisodeTimestamp, if no pubDate, set to 0
        var firstEpisode = episodesList[0];
        self.newestEpisodeTimestamp = firstEpisode.pubDate;

        Ti.API.debug('firstEpisode: ' + firstEpisode.title);

        // Add episodes to table
        for(var i = 0, j = episodesList.length; i < j; i++){

            var episode = episodesList[i];
            var episodeRow = new EpisodeRow(episode);
            table.appendRow(episodeRow);

        }
    }

    function addNewEpisodesToTable(){

        Ti.API.info('[MasterView.js:96] Adding new episodes to table');

        // Db.getNewEpisodesList needs a timestamp to 
        // determine which are the new episodes.
        // If we have a value in masterView.newestEpisodeTimestamp
        // we have a useful time, otherwise set to 0 and load all episodes as new.
        var newerThen;
        if( self.newestEpisodeTimestamp == undefined ){
            newerThen = 0;
            //Ti.API.debug('[MasterView.js:105] No newestEpisodeTimeStamp');
        } else {
            newerThen = self.newestEpisodeTimestamp;
        }

        // Fetch new episodes from db
        // Db.getEpisodesList returns an array with objects
        var episodesDb = new EpisodesDb();
        var newEpisodesList = episodesDb.getNewEpisodesList(newerThen);
        episodesDb.close();

        // Add each episode to tableView
        var newEpisodeCount = newEpisodesList.length;

        Ti.API.debug('MasterView.js:120 | ' +
                newEpisodeCount +
                ' episodes to add to tableView');

        // Add episodes
        for(var i = 0, j = newEpisodeCount; i < j; i++){
            var episode = newEpisodesList[i];

            var episodeRow = new EpisodeRow(episode);

            // We can only insertBefore when there is episodes in list,
            // so if list is empty, use appendRow with the first episode.
            if(table.sections.length < 1){
                table.appendRow(episodeRow);
            } else {
                table.insertRowBefore(0,episodeRow);
            }
        }
    }

    // add behavior to open episodView
    table.addEventListener('click', function(e) {
        self.fireEvent('itemSelected', {
            title: e.rowData.episodeTitle,
            //subtitle: e.rowData.episodeSubtitle,
            episodeId: e.rowData.episodeId
        });
    });

    // Load all episode when opening app, to skip waiting for network
    addAllEpisodesToTable();

    return self;
}

module.exports = MasterView;
