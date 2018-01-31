/**
 * Created by balor on 16-01-15. 
 * Comments by Joseph Jan and Feb 2018
 */

// ready gets called as soon as page comes up
$(document).ready(function () {

    // Returns true if it is found anywhere in the window (this)
    String.prototype.contains = function (it) {
        return this.indexOf(it) != -1;
    };
    
    // Sets up App - a swiss army knife array of variables and functions
    var App = {

        isRunning: false,
        lastTimerCount: "",
        breakSkipped: function () {
            browser.sendMessage({type: "pomTracker.break.skipped"});
        },
        breakStarted: function (breakType) {
            browser.sendMessage({
                type: "pomTracker.break.started",
                breakType: breakType
            });
        },
        breakStopped: function (breakType) {
            browser.sendMessage({
                type: "pomTracker.break.stopped",
                breakType: breakType
            });
        },
        pomStarted: function (num) {
            browser.sendMessage({
                type: "pomTracker.pomodoro.started",
                pomodoroCount: num
            });
        },
        //port: chrome.extension.connect(),

        init: function () {
            // listen for messages
            window.addEventListener("message", App.eventHandler, false);
            
            // Every 1000 millisections, run this function
            // Explain 
            setInterval(function () {
                if ($("pomodoro .pomodoro-timer_buttons button").html() != 'RESUME') {
                    App.lastTimerCount = $('pomodoro .pomodoro-timer span').html();
                }
            }, 1000);


            $(window).on('unload', function () {
                if (App.isRunning) {
                    App.stop();
                }
            });

        },

        start: function () {
            this.isRunning = true;
        },

        stop: function () {
            this.isRunning = false;
            var currentCount = $('pomodoro .pomodoro-timer span').html();
            if (this.lastTimerCount != currentCount) {
                this.pomInterrupted();
            }
            window.removeEventListener("message", App.eventHandler);
        },
        pomDone: function (num) {
            browser.sendMessage({
                type: "pomTracker.pomodoro.done",
                pomodoroCount: num
            });
        },
        pomInterrupted: function () {
            browser.sendMessage({type: "pomTracker.pomodoro.stopped"});
        },

        // When our eventListener detects a message, process it
        eventHandler: function(event) {
            // We only accept messages from ourselves
            if (event.source != window)
                return;

            if (!event.data.type) {
                return;
            }
/*
 * Problem - this doesn't trigger when you actually stop a timer, but it does trigger when you
 * finish a Pomodoro or break
 * What message is it sending?
 * /
            if(event.data.type == "pomodoro_timer_stopped") {
                App.pomInterrupted();
            } else if(event.data.type == "pomodoro_timer_finished") {
                if(event.data.args[0] == 'pomodoro') {
                    App.pomDone(event.data.args[1]);
                } else {
                    App.breakStopped(event.data.args[0]);
                }
            } else if(event.data.type == "pomodoro_timer_started") {
                if(event.data.args[0] == 'pomodoro') {
                    App.pomStarted(event.data.args[1]);
                } else {
                    App.breakStarted(event.data.args[0]);
                }
            }
        }
    };

    App.init();

});
