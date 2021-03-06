/*
 * Create the tableViewRow for the Episodes in the MasterView table
 */

function EpisodeRow(episode){

    // Create the row
    var self = Ti.UI.createTableViewRow(
        {
            className: 'episodeRow',
            backgroundColor: '#FFFFFF',
            episodeId: episode.id,
            episodeTitle: episode.title,
            episodeSubtitle: episode.subtitle,
            layout: 'vertical',
            hasChild: true
        }
    );

    // Episode Title
    var episodeTitle = Ti.UI.createLabel({
        text: episode.title,
        color: '#bbbbbb',
        textAlign: 'left',
        top: '8dp',
        left: '12dp',
        font:{
            fontFamily: 'HelveticaNeue-CondensedBold',
            fontSize: '11sp'
        }
    });
    self.add(episodeTitle);

    // Episode Subtitle
    var subtitle = Ti.UI.createLabel({
        text: episode.subtitle,
        color: '#000000',
        textAlign: 'left',
        left: '12dp',
        font: {
            fontFamily: 'HelveticaNeue-Light',
            fontSize: '16sp'
        },
        bottom: '8dp'
    });
    self.add(subtitle);

    // todo: add heard/unheard indicator
    // todo: add 

    // And return the row
    return self;
}

module.exports = EpisodeRow;
