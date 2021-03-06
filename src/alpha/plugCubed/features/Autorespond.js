define(['plugCubed/handlers/TriggerHandler', 'plugCubed/Lang', 'plugCubed/Settings', 'plugCubed/RSS', 'plugCubed/Utils', 'plugCubed/bridges/PlaybackModel', 'plugCubed/dialogs/Menu', 'lang/Lang'], function(TriggerHandler, p3Lang, Settings, RSS, p3Utils, PlaybackModel, Menu, Lang) {
    var handler = TriggerHandler.extend({
        trigger: 'chat',
        handler: function(data) {
            var a = data.type == 'mention' && API.hasPermission(data.fromID, API.ROLE.BOUNCER), b = data.message.indexOf('@') < 0 && (API.hasPermission(data.fromID, API.ROLE.MANAGER) || p3Utils.isPlugCubedDeveloper(data.fromID));
            if (a || b) {
                if (data.message.indexOf('!afkdisable') > -1 && (typeof RSS.rules.allowAutorespond === 'undefined' || RSS.rules.allowAutorespond !== false)) {
                    if (Settings.autorespond) {
                        Settings.autorespond = false;
                        Menu.setEnabled('autorespond', Settings.autorespond);
                        Settings.save();
                        API.sendChat(p3Lang.i18n('autorespond.commandDisable', '@' + data.un));
                    }
                }
            }
            if (data.type == 'mention') {
                if (Settings.autorespond && !Settings.recent && (typeof RSS.rules.allowAutorespond === 'undefined' || RSS.rules.allowAutorespond !== false)) {
                    Settings.recent = true;
                    $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.nextIn', p3Utils.getTimestamp(Date.now() + 18E4)));
                    setTimeout(function() {
                        $('#chat-input-field').attr('placeholder', p3Lang.i18n('autorespond.next'));
                        Settings.recent = false;
                        Settings.save();
                    }, 18E4);
                    API.sendChat('[AFK] @' + data.un + ' ' + Settings.awaymsg.split('@').join(''));
                }
            }
        },
        close: function() {
            this._super();
            if (Settings.autorespond) {
                $('#chat-input-field').removeAttr('disabled').attr('placeholder', Lang.chat.placeholder);
                API.setStatus(API.STATUS.AVAILABLE);
            }
        }
    });

    return new handler();
});