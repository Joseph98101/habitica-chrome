/**
 * Created by balor on 16-01-15.
 */
var PomodoroTracker = (function() {
    /*
     BaseController.prototype.init = function(appBridge) {  };
     BaseController.prototype.enable = function() {  }; // private use in setOptions
     BaseController.prototype.disable = function() {  }; // private use in setOptions
     BaseController.prototype.setOptions = function(params) { };
     */

    var pomTracker = {

        url: 'https://pomodoro-tracker.com',

        urlPrefix: 'tomatoes/',
        urlPrefixCombo: 'tomatoes-combo/',

        appBridge: undefined,

        normalObj: {
            "attribute": "int",
            "alias": "tomatoes",
            "down": true,
            "up": true,
            "type": "habit",
            "text": ":tomato: (Pomodoro)",
            "priority": 1
        },
        comboObj: {
            "attribute": "int",
            "alias": "tomatoes-combo",
            "down": false,
            "up": true,
            "type": "habit",
            "text": "C-C-C-COMBO :tomato::tomato::tomato::tomato: (Pomodoro)",
            "priority": 2
        },

        init: function(appBridge) {
            this.appBridge = appBridge;

        },
/*
 * Note: The original goal of this code was to credit the main or combo pomodoro task for each pomodoro or set completed,
 *       and to debit the main pomodoro task for each pomodoro or break interrupted. I question whether most users want to
 *       be punished for skipped breaks, but without some logic to determine whether a pomdoro "stoppped" or "skipped" 
 *       was also done, it seems best to comment out the punishments until someone can add the logic, plus maybe some
 *       user options to confirm desired behavior. Therefore, I have commented out the 4 lines below. Joseph 1/24/18 
 */
        enable:function() {
            this.appBridge.addListener('pomTracker.pomodoro.done', this.pomodoroDone);
//            this.appBridge.addListener('pomTracker.pomodoro.stopped', this.pomodoroInterrupted);
//            this.appBridge.addListener('pomTracker.break.skipped', this.pomodoroInterrupted);
            pomTracker.appBridge.trigger('controller.addTask', {
                urlSuffix: pomTracker.urlPrefix,
                object: pomTracker.normalObj,
                message: 'Task Tomatoes Added'
            });
            pomTracker.appBridge.trigger('controller.addTask', {
                urlSuffix: pomTracker.urlPrefixCombo,
                object: pomTracker.comboObj,
                message: 'Task Tomatoes Combo Added'
            });
        },

        disable: function() {
            this.appBridge.removeListener('pomTracker.pomodoro.done', this.pomodoroDone);
//            this.appBridge.removeListener('pomTracker.pomodoro.stopped', this.pomodoroInterrupted);
//            this.appBridge.removeListener('pomTracker.break.skipped', this.pomodoroInterrupted);
        },

        setOptions: function(params) {

            if (params.pomTrackerIsActive) {
                if (params.pomTrackerIsActive == 'true')
                    this.enable();
                else
                    this.disable();
            }

        },

        setValue: function(params, name) {
            if (params[name]) this[name] = params[name];
        },

        pomodoroDone: function(data) {
            if(data.pomodoroCount %4 === 0) {
                pomTracker.appBridge.trigger('controller.sendRequest', {
                    urlSuffix: pomTracker.urlPrefixCombo+'score/up',
                    message: 'You made your '+((data.pomodoroCount)/4)+' C-C-C-COMBO tomato! GREAT ! You gain {score} Exp/Gold!'
                });
            } else {
                pomTracker.appBridge.trigger('controller.sendRequest', {
                    urlSuffix: pomTracker.urlPrefix+'score/up',
                    message: 'You made your '+data.pomodoroCount+' tomato! Well done {score} Exp/Gold!'
                });
            }
        },

        pomodoroInterrupted: function() {
            pomTracker.appBridge.trigger('controller.sendRequest', {
                urlSuffix: pomTracker.urlPrefix+'score/down',
                message: 'You broke the flow!! {score} HP...'
            });
        }

    };


    return {
        get: function() { return pomTracker; },
        isEnabled: function() { return pomTracker.appBridge.hasListener('pomTracker.pomodoro.done', pomTracker.pomodoroDone); },
        init: function(appBridge) { pomTracker.init(appBridge); },
        setOptions: function(params) { pomTracker.setOptions(params); }
    };

})();
