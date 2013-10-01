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

    // Load module for episodeRow
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

        // get the new episodes
        Ti.API.debug('getting the new episodes');
        newEpisodes = episodesFeed.getNewEpisodes(latestUpdate);

        Ti.API.debug(newEpisodes.length + ' new episodes to save');

        // Save new episodes to database
        for(var i = 0, j = newEpisodes.length; i < j; i++){
            // newEpisodes is an array with DOMElements
            var itemNode = newEpisodes[i];

            // Feed.getEpisodeDetails returns an objects
            var episode = episodesFeed.getEpisodeDetails(itemNode);

            Ti.API.debug(episode.title);

            episodes.saveEpisode(episode);
        }

        // Remember to close the DB
        episodes.close();

        Ti.App.fireEvent('episodesDbUpdated');
    });

    // When database is updated, refresh the episodesTable 
    Ti.App.addEventListener('episodesDbUpdated', addNewEpisodesToTable);

    // Method to add episodes to table
    function addEpisodesToTable(){

        Ti.API.info('Adding all episodes in DB to table');

        // Fetch episodes from db
        var episodes = new EpisodesDb();
        var episodesList = episodes.getEpisodesList();
        episodes.close();

        // Add episodes to table
        for(var i = 0, j = episodesList.length; i < j; i++){
            var episode = episodesList[i];
            var episodeRow = new EpisodeRow(episode);
            table.appendRow(episodeRow);
        };
    };

    function addNewEpisodesToTable(){

        Ti.API.info('Reloading episodes table');

        // Fetch episodes from db
        var episodes = new EpisodesDb();

        // Db.getEpisodesList returns an array with objects
        newEpisodesList = episodes.getNewEpisodesList(12387645);
        episodes.close();

        Ti.API.debug(episodesList.length + ' episodes in list');

        // Add each episode to tableView
        var episodes = episodesList.length;

        // Add episodes
        for(var i = 0, j = episodes; i < j; i++){
            var episode = episodesList[i];

            var episodeRow = new EpisodeRow(episode);

            // when inserting first row, make sure there
            // is at least one row, otherwise, create first row
            if(table.sections.length < 1){
                table.appendRow(episodeRow);
            } else {
                table.insertRowBefore(0,episodeRow);
            };
        };
    }

    // add behavior
    table.addEventListener('click', function(e) {
        self.fireEvent('itemSelected', {
            title: e.rowData.episodeTitle,
        episodeId: e.rowData.episodeId
        });
    });

    // Load all episode when opening app, to skip waiting for network
    addEpisodesToTable();

    return self;
};

module.exports = MasterView;
